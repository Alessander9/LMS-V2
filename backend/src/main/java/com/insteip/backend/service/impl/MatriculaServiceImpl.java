package com.insteip.backend.service.impl;

import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.matricula.MatriculaRequestDTO;
import com.insteip.backend.domain.dto.matricula.MatriculaResponseDTO;
import com.insteip.backend.domain.dto.matricula.ModuloAccesoDTO;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.MatriculaService;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.NotificacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaServiceImpl implements MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final ModuloRepository moduloRepository;
    private final MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;
    private final AuditoriaService auditoriaService;
    private final NotificacionService notificacionService;

    @Override
    @Transactional
    public MatriculaResponseDTO matricularAlumno(MatriculaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + dto.usuarioId()));

        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + dto.cursoId()));

        // Check if already enrolled
        if (matriculaRepository.existsByUsuarioIdAndCursoId(dto.usuarioId(), dto.cursoId())) {
            throw new BadRequestException("El alumno ya se encuentra matriculado en este curso.");
        }

        // Check if user's subscription level is allowed for the course
        if (usuario.getNivelSuscripcion() == null || curso.getNivelesSuscripcion() == null ||
                !curso.getNivelesSuscripcion().contains(usuario.getNivelSuscripcion())) {
            throw new RuntimeException("El alumno no cuenta con el nivel de suscripción requerido para este curso.");
        }

        Matricula matricula = Matricula.builder()
                .usuario(usuario)
                .curso(curso)
                .estado(true)
                .build();

        Matricula saved = matriculaRepository.save(matricula);

        // Si se especificó restricción de acceso inicial por módulos
        if (Boolean.FALSE.equals(dto.accesoTotal()) || (dto.modulosHabilitadosIds() != null && !dto.modulosHabilitadosIds().isEmpty())) {
            List<Modulo> modulosCurso = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
            List<Long> habilitados = dto.modulosHabilitadosIds() != null ? dto.modulosHabilitadosIds() : List.of();
            List<MatriculaModuloAcceso> accesosIniciales = new ArrayList<>();
            
            for (Modulo m : modulosCurso) {
                boolean estaHabilitado = habilitados.contains(m.getId());
                accesosIniciales.add(MatriculaModuloAcceso.builder()
                        .matricula(saved)
                        .modulo(m)
                        .habilitado(estaHabilitado)
                        .fechaHabilitacion(LocalDateTime.now())
                        .build());
            }
            if (!accesosIniciales.isEmpty()) {
                matriculaModuloAccesoRepository.saveAll(accesosIniciales);
            }
        }

        auditoriaService.registrarEvento("MATRICULA", "CREAR", "Matriculado alumno ID: " + saved.getUsuario().getId() + " (" + saved.getUsuario().getCorreo() + ") en curso ID: " + saved.getCurso().getId() + " (" + saved.getCurso().getNombre() + ")");

        notificacionService.crearNotificacion(
                usuario.getId(),
                "🔑 Matrícula Habilitada",
                "¡Bienvenido al curso '" + curso.getNombre() + "'! Tu acceso ha sido registrado exitosamente.",
                "MATRICULA_NUEVA",
                "/dashboard/cursos-play/" + curso.getId(),
                "auto_stories"
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarMatriculadosPorCurso(Long cursoId) {
        return matriculaRepository.findByCursoId(cursoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarMatriculadosPorUsuario(Long usuarioId) {
        return matriculaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cambiarEstado(Long matriculaId, Boolean estado) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));
        matricula.setEstado(estado);
        Matricula saved = matriculaRepository.save(matricula);
        auditoriaService.registrarEvento("MATRICULAS", estado ? "REACTIVAR" : "DAR_DE_BAJA", 
                (estado ? "Reactivada" : "Dada de baja") + " matrícula ID: " + saved.getId() + " para alumno ID: " + saved.getUsuario().getId() + " en curso ID: " + saved.getCurso().getId());
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + id));

        String info = "Matrícula ID: " + id + " | Alumno: " + matricula.getUsuario().getNombres() + " " + matricula.getUsuario().getApellidos()
                + " | Curso: " + matricula.getCurso().getNombre();

        matriculaModuloAccesoRepository.deleteByMatriculaId(id);
        matriculaRepository.deleteById(id);
        auditoriaService.registrarEvento("MATRICULAS", "ELIMINAR", "Eliminada físicamente " + info);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuloAccesoDTO> listarModulosAcceso(Long matriculaId) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));

        List<Modulo> modulosCurso = moduloRepository.findByCursoIdOrderByOrdenAsc(matricula.getCurso().getId());
        List<MatriculaModuloAcceso> accesosExistentes = matriculaModuloAccesoRepository.findByMatriculaId(matriculaId);

        boolean tieneRestriccionesConfiguradas = !accesosExistentes.isEmpty();
        Map<Long, MatriculaModuloAcceso> mapaAccesos = accesosExistentes.stream()
                .collect(Collectors.toMap(a -> a.getModulo().getId(), a -> a, (a1, a2) -> a1));

        List<ModuloAccesoDTO> resultado = new ArrayList<>();
        for (Modulo m : modulosCurso) {
            if (Boolean.FALSE.equals(m.getEstado())) continue;

            if (!tieneRestriccionesConfiguradas) {
                // Alumno sin restricciones configuradas (Acceso Total por defecto)
                resultado.add(new ModuloAccesoDTO(
                        m.getId(),
                        m.getNombre(),
                        m.getOrden(),
                        true,
                        matricula.getFechaMatricula()
                ));
            } else {
                // Alumno con restricciones explícitas
                MatriculaModuloAcceso acc = mapaAccesos.get(m.getId());
                if (acc != null) {
                    resultado.add(new ModuloAccesoDTO(
                            m.getId(),
                            m.getNombre(),
                            m.getOrden(),
                            acc.getHabilitado(),
                            acc.getFechaHabilitacion()
                    ));
                } else {
                    // Módulo nuevo agregado con posterioridad a un alumno con restricciones -> bloqueado por defecto
                    resultado.add(new ModuloAccesoDTO(
                            m.getId(),
                            m.getNombre(),
                            m.getOrden(),
                            false,
                            null
                    ));
                }
            }
        }

        return resultado;
    }

    @Override
    @Transactional
    public void actualizarModuloAcceso(Long matriculaId, Long moduloId, Boolean habilitado) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));

        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId));

        // Si es la primera vez que se define una restricción en esta matrícula, inicializar los demás módulos como habilitados en lote
        List<MatriculaModuloAcceso> accesosExistentes = matriculaModuloAccesoRepository.findByMatriculaId(matriculaId);
        if (accesosExistentes.isEmpty()) {
            List<Modulo> todosLosModulos = moduloRepository.findByCursoIdOrderByOrdenAsc(matricula.getCurso().getId());
            List<MatriculaModuloAcceso> listaInicial = new ArrayList<>();
            for (Modulo m : todosLosModulos) {
                if (m.getId().equals(moduloId)) continue;
                listaInicial.add(MatriculaModuloAcceso.builder()
                        .matricula(matricula)
                        .modulo(m)
                        .habilitado(true)
                        .fechaHabilitacion(matricula.getFechaMatricula())
                        .build());
            }
            if (!listaInicial.isEmpty()) {
                matriculaModuloAccesoRepository.saveAll(listaInicial);
            }
        }

        MatriculaModuloAcceso acceso = matriculaModuloAccesoRepository
                .findByMatriculaIdAndModuloId(matriculaId, moduloId)
                .orElse(MatriculaModuloAcceso.builder()
                        .matricula(matricula)
                        .modulo(modulo)
                        .build());

        acceso.setHabilitado(habilitado);
        acceso.setFechaHabilitacion(LocalDateTime.now());
        matriculaModuloAccesoRepository.save(acceso);

        auditoriaService.registrarEvento("MATRICULAS", "MODULO_ACCESO_MODIFICADO",
                (habilitado ? "Habilitado" : "Bloqueado") + " acceso al Módulo '" + modulo.getNombre() +
                        "' para el alumno " + matricula.getUsuario().getCorreo() + " (Matrícula ID: " + matriculaId + ")");
    }

    @Override
    @Transactional
    public void actualizarModulosAccesoMasivo(Long matriculaId, List<Long> modulosHabilitadosIds) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));

        List<Modulo> todosLosModulos = moduloRepository.findByCursoIdOrderByOrdenAsc(matricula.getCurso().getId());
        List<Long> habilitados = modulosHabilitadosIds != null ? modulosHabilitadosIds : List.of();

        List<MatriculaModuloAcceso> accesosExistentes = matriculaModuloAccesoRepository.findByMatriculaId(matriculaId);
        Map<Long, MatriculaModuloAcceso> mapaAccesos = accesosExistentes.stream()
                .collect(Collectors.toMap(a -> a.getModulo().getId(), a -> a, (a1, a2) -> a1));

        List<MatriculaModuloAcceso> aGuardar = new ArrayList<>();
        for (Modulo m : todosLosModulos) {
            boolean debeHabilitar = habilitados.contains(m.getId());
            MatriculaModuloAcceso acc = mapaAccesos.get(m.getId());
            if (acc == null) {
                acc = MatriculaModuloAcceso.builder()
                        .matricula(matricula)
                        .modulo(m)
                        .build();
            }
            acc.setHabilitado(debeHabilitar);
            acc.setFechaHabilitacion(LocalDateTime.now());
            aGuardar.add(acc);
        }

        matriculaModuloAccesoRepository.saveAll(aGuardar);

        auditoriaService.registrarEvento("MATRICULAS", "MODULOS_ACCESO_MASIVO",
                "Actualizados permisos de módulos para la matrícula ID: " + matriculaId + " (" + habilitados.size() + " módulos habilitados)");
    }

    private MatriculaResponseDTO toResponse(Matricula m) {
        LocalDateTime fMatricula = m.getFechaMatricula() != null ? m.getFechaMatricula() : LocalDateTime.now();
        LocalDateTime fExpiracion = m.getFechaExpiracion() != null ? m.getFechaExpiracion() : fMatricula.plusMonths(12);
        
        long diasRestantes = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), fExpiracion);
        String alerta = "OK";
        if (diasRestantes <= 0) {
            alerta = "EXPIRADO";
        } else if (diasRestantes <= 7) {
            alerta = "URGENTE_7_DIAS";
        } else if (diasRestantes <= 30) {
            alerta = "PROXIMO_30_DIAS";
        }

        String docenteNombre = null;
        if (m.getCurso() != null && m.getCurso().getDocente() != null) {
            docenteNombre = m.getCurso().getDocente().getNombres() + " " + m.getCurso().getDocente().getApellidos();
        }

        return new MatriculaResponseDTO(
                m.getId(),
                m.getUsuario().getId(),
                m.getUsuario().getNombres(),
                m.getUsuario().getApellidos(),
                m.getUsuario().getCorreo(),
                m.getUsuario().getTelefono(),
                m.getCurso().getId(),
                m.getCurso().getNombre(),
                docenteNombre,
                fMatricula,
                fExpiracion,
                diasRestantes,
                alerta,
                m.getEstado()
        );
    }
}
