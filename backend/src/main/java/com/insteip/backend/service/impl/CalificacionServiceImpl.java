package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.academico.CalificacionDtos.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.CalificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalificacionServiceImpl implements CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final EvaluacionConfigRepository evaluacionConfigRepository;
    private final MatriculaAcademicaRepository matriculaAcademicaRepository;
    private final HistorialCambioNotaRepository historialCambioNotaRepository;
    private final CursoRepository cursoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final UsuarioRepository usuarioRepository;

    private static final Set<String> ESCALAS_LITERALES_VALIDAS = new HashSet<>(Arrays.asList("AD", "A", "B", "C"));

    @Override
    @Transactional
    public EvaluacionConfigResponse crearEvaluacionConfig(EvaluacionConfigRequest request) {
        Curso curso = cursoRepository.findById(request.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + request.getCursoId()));
        PeriodoAcademico periodo = periodoAcademicoRepository.findById(request.getPeriodoAcademicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo Académico no encontrado con ID: " + request.getPeriodoAcademicoId()));

        String tipoEscala = (request.getTipoEscala() != null && !request.getTipoEscala().trim().isEmpty())
                ? request.getTipoEscala().toUpperCase()
                : "LITERAL";

        if (!"LITERAL".equals(tipoEscala) && !"VIGESIMAL".equals(tipoEscala)) {
            throw new BadRequestException("El tipo de escala debe ser 'LITERAL' (AD, A, B, C) o 'VIGESIMAL' (0 a 20).");
        }

        EvaluacionConfig config = EvaluacionConfig.builder()
                .curso(curso)
                .periodoAcademico(periodo)
                .nombre(request.getNombre().trim())
                .tipoEscala(tipoEscala)
                .pesoPorcentual(request.getPesoPorcentual() != null ? request.getPesoPorcentual() : new BigDecimal("100.00"))
                .orden(request.getOrden() != null ? request.getOrden() : 1)
                .activo(true)
                .build();

        config = evaluacionConfigRepository.save(config);
        return mapearEvaluacionConfigResponse(config);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluacionConfigResponse> listarEvaluacionesPorCursoYPeriodo(Long cursoId, Long periodoId) {
        return evaluacionConfigRepository.findByCursoIdAndPeriodoAcademicoIdAndActivoTrueOrderByOrdenAsc(cursoId, periodoId)
                .stream().map(this::mapearEvaluacionConfigResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CalificacionItemResponse registrarCalificacion(RegistroCalificacionRequest request, Long docenteId) {
        MatriculaAcademica matricula = matriculaAcademicaRepository.findById(request.getMatriculaAcademicaId())
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula académica no encontrada con ID: " + request.getMatriculaAcademicaId()));

        EvaluacionConfig evaluacion = evaluacionConfigRepository.findById(request.getEvaluacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Evaluación no encontrada con ID: " + request.getEvaluacionId()));

        Usuario docente = usuarioRepository.findById(docenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con ID: " + docenteId));

        validarCalificacionSegunEscala(evaluacion.getTipoEscala(), request.getValorNumerico(), request.getValorLiteral());

        Optional<Calificacion> califExistente = calificacionRepository.findByMatriculaAcademicaIdAndEvaluacionId(matricula.getId(), evaluacion.getId());
        Calificacion calificacion;

        if (califExistente.isPresent()) {
            calificacion = califExistente.get();
            calificacion.setValorNumerico(request.getValorNumerico());
            calificacion.setValorLiteral(request.getValorLiteral() != null ? request.getValorLiteral().toUpperCase() : null);
            calificacion.setDocente(docente);
            calificacion.setObservacion(request.getObservacion());
        } else {
            calificacion = Calificacion.builder()
                    .matriculaAcademica(matricula)
                    .evaluacion(evaluacion)
                    .valorNumerico(request.getValorNumerico())
                    .valorLiteral(request.getValorLiteral() != null ? request.getValorLiteral().toUpperCase() : null)
                    .docente(docente)
                    .observacion(request.getObservacion())
                    .build();
        }

        calificacion = calificacionRepository.save(calificacion);
        return mapearCalificacionItem(calificacion);
    }

    @Override
    @Transactional
    public CalificacionItemResponse modificarCalificacion(Long calificacionId, ModificarCalificacionRequest request, Long usuarioId) {
        if (request.getMotivoJustificacion() == null || request.getMotivoJustificacion().trim().isEmpty()) {
            throw new BadRequestException("El motivo de la modificación es obligatorio para la auditoría académica.");
        }

        Calificacion calificacion = calificacionRepository.findById(calificacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Calificación no encontrada con ID: " + calificacionId));

        Usuario modificadoPor = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));

        validarCalificacionSegunEscala(calificacion.getEvaluacion().getTipoEscala(), request.getNuevoValorNumerico(), request.getNuevoValorLiteral());

        // 1. Guardar registro en historial inmutable de auditoría
        HistorialCambioNota historial = HistorialCambioNota.builder()
                .calificacion(calificacion)
                .notaAnteriorNum(calificacion.getValorNumerico())
                .notaAnteriorLit(calificacion.getValorLiteral())
                .notaNuevaNum(request.getNuevoValorNumerico())
                .notaNuevaLit(request.getNuevoValorLiteral() != null ? request.getNuevoValorLiteral().toUpperCase() : null)
                .modificadoPor(modificadoPor)
                .motivoJustificacion(request.getMotivoJustificacion().trim())
                .build();
        historialCambioNotaRepository.save(historial);

        // 2. Aplicar cambio en la calificación activa
        calificacion.setValorNumerico(request.getNuevoValorNumerico());
        calificacion.setValorLiteral(request.getNuevoValorLiteral() != null ? request.getNuevoValorLiteral().toUpperCase() : null);
        calificacion = calificacionRepository.save(calificacion);

        return mapearCalificacionItem(calificacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialCambioResponse> obtenerHistorialModificaciones(Long calificacionId) {
        return historialCambioNotaRepository.listarHistorialPorCalificacion(calificacionId)
                .stream()
                .map(h -> HistorialCambioResponse.builder()
                        .id(h.getId())
                        .calificacionId(h.getCalificacion().getId())
                        .notaAnteriorNum(h.getNotaAnteriorNum())
                        .notaAnteriorLit(h.getNotaAnteriorLit())
                        .notaNuevaNum(h.getNotaNuevaNum())
                        .notaNuevaLit(h.getNotaNuevaLit())
                        .modificadoPorNombre(h.getModificadoPor().getNombres() + " " + h.getModificadoPor().getApellidos())
                        .fechaModificacion(h.getFechaModificacion())
                        .motivoJustificacion(h.getMotivoJustificacion())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BoletaNotasEstudianteResponse generarBoletaNotas(Long matriculaAcademicaId) {
        MatriculaAcademica matricula = matriculaAcademicaRepository.findById(matriculaAcademicaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula académica no encontrada con ID: " + matriculaAcademicaId));

        EstudiantePerfil est = matricula.getEstudiante();
        List<Calificacion> calificaciones = calificacionRepository.listarCalificacionesPorMatricula(matricula.getId());

        List<CalificacionItemResponse> items = calificaciones.stream()
                .map(this::mapearCalificacionItem)
                .collect(Collectors.toList());

        String tipoEscala = "LITERAL";
        if (!calificaciones.isEmpty() && "VIGESIMAL".equalsIgnoreCase(calificaciones.get(0).getEvaluacion().getTipoEscala())) {
            tipoEscala = "VIGESIMAL";
        }

        BigDecimal promedioFinalNum = null;
        String promedioFinalLit = null;
        String estadoAprobacion = "EN_PROCESO";
        String conclusion = "El estudiante continúa desarrollando sus competencias formativas.";

        if ("VIGESIMAL".equalsIgnoreCase(tipoEscala)) {
            // Cálculo de promedio ponderado para institutos
            BigDecimal sumaPonderada = BigDecimal.ZERO;
            BigDecimal sumaPesos = BigDecimal.ZERO;

            for (Calificacion c : calificaciones) {
                if (c.getValorNumerico() != null) {
                    BigDecimal peso = c.getEvaluacion().getPesoPorcentual() != null ? c.getEvaluacion().getPesoPorcentual() : BigDecimal.ONE;
                    sumaPonderada = sumaPonderada.add(c.getValorNumerico().multiply(peso));
                    sumaPesos = sumaPesos.add(peso);
                }
            }

            if (sumaPesos.compareTo(BigDecimal.ZERO) > 0) {
                promedioFinalNum = sumaPonderada.divide(sumaPesos, 2, RoundingMode.HALF_UP);
                if (promedioFinalNum.compareTo(new BigDecimal("13.00")) >= 0) {
                    estadoAprobacion = "APROBADO";
                    conclusion = "El estudiante ha superado satisfactoriamente los objetivos del plan de estudios con promedio de " + promedioFinalNum + " / 20.00.";
                } else {
                    estadoAprobacion = "DESAPROBADO";
                    conclusion = "El estudiante no alcanzó la nota mínima aprobatoria de 13.00 (Promedio obtenido: " + promedioFinalNum + "). Requiere recuperación académica.";
                }
            }
        } else {
            // Cálculo cualitativo de promedios para colegios (AD, A, B, C)
            Map<String, Integer> conteo = new HashMap<>();
            for (Calificacion c : calificaciones) {
                if (c.getValorLiteral() != null) {
                    String nota = c.getValorLiteral().toUpperCase();
                    conteo.put(nota, conteo.getOrDefault(nota, 0) + 1);
                }
            }

            int countAD = conteo.getOrDefault("AD", 0);
            int countA = conteo.getOrDefault("A", 0);
            int countB = conteo.getOrDefault("B", 0);
            int countC = conteo.getOrDefault("C", 0);
            int total = countAD + countA + countB + countC;

            if (total > 0) {
                if (countAD >= total / 2.0 && countC == 0) {
                    promedioFinalLit = "AD";
                    estadoAprobacion = "APROBADO (LOGRO DESTACADO)";
                    conclusion = "Nivel AD: El estudiante evidencia un nivel superior a lo esperado respecto a las competencias evaluadas.";
                } else if ((countAD + countA) >= total / 2.0 && countC == 0) {
                    promedioFinalLit = "A";
                    estadoAprobacion = "APROBADO (LOGRO ESPERADO)";
                    conclusion = "Nivel A: El estudiante cumple satisfactoriamente el nivel esperado en el periodo evaluado.";
                } else if (countC >= total / 2.0) {
                    promedioFinalLit = "C";
                    estadoAprobacion = "EN INICIO";
                    conclusion = "Nivel C: El estudiante muestra un progreso incipiente. Requiere acompañamiento pedagógico reforzado.";
                } else {
                    promedioFinalLit = "B";
                    estadoAprobacion = "EN PROCESO";
                    conclusion = "Nivel B: El estudiante se encuentra próximo o cerca al nivel esperado, requiriendo acompañamiento durante el proceso.";
                }
            }
        }

        return BoletaNotasEstudianteResponse.builder()
                .estudianteId(est.getId())
                .codigoEstudiante(est.getCodigoEstudiante())
                .estudianteNombre(est.getUsuario().getNombres() + " " + est.getUsuario().getApellidos())
                .dni(est.getDni())
                .nivel(matricula.getSeccionGrado().getNivel())
                .gradoOSeccion(matricula.getSeccionGrado().getGradoOCiclo() + " - " + matricula.getSeccionGrado().getSeccion())
                .periodoNombre(matricula.getPeriodoAcademico().getNombre())
                .tipoInstitucion(matricula.getPeriodoAcademico().getTipoInstitucion())
                .tipoEscala(tipoEscala)
                .calificaciones(items)
                .promedioFinalNumerico(promedioFinalNum)
                .promedioFinalLiteral(promedioFinalLit)
                .estadoAprobacion(estadoAprobacion)
                .conclusionDescriptiva(conclusion)
                .build();
    }

    private void validarCalificacionSegunEscala(String tipoEscala, BigDecimal valorNumerico, String valorLiteral) {
        if ("LITERAL".equalsIgnoreCase(tipoEscala)) {
            if (valorLiteral == null || !ESCALAS_LITERALES_VALIDAS.contains(valorLiteral.trim().toUpperCase())) {
                throw new BadRequestException("Para la escala de Colegio (LITERAL), la calificación debe ser una de las siguientes: AD, A, B, C.");
            }
        } else if ("VIGESIMAL".equalsIgnoreCase(tipoEscala)) {
            if (valorNumerico == null) {
                throw new BadRequestException("Para la escala de Instituto (VIGESIMAL), se requiere un valor numérico.");
            }
            if (valorNumerico.compareTo(BigDecimal.ZERO) < 0 || valorNumerico.compareTo(new BigDecimal("20.00")) > 0) {
                throw new BadRequestException("La calificación vigesimal debe estar en el rango de 0.00 a 20.00 puntos.");
            }
        }
    }

    private EvaluacionConfigResponse mapearEvaluacionConfigResponse(EvaluacionConfig c) {
        return EvaluacionConfigResponse.builder()
                .id(c.getId())
                .cursoId(c.getCurso().getId())
                .cursoNombre(c.getCurso().getNombre())
                .periodoAcademicoId(c.getPeriodoAcademico().getId())
                .periodoNombre(c.getPeriodoAcademico().getNombre())
                .nombre(c.getNombre())
                .tipoEscala(c.getTipoEscala())
                .pesoPorcentual(c.getPesoPorcentual())
                .orden(c.getOrden())
                .activo(c.getActivo())
                .build();
    }

    private CalificacionItemResponse mapearCalificacionItem(Calificacion c) {
        return CalificacionItemResponse.builder()
                .calificacionId(c.getId())
                .evaluacionId(c.getEvaluacion().getId())
                .evaluacionNombre(c.getEvaluacion().getNombre())
                .tipoEscala(c.getEvaluacion().getTipoEscala())
                .pesoPorcentual(c.getEvaluacion().getPesoPorcentual())
                .valorNumerico(c.getValorNumerico())
                .valorLiteral(c.getValorLiteral())
                .docenteNombre(c.getDocente() != null ? c.getDocente().getNombres() + " " + c.getDocente().getApellidos() : "Sistema")
                .fechaRegistro(c.getFechaRegistro())
                .observacion(c.getObservacion())
                .build();
    }
}
