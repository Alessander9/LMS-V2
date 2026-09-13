package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.academico.AsistenciaDtos.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AsistenciaQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsistenciaQrServiceImpl implements AsistenciaQrService {

    private final AsistenciaRepository asistenciaRepository;
    private final SesionClaseRepository sesionClaseRepository;
    private final EstudiantePerfilRepository estudianteRepository;
    private final CursoRepository cursoRepository;
    private final SeccionGradoRepository seccionGradoRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public SesionClaseResponse crearSesionClase(CrearSesionClaseRequest request, Long docenteId) {
        Curso curso = cursoRepository.findById(request.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + request.getCursoId()));
        SeccionGrado seccion = seccionGradoRepository.findById(request.getSeccionGradoId())
                .orElseThrow(() -> new ResourceNotFoundException("Sección no encontrada con ID: " + request.getSeccionGradoId()));
        Usuario docente = usuarioRepository.findById(docenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con ID: " + docenteId));

        String qrToken = "QR_SES_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        SesionClase sesion = SesionClase.builder()
                .curso(curso)
                .seccionGrado(seccion)
                .docente(docente)
                .fecha(request.getFecha())
                .horaInicio(request.getHoraInicio())
                .horaFin(request.getHoraFin())
                .tema(request.getTema())
                .qrSesionToken(qrToken)
                .estado("ABIERTA")
                .build();

        sesion = sesionClaseRepository.save(sesion);
        return mapearSesionResponse(sesion);
    }

    @Override
    @Transactional(readOnly = true)
    public SesionClaseResponse obtenerSesionPorId(Long sesionId) {
        SesionClase s = sesionClaseRepository.findById(sesionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión de clase no encontrada con ID: " + sesionId));
        return mapearSesionResponse(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SesionClaseResponse> listarSesionesPorCursoYSeccion(Long cursoId, Long seccionId) {
        return sesionClaseRepository.findByCursoIdAndSeccionGradoIdOrderByFechaDesc(cursoId, seccionId)
                .stream().map(this::mapearSesionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MarcacionResponse marcarAsistenciaPorQr(MarcacionQrRequest request) {
        if (request.getQrToken() == null || request.getQrToken().trim().isEmpty()) {
            throw new BadRequestException("El token QR es obligatorio para registrar la asistencia.");
        }

        String token = request.getQrToken().trim();
        EstudiantePerfil estudiante;
        SesionClase sesion;

        // Caso A: Token de carnet de estudiante
        Optional<EstudiantePerfil> estudianteOpt = estudianteRepository.findByQrToken(token);
        if (estudianteOpt.isPresent()) {
            estudiante = estudianteOpt.get();
            if (request.getSesionId() == null) {
                throw new BadRequestException("Debe especificar el ID de sesión activa para escanear el carnet.");
            }
            sesion = sesionClaseRepository.findById(request.getSesionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sesión de clase no encontrada con ID: " + request.getSesionId()));
        } else {
            // Caso B: Token de sesión proyectada en clase
            Optional<SesionClase> sesionOpt = sesionClaseRepository.findByQrSesionToken(token);
            if (sesionOpt.isPresent()) {
                sesion = sesionOpt.get();
                if (request.getSesionId() != null && !request.getSesionId().equals(sesion.getId())) {
                    throw new BadRequestException("El código QR no corresponde a la sesión seleccionada.");
                }
                // Si el estudiante envía su ID por autenticación o en la petición
                throw new BadRequestException("Token de sesión recibido. Utilice el escáner del carnet del estudiante.");
            } else {
                throw new ResourceNotFoundException("Código QR inválido o no reconocido.");
            }
        }

        // Verificar duplicidad en la sesión
        Optional<Asistencia> asistenciaExistente = asistenciaRepository.findBySesionIdAndEstudianteId(sesion.getId(), estudiante.getId());
        Asistencia asistencia;
        String mensaje;

        String estado = (request.getEstado() != null && !request.getEstado().trim().isEmpty())
                ? request.getEstado().toUpperCase()
                : "PRESENTE";

        String metodo = (request.getMetodo() != null && !request.getMetodo().trim().isEmpty())
                ? request.getMetodo().toUpperCase()
                : "QR_SCAN";

        if (asistenciaExistente.isPresent()) {
            asistencia = asistenciaExistente.get();
            asistencia.setEstado(estado);
            asistencia.setMetodoMarcacion(metodo);
            if (request.getObservaciones() != null) {
                asistencia.setObservaciones(request.getObservaciones());
            }
            asistencia = asistenciaRepository.save(asistencia);
            mensaje = "Asistencia actualizada correctamente a: " + estado;
        } else {
            asistencia = Asistencia.builder()
                    .sesion(sesion)
                    .estudiante(estudiante)
                    .estado(estado)
                    .metodoMarcacion(metodo)
                    .observaciones(request.getObservaciones() != null ? request.getObservaciones() : "Marcación registrada por código QR")
                    .build();
            asistencia = asistenciaRepository.save(asistencia);
            mensaje = "¡Asistencia registrada exitosamente! Estado: " + estado;
        }

        return MarcacionResponse.builder()
                .asistenciaId(asistencia.getId())
                .sesionId(sesion.getId())
                .estudianteId(estudiante.getId())
                .estudianteNombre(estudiante.getUsuario().getNombres() + " " + estudiante.getUsuario().getApellidos())
                .dni(estudiante.getDni())
                .estado(asistencia.getEstado())
                .metodoMarcacion(asistencia.getMetodoMarcacion())
                .fechaHoraMarcacion(asistencia.getFechaHoraMarcacion())
                .mensaje(mensaje)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsistenciaItemResponse> listarAsistenciaPorSesion(Long sesionId) {
        return asistenciaRepository.listarPorSesionConEstudiante(sesionId)
                .stream()
                .map(a -> AsistenciaItemResponse.builder()
                        .asistenciaId(a.getId())
                        .estudianteId(a.getEstudiante().getId())
                        .codigoEstudiante(a.getEstudiante().getCodigoEstudiante())
                        .estudianteNombres(a.getEstudiante().getUsuario().getNombres())
                        .estudianteApellidos(a.getEstudiante().getUsuario().getApellidos())
                        .dni(a.getEstudiante().getDni())
                        .estado(a.getEstado())
                        .metodoMarcacion(a.getMetodoMarcacion())
                        .fechaHoraMarcacion(a.getFechaHoraMarcacion())
                        .observaciones(a.getObservaciones())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenAsistenciaEstudiante obtenerResumenEstudiante(Long estudianteId) {
        EstudiantePerfil est = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + estudianteId));

        List<Asistencia> historial = asistenciaRepository.findByEstudianteIdOrderByFechaHoraMarcacionDesc(estudianteId);
        long total = historial.size();
        long presentes = historial.stream().filter(a -> "PRESENTE".equalsIgnoreCase(a.getEstado())).count();
        long tardanzas = historial.stream().filter(a -> "TARDANZA".equalsIgnoreCase(a.getEstado())).count();
        long faltas = historial.stream().filter(a -> "FALTA_INJUSTIFICADA".equalsIgnoreCase(a.getEstado()) || "FALTA".equalsIgnoreCase(a.getEstado())).count();
        long justificaciones = historial.stream().filter(a -> "FALTA_JUSTIFICADA".equalsIgnoreCase(a.getEstado())).count();

        // 1 tardanza equivale a 0.5 o computa proporcional
        double asistenciasEfectivas = presentes + (tardanzas * 0.8) + (justificaciones * 0.5);
        double porcentaje = total > 0 ? Math.round((asistenciasEfectivas / total) * 1000.0) / 10.0 : 100.0;

        List<AsistenciaItemResponse> items = historial.stream().map(a -> AsistenciaItemResponse.builder()
                .asistenciaId(a.getId())
                .estudianteId(est.getId())
                .codigoEstudiante(est.getCodigoEstudiante())
                .estudianteNombres(est.getUsuario().getNombres())
                .estudianteApellidos(est.getUsuario().getApellidos())
                .dni(est.getDni())
                .estado(a.getEstado())
                .metodoMarcacion(a.getMetodoMarcacion())
                .fechaHoraMarcacion(a.getFechaHoraMarcacion())
                .observaciones(a.getObservaciones())
                .build()).collect(Collectors.toList());

        return ResumenAsistenciaEstudiante.builder()
                .estudianteId(est.getId())
                .estudianteNombre(est.getUsuario().getNombres() + " " + est.getUsuario().getApellidos())
                .totalClases(total)
                .asistencias(presentes)
                .tardanzas(tardanzas)
                .faltas(faltas)
                .justificaciones(justificaciones)
                .porcentajeAsistencia(porcentaje)
                .historial(items)
                .build();
    }

    private SesionClaseResponse mapearSesionResponse(SesionClase s) {
        return SesionClaseResponse.builder()
                .id(s.getId())
                .cursoId(s.getCurso().getId())
                .cursoNombre(s.getCurso().getNombre())
                .seccionGradoId(s.getSeccionGrado().getId())
                .gradoOCiclo(s.getSeccionGrado().getGradoOCiclo())
                .seccion(s.getSeccionGrado().getSeccion())
                .docenteId(s.getDocente().getId())
                .docenteNombre(s.getDocente().getNombres() + " " + s.getDocente().getApellidos())
                .fecha(s.getFecha())
                .horaInicio(s.getHoraInicio())
                .horaFin(s.getHoraFin())
                .tema(s.getTema())
                .qrSesionToken(s.getQrSesionToken())
                .estado(s.getEstado())
                .build();
    }
}
