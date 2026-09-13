package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.academico.AsistenciaDtos.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AsistenciaQrServiceImplTest {

    @Mock
    private AsistenciaRepository asistenciaRepository;

    @Mock
    private SesionClaseRepository sesionClaseRepository;

    @Mock
    private EstudiantePerfilRepository estudianteRepository;

    @Mock
    private CursoRepository cursoRepository;

    @Mock
    private SeccionGradoRepository seccionGradoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AsistenciaQrServiceImpl asistenciaQrService;

    private Usuario alumnoUsuario;
    private EstudiantePerfil estudiante;
    private SesionClase sesion;

    @BeforeEach
    void setUp() {
        alumnoUsuario = Usuario.builder()
                .id(10L)
                .nombres("Juan Carlos")
                .apellidos("Pérez López")
                .correo("juan.perez@lmsv2.edu.pe")
                .build();

        estudiante = EstudiantePerfil.builder()
                .id(1L)
                .usuario(alumnoUsuario)
                .codigoEstudiante("EST-2026-001")
                .dni("74859612")
                .qrToken("QR_STU_74859612")
                .build();

        Curso curso = Curso.builder().id(5L).nombre("Comunicación y Lenguaje").build();
        SeccionGrado seccion = SeccionGrado.builder().id(2L).gradoOCiclo("3ro Primaria").seccion("A").build();

        sesion = SesionClase.builder()
                .id(100L)
                .curso(curso)
                .seccionGrado(seccion)
                .docente(alumnoUsuario)
                .fecha(LocalDate.now())
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(9, 30))
                .qrSesionToken("QR_SES_ABC1234567890123")
                .estado("ABIERTA")
                .build();
    }

    @Test
    void marcarAsistenciaPorQr_ConQrTokenEstudiante_DebeRegistrarAsistenciaCorrectamente() {
        MarcacionQrRequest request = MarcacionQrRequest.builder()
                .qrToken("QR_STU_74859612")
                .sesionId(100L)
                .estado("PRESENTE")
                .metodo("QR_SCAN")
                .build();

        when(estudianteRepository.findByQrToken("QR_STU_74859612")).thenReturn(Optional.of(estudiante));
        when(sesionClaseRepository.findById(100L)).thenReturn(Optional.of(sesion));
        when(asistenciaRepository.findBySesionIdAndEstudianteId(100L, 1L)).thenReturn(Optional.empty());

        Asistencia asistenciaGuardada = Asistencia.builder()
                .id(501L)
                .sesion(sesion)
                .estudiante(estudiante)
                .estado("PRESENTE")
                .metodoMarcacion("QR_SCAN")
                .fechaHoraMarcacion(LocalDateTime.now())
                .build();

        when(asistenciaRepository.save(any(Asistencia.class))).thenReturn(asistenciaGuardada);

        MarcacionResponse response = asistenciaQrService.marcarAsistenciaPorQr(request);

        assertNotNull(response);
        assertEquals(501L, response.getAsistenciaId());
        assertEquals("PRESENTE", response.getEstado());
        assertEquals("74859612", response.getDni());
        assertTrue(response.getMensaje().contains("exitosamente"));
    }

    @Test
    void marcarAsistenciaPorQr_ConDni_DebeResolverEstudiante() {
        MarcacionQrRequest request = MarcacionQrRequest.builder()
                .qrToken("74859612")
                .sesionId(100L)
                .estado("PRESENTE")
                .metodo("QR_SCAN")
                .build();

        when(estudianteRepository.findByQrToken("74859612")).thenReturn(Optional.empty());
        when(estudianteRepository.findByCodigoEstudiante("74859612")).thenReturn(Optional.empty());
        when(estudianteRepository.findByDni("74859612")).thenReturn(Optional.of(estudiante));
        when(sesionClaseRepository.findById(100L)).thenReturn(Optional.of(sesion));
        when(asistenciaRepository.findBySesionIdAndEstudianteId(100L, 1L)).thenReturn(Optional.empty());

        Asistencia asistenciaGuardada = Asistencia.builder()
                .id(502L)
                .sesion(sesion)
                .estudiante(estudiante)
                .estado("PRESENTE")
                .metodoMarcacion("QR_SCAN")
                .fechaHoraMarcacion(LocalDateTime.now())
                .build();

        when(asistenciaRepository.save(any(Asistencia.class))).thenReturn(asistenciaGuardada);

        MarcacionResponse response = asistenciaQrService.marcarAsistenciaPorQr(request);

        assertNotNull(response);
        assertEquals(502L, response.getAsistenciaId());
        assertEquals("Juan Carlos Pérez López", response.getEstudianteNombre());
    }

    @Test
    void marcarAsistenciaPorQr_ConPrefixQrStu_DebeResolverPorUsuarioId() {
        MarcacionQrRequest request = MarcacionQrRequest.builder()
                .qrToken("QR_STU_10_juan.perez@lmsv2.edu.pe")
                .sesionId(100L)
                .estado("PRESENTE")
                .metodo("QR_SCAN")
                .build();

        when(estudianteRepository.findByQrToken("QR_STU_10_juan.perez@lmsv2.edu.pe")).thenReturn(Optional.empty());
        when(estudianteRepository.findByCodigoEstudiante("QR_STU_10_juan.perez@lmsv2.edu.pe")).thenReturn(Optional.empty());
        when(estudianteRepository.findByDni("QR_STU_10_juan.perez@lmsv2.edu.pe")).thenReturn(Optional.empty());
        when(estudianteRepository.findByUsuarioId(10L)).thenReturn(Optional.of(estudiante));
        when(sesionClaseRepository.findById(100L)).thenReturn(Optional.of(sesion));
        when(asistenciaRepository.findBySesionIdAndEstudianteId(100L, 1L)).thenReturn(Optional.empty());

        Asistencia asistenciaGuardada = Asistencia.builder()
                .id(503L)
                .sesion(sesion)
                .estudiante(estudiante)
                .estado("PRESENTE")
                .metodoMarcacion("QR_SCAN")
                .fechaHoraMarcacion(LocalDateTime.now())
                .build();

        when(asistenciaRepository.save(any(Asistencia.class))).thenReturn(asistenciaGuardada);

        MarcacionResponse response = asistenciaQrService.marcarAsistenciaPorQr(request);

        assertNotNull(response);
        assertEquals(503L, response.getAsistenciaId());
    }
}
