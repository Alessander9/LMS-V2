package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.tarea.CalificarEntregaDTO;
import com.insteip.backend.domain.dto.tarea.EntregaTareaResponseDTO;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.EntregaTareaService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntregaTareaServiceImpl implements EntregaTareaService {

    private static final long MAX_FILE_SIZE_BYTES = 100L * 1024L * 1024L; // 100MB
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg",
            ".mp4", ".zip", ".xlsx", ".pptx", ".txt",
            ".csv", ".json", ".psd", ".ai", ".svg", ".rar"
    ));
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg",
            "video/mp4",
            "application/zip",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "text/csv",
            "application/json",
            "image/vnd.adobe.photoshop",
            "application/postscript",
            "image/svg+xml",
            "application/vnd.rar"
    ));

    private final TareaRepository tareaRepository;
    private final EntregaTareaRepository entregaTareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;
    private final AuditoriaService auditoriaService;
    private final com.insteip.backend.service.interfaces.NotificacionService notificacionService;

    @Value("${application.storage.path}")
    private String storagePathSetting;

    @Value("${application.api.base-url}")
    private String apiBaseUrl;

    private String UPLOADS_DIR;

    @PostConstruct
    public void init() {
        Path base = Paths.get(storagePathSetting).toAbsolutePath().normalize();
        this.UPLOADS_DIR = base.resolve("tareas").toString();
        try {
            Files.createDirectories(Paths.get(this.UPLOADS_DIR));
        } catch (IOException e) {
            System.err.println("Could not create tareas uploads directory: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public EntregaTareaResponseDTO entregarTarea(Long tareaId, String correoAlumno, String comentario, MultipartFile archivo) {
        Tarea tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + tareaId));

        if (tarea.getEstado() == null || !tarea.getEstado()) {
            throw new BadRequestException("Esta tarea no se encuentra activa");
        }

        Usuario alumno = usuarioRepository.findByCorreo(correoAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Modulo modulo = tarea.getModulo();
        Curso curso = modulo.getCurso();

        // Validar matrícula activa del alumno en el curso
        Matricula matricula = matriculaRepository.findByUsuarioIdAndCursoId(alumno.getId(), curso.getId())
                .orElseThrow(() -> new ForbiddenException("No estás matriculado en este curso para entregar tareas"));

        if (matricula.getEstado() == null || !matricula.getEstado()) {
            throw new ForbiddenException("Tu matrícula en este curso no está activa");
        }

        if (matricula.getFechaExpiracion() != null && LocalDateTime.now().isAfter(matricula.getFechaExpiracion())) {
            throw new ForbiddenException("Tu matrícula en este curso ha expirado");
        }

        LocalDateTime now = LocalDateTime.now();
        Optional<EntregaTarea> entregaOpt = entregaTareaRepository.findByTareaIdAndUsuarioId(tareaId, alumno.getId());

        // Validar si ya entregó y si se permite reenvío
        if (entregaOpt.isPresent()) {
            EntregaTarea existente = entregaOpt.get();
            if (tarea.getPermitirReenvio() != null && !tarea.getPermitirReenvio()) {
                throw new BadRequestException("Esta tarea no permite reenvíos ni modificaciones una vez entregada");
            }
            if (tarea.getFechaLimite() != null && now.isAfter(tarea.getFechaLimite())) {
                throw new BadRequestException("La fecha límite para reenvío de esta tarea ya ha vencido");
            }
            if ("APROBADO".equalsIgnoreCase(existente.getEstado())) {
                throw new BadRequestException("Tu tarea ya fue calificada y aprobada. No es necesario reenviarla");
            }
        }

        validarArchivo(archivo);
        String extension = obtenerExtensionSegura(archivo.getOriginalFilename());
        String internalFilename = UUID.randomUUID().toString() + extension;

        EntregaTarea entrega;
        if (entregaOpt.isPresent()) {
            // Actualización / Reenvío
            entrega = entregaOpt.get();
            // Borrar archivo físico anterior si existe
            if (entrega.getArchivoInterno() != null && !entrega.getArchivoInterno().isBlank()) {
                try {
                    Files.deleteIfExists(Paths.get(UPLOADS_DIR).resolve(entrega.getArchivoInterno()));
                } catch (IOException ignored) {}
            }
            entrega.setArchivoInterno(internalFilename);
            entrega.setTipoArchivo(getCleanContentType(archivo));
            entrega.setPesoBytes(archivo.getSize());
            entrega.setComentarioAlumno(comentario != null ? comentario.trim() : null);
            entrega.setFechaEntrega(now);
            entrega.setEstado("ENTREGADO");
        } else {
            // Nueva Entrega
            entrega = EntregaTarea.builder()
                    .tarea(tarea)
                    .usuario(alumno)
                    .archivoUrl("") // Se setea tras guardar
                    .archivoInterno(internalFilename)
                    .tipoArchivo(getCleanContentType(archivo))
                    .pesoBytes(archivo.getSize())
                    .comentarioAlumno(comentario != null ? comentario.trim() : null)
                    .fechaEntrega(now)
                    .estado("ENTREGADO")
                    .build();
        }

        EntregaTarea guardada = entregaTareaRepository.save(entrega);

        // Guardar archivo en disco
        try {
            Path targetPath = Paths.get(UPLOADS_DIR).resolve(internalFilename);
            Files.copy(archivo.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            if (entregaOpt.isEmpty()) {
                entregaTareaRepository.delete(guardada);
            }
            throw new RuntimeException("Error al guardar el archivo de la tarea en el servidor: " + e.getMessage());
        }

        guardada.setArchivoUrl(apiBaseUrl + "/api/entregas-tareas/" + guardada.getId() + "/download");
        EntregaTarea finalGuardada = entregaTareaRepository.save(guardada);

        auditoriaService.registrarEvento("ENTREGA_TAREA", "ENTREGAR",
                "Alumno " + alumno.getCorreo() + " entregó tarea ID: " + tareaId + " (" + tarea.getTitulo() + ")");

        if (curso != null) {
            String nombreAlumno = (alumno.getNombres() != null ? alumno.getNombres() : "") + " " + (alumno.getApellidos() != null ? alumno.getApellidos() : "");
            notificacionService.notificarDocenteDeCurso(
                    curso.getId(),
                    "📥 Nueva entrega recibida",
                    "El alumno " + nombreAlumno.trim() + " entregó la tarea '" + tarea.getTitulo() + "' en " + (curso.getNombre() != null ? curso.getNombre() : ""),
                    "ENTREGA_DOCENTE",
                    "/dashboard/cursos/" + curso.getId(),
                    "school"
            );
        }

        return convertToResponseDto(finalGuardada);
    }

    @Override
    @Transactional(readOnly = true)
    public EntregaTareaResponseDTO obtenerMiEntrega(Long tareaId, String correoAlumno) {
        Usuario alumno = usuarioRepository.findByCorreo(correoAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        EntregaTarea entrega = entregaTareaRepository.findByTareaIdAndUsuarioId(tareaId, alumno.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No has entregado esta tarea"));

        return convertToResponseDto(entrega);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntregaTareaResponseDTO> listarEntregasPorTarea(Long tareaId) {
        if (!tareaRepository.existsById(tareaId)) {
            throw new ResourceNotFoundException("Tarea no encontrada con ID: " + tareaId);
        }
        return entregaTareaRepository.findByTareaIdOrderByFechaEntregaDesc(tareaId)
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EntregaTareaResponseDTO calificarEntrega(Long entregaId, CalificarEntregaDTO dto) {
        EntregaTarea entrega = entregaTareaRepository.findById(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega de tarea no encontrada con ID: " + entregaId));

        BigDecimal nota = dto.getCalificacion();
        entrega.setCalificacion(nota);
        entrega.setFeedbackDocente(dto.getFeedbackDocente() != null ? dto.getFeedbackDocente().trim() : null);
        entrega.setFechaCalificacion(LocalDateTime.now());

        if (dto.getEstado() != null && !dto.getEstado().isBlank()) {
            entrega.setEstado(dto.getEstado().toUpperCase().trim());
        } else {
            // Regla automática: escala 0 a 20. Nota >= 14 es APROBADO, sino DESAPROBADO
            if (nota.compareTo(BigDecimal.valueOf(14.0)) >= 0) {
                entrega.setEstado("APROBADO");
            } else {
                entrega.setEstado("DESAPROBADO");
            }
        }

        EntregaTarea guardada = entregaTareaRepository.save(entrega);
        auditoriaService.registrarEvento("ENTREGA_TAREA", "CALIFICAR",
                "Calificada entrega ID: " + entregaId + " con nota: " + nota + " (" + guardada.getEstado() + ")");

        // Notificar al alumno de su calificación
        if (entrega.getUsuario() != null && entrega.getTarea() != null) {
            String estadoTexto = "APROBADO".equalsIgnoreCase(guardada.getEstado()) ? "Aprobado" : "Desaprobado";
            notificacionService.crearNotificacion(
                    entrega.getUsuario().getId(),
                    "🟢 Tarea Calificada (" + estadoTexto + ")",
                    "Tu tarea '" + entrega.getTarea().getTitulo() + "' ha sido calificada: Nota " + nota + "/20",
                    "TAREA_CALIFICADA",
                    "/dashboard/mis-tareas",
                    "verified"
            );
        }

        return convertToResponseDto(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] descargarArchivoEntregaBytes(Long entregaId, String correoSolicitante) {
        EntregaTarea entrega = entregaTareaRepository.findById(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + entregaId));

        Usuario solicitante = usuarioRepository.findByCorreo(correoSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        boolean isAdminOrDocente = solicitante.getRol() != null &&
                ("ADMINISTRADOR".equalsIgnoreCase(solicitante.getRol().getNombre()) ||
                 "DOCENTE".equalsIgnoreCase(solicitante.getRol().getNombre()));

        boolean isOwner = entrega.getUsuario().getId().equals(solicitante.getId());

        if (!isAdminOrDocente && !isOwner) {
            throw new ForbiddenException("No tienes permisos para descargar este archivo");
        }

        try {
            Path filePath = Paths.get(UPLOADS_DIR).resolve(entrega.getArchivoInterno());
            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("Archivo físico no encontrado en el servidor para la entrega ID: " + entregaId);
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new ResourceNotFoundException("Error al leer el archivo físico de la entrega: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EntregaTarea obtenerEntregaEntity(Long entregaId) {
        return entregaTareaRepository.findById(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + entregaId));
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("El archivo es obligatorio");
        }

        if (archivo.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("El tamaño del archivo no puede superar los 100MB");
        }

        String originalFilename = archivo.getOriginalFilename();
        if (originalFilename != null) {
            String lowerName = originalFilename.toLowerCase();
            if (lowerName.endsWith(".exe") || lowerName.endsWith(".bat") || lowerName.endsWith(".sh") ||
                lowerName.endsWith(".cmd") || lowerName.endsWith(".msi") || lowerName.endsWith(".com") ||
                lowerName.endsWith(".vbs") || lowerName.endsWith(".scr") || lowerName.endsWith(".pif")) {
                throw new BadRequestException("Los archivos ejecutables no están permitidos");
            }

            boolean hasAllowedExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
            if (!hasAllowedExtension) {
                throw new BadRequestException("Tipo de archivo no permitido. Solo se admiten PDF, DOC, DOCX, PNG, JPG, MP4, ZIP, XLSX, PPTX, TXT, CSV, JSON, PSD, AI, SVG y RAR");
            }

            if (lowerName.contains("..") || lowerName.contains("/") || lowerName.contains("\\")
                    || lowerName.contains("<") || lowerName.contains(">")
                    || lowerName.contains("\"") || lowerName.contains("'")
                    || lowerName.contains(";")) {
                throw new BadRequestException("El nombre del archivo contiene caracteres no permitidos");
            }
        }

        String contentType = archivo.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Tipo MIME no permitido. Solo se admiten formatos seguros (PDF, Word, Imágenes, Videos, Zip)");
        }
    }

    private String getCleanContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return contentType.toLowerCase();
        }

        String name = file.getOriginalFilename();
        if (name != null) {
            String lowerName = name.toLowerCase();
            if (lowerName.endsWith(".pdf")) return "application/pdf";
            if (lowerName.endsWith(".doc")) return "application/msword";
            if (lowerName.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
            if (lowerName.endsWith(".png")) return "image/png";
            if (lowerName.endsWith(".mp4")) return "video/mp4";
            if (lowerName.endsWith(".zip")) return "application/zip";
            if (lowerName.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            if (lowerName.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            if (lowerName.endsWith(".txt")) return "text/plain";
            if (lowerName.endsWith(".csv")) return "text/csv";
            if (lowerName.endsWith(".json")) return "application/json";
            if (lowerName.endsWith(".psd")) return "image/vnd.adobe.photoshop";
            if (lowerName.endsWith(".ai")) return "application/postscript";
            if (lowerName.endsWith(".svg")) return "image/svg+xml";
            if (lowerName.endsWith(".rar")) return "application/vnd.rar";
        }
        return "application/octet-stream";
    }

    private String obtenerExtensionSegura(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BadRequestException("El nombre del archivo es obligatorio");
        }
        String lowerName = originalFilename.toLowerCase();
        if (lowerName.endsWith(".pdf")) return ".pdf";
        if (lowerName.endsWith(".doc")) return ".doc";
        if (lowerName.endsWith(".docx")) return ".docx";
        if (lowerName.endsWith(".png")) return ".png";
        if (lowerName.endsWith(".jpg")) return ".jpg";
        if (lowerName.endsWith(".jpeg")) return ".jpg";
        if (lowerName.endsWith(".mp4")) return ".mp4";
        if (lowerName.endsWith(".zip")) return ".zip";
        if (lowerName.endsWith(".xlsx")) return ".xlsx";
        if (lowerName.endsWith(".pptx")) return ".pptx";
        if (lowerName.endsWith(".txt")) return ".txt";
        if (lowerName.endsWith(".csv")) return ".csv";
        if (lowerName.endsWith(".json")) return ".json";
        if (lowerName.endsWith(".psd")) return ".psd";
        if (lowerName.endsWith(".ai")) return ".ai";
        if (lowerName.endsWith(".svg")) return ".svg";
        if (lowerName.endsWith(".rar")) return ".rar";
        throw new BadRequestException("Tipo de archivo no permitido. Solo se admiten PDF, DOC, DOCX, PNG, JPG, MP4, ZIP, XLSX, PPTX, TXT, CSV, JSON, PSD, AI, SVG y RAR");
    }

    private EntregaTareaResponseDTO convertToResponseDto(EntregaTarea e) {
        String alumnoNombre = e.getUsuario() != null
                ? (e.getUsuario().getNombres() + " " + e.getUsuario().getApellidos()).trim()
                : "Alumno";
        String alumnoCorreo = e.getUsuario() != null ? e.getUsuario().getCorreo() : "";

        return EntregaTareaResponseDTO.builder()
                .id(e.getId())
                .tareaId(e.getTarea().getId())
                .tareaTitulo(e.getTarea().getTitulo())
                .usuarioId(e.getUsuario().getId())
                .alumnoNombre(alumnoNombre)
                .alumnoCorreo(alumnoCorreo)
                .archivoUrl(e.getArchivoUrl())
                .tipoArchivo(e.getTipoArchivo())
                .pesoBytes(e.getPesoBytes())
                .comentarioAlumno(e.getComentarioAlumno())
                .calificacion(e.getCalificacion())
                .feedbackDocente(e.getFeedbackDocente())
                .fechaEntrega(e.getFechaEntrega())
                .fechaCalificacion(e.getFechaCalificacion())
                .estado(e.getEstado())
                .build();
    }
}
