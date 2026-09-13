package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.academico.CalificacionDtos.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CalificacionServiceImplTest {

    @Mock
    private CalificacionRepository calificacionRepository;

    @Mock
    private EvaluacionConfigRepository evaluacionConfigRepository;

    @Mock
    private MatriculaAcademicaRepository matriculaAcademicaRepository;

    @Mock
    private HistorialCambioNotaRepository historialCambioNotaRepository;

    @Mock
    private CursoRepository cursoRepository;

    @Mock
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CalificacionServiceImpl calificacionService;

    private MatriculaAcademica matricula;
    private Usuario docente;
    private EvaluacionConfig evalColegio;
    private EvaluacionConfig evalInstituto;

    @BeforeEach
    void setUp() {
        Usuario alumnoUser = Usuario.builder().id(10L).nombres("María").apellidos("Gómez").build();
        EstudiantePerfil estudiante = EstudiantePerfil.builder().id(1L).usuario(alumnoUser).codigoEstudiante("EST-2026-002").build();
        docente = Usuario.builder().id(20L).nombres("Prof. Roberto").apellidos("Campos").build();

        Curso cursoColegio = Curso.builder().id(1L).nombre("Ciencias Naturales").build();
        PeriodoAcademico periodo = PeriodoAcademico.builder().id(1L).nombre("Bimestre I 2026").build();

        matricula = MatriculaAcademica.builder()
                .id(500L)
                .estudiante(estudiante)
                .periodoAcademico(periodo)
                .estado("MATRICULADO")
                .build();

        evalColegio = EvaluacionConfig.builder()
                .id(101L)
                .curso(cursoColegio)
                .periodoAcademico(periodo)
                .nombre("Examen Bimestral I")
                .tipoEscala("LITERAL")
                .pesoPorcentual(new BigDecimal("40.00"))
                .build();

        Curso cursoInst = Curso.builder().id(2L).nombre("Desarrollo de Software").build();

        evalInstituto = EvaluacionConfig.builder()
                .id(201L)
                .curso(cursoInst)
                .periodoAcademico(periodo)
                .nombre("Evaluación Continua 1")
                .tipoEscala("VIGESIMAL")
                .pesoPorcentual(new BigDecimal("30.00"))
                .build();
    }

    @Test
    void registrarCalificacion_ColegioConNotaLiteralValida_DebeGuardarExitosamente() {
        RegistroCalificacionRequest req = RegistroCalificacionRequest.builder()
                .matriculaAcademicaId(500L)
                .evaluacionId(101L)
                .valorLiteral("AD")
                .observacion("Excelente logro de aprendizaje")
                .build();

        when(matriculaAcademicaRepository.findById(500L)).thenReturn(Optional.of(matricula));
        when(evaluacionConfigRepository.findById(101L)).thenReturn(Optional.of(evalColegio));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(docente));
        when(calificacionRepository.findByMatriculaAcademicaIdAndEvaluacionId(500L, 101L)).thenReturn(Optional.empty());

        Calificacion saved = Calificacion.builder()
                .id(1L)
                .matriculaAcademica(matricula)
                .evaluacion(evalColegio)
                .valorLiteral("AD")
                .docente(docente)
                .observacion("Excelente logro de aprendizaje")
                .fechaRegistro(LocalDateTime.now())
                .build();

        when(calificacionRepository.save(any(Calificacion.class))).thenReturn(saved);

        CalificacionItemResponse resp = calificacionService.registrarCalificacion(req, 20L);

        assertNotNull(resp);
        assertEquals("AD", resp.getValorLiteral());
        assertEquals("Examen Bimestral I", resp.getEvaluacionNombre());
    }

    @Test
    void registrarCalificacion_ColegioConNotaInvalida_DebeLanzarBadRequest() {
        RegistroCalificacionRequest req = RegistroCalificacionRequest.builder()
                .matriculaAcademicaId(500L)
                .evaluacionId(101L)
                .valorLiteral("F") // F no es válida en MINEDU (AD, A, B, C)
                .build();

        when(matriculaAcademicaRepository.findById(500L)).thenReturn(Optional.of(matricula));
        when(evaluacionConfigRepository.findById(101L)).thenReturn(Optional.of(evalColegio));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(docente));

        assertThrows(BadRequestException.class, () -> calificacionService.registrarCalificacion(req, 20L));
    }

    @Test
    void registrarCalificacion_InstitutoConNotaVigesimalValida_DebeRegistrarCorrectamente() {
        RegistroCalificacionRequest req = RegistroCalificacionRequest.builder()
                .matriculaAcademicaId(500L)
                .evaluacionId(201L)
                .valorNumerico(new BigDecimal("18.50"))
                .build();

        when(matriculaAcademicaRepository.findById(500L)).thenReturn(Optional.of(matricula));
        when(evaluacionConfigRepository.findById(201L)).thenReturn(Optional.of(evalInstituto));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(docente));
        when(calificacionRepository.findByMatriculaAcademicaIdAndEvaluacionId(500L, 201L)).thenReturn(Optional.empty());

        Calificacion saved = Calificacion.builder()
                .id(2L)
                .matriculaAcademica(matricula)
                .evaluacion(evalInstituto)
                .valorNumerico(new BigDecimal("18.50"))
                .docente(docente)
                .fechaRegistro(LocalDateTime.now())
                .build();

        when(calificacionRepository.save(any(Calificacion.class))).thenReturn(saved);

        CalificacionItemResponse resp = calificacionService.registrarCalificacion(req, 20L);

        assertNotNull(resp);
        assertEquals(new BigDecimal("18.50"), resp.getValorNumerico());
    }

    @Test
    void modificarCalificacion_DebeRegistrarAuditoriaEnHistorial() {
        ModificarCalificacionRequest req = ModificarCalificacionRequest.builder()
                .nuevoValorNumerico(new BigDecimal("16.00"))
                .motivoJustificacion("Corrección en reclamo de examen con rúbrica")
                .build();

        Calificacion calExistente = Calificacion.builder()
                .id(50L)
                .matriculaAcademica(matricula)
                .evaluacion(evalInstituto)
                .valorNumerico(new BigDecimal("12.00"))
                .docente(docente)
                .build();

        when(calificacionRepository.findById(50L)).thenReturn(Optional.of(calExistente));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(docente));
        when(calificacionRepository.save(any(Calificacion.class))).thenReturn(calExistente);

        CalificacionItemResponse resp = calificacionService.modificarCalificacion(50L, req, 20L);

        assertNotNull(resp);
        verify(historialCambioNotaRepository, times(1)).save(any(HistorialCambioNota.class));
    }

    @Test
    void modificarCalificacion_SinMotivo_DebeLanzarBadRequest() {
        ModificarCalificacionRequest req = ModificarCalificacionRequest.builder()
                .nuevoValorNumerico(new BigDecimal("16.00"))
                .motivoJustificacion("") // Motivo vacío
                .build();

        assertThrows(BadRequestException.class, () -> calificacionService.modificarCalificacion(50L, req, 20L));
    }
}
