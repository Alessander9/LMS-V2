package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.docente.DocenteEstudianteProgressResponse;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocenteDashboardServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private CursoRepository cursoRepository;
    @Mock private MatriculaRepository matriculaRepository;
    @Mock private AvanceCursoRepository avanceCursoRepository;
    @Mock private AvanceVideoRepository avanceVideoRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private VideoRepository videoRepository;

    @InjectMocks
    private DocenteDashboardServiceImpl docenteDashboardService;

    private Usuario admin;
    private Usuario docente;
    private Usuario alumno;
    private Curso curso;

    @BeforeEach
    void setUp() {
        Rol rolAdmin = Rol.builder().id(1L).nombre("ADMINISTRADOR").estado(true).build();
        Rol rolDocente = Rol.builder().id(2L).nombre("DOCENTE").estado(true).build();
        Rol rolAlumno = Rol.builder().id(3L).nombre("ALUMNO").estado(true).build();

        admin = Usuario.builder().id(10L).correo("admin@plataformalms.com").nombres("Admin").apellidos("Root").rol(rolAdmin).estado(true).build();
        docente = Usuario.builder().id(11L).correo("docente@plataformalms.com").nombres("Docente").apellidos("Uno").rol(rolDocente).estado(true).build();
        alumno = Usuario.builder().id(12L).correo("alumno@plataformalms.com").nombres("Alumno").apellidos("Dos").rol(rolAlumno).estado(true).build();

        curso = Curso.builder()
                .id(100L)
                .nombre("Curso Test")
                .descripcion("Desc")
                .imagenPortada("http://portada")
                .nivelesSuscripcion(Collections.emptyList())
                .docente(docente)
                .estado(true)
                .build();
    }

    @Test
    void getCursosAsignados_shouldReturnAllCursosForAdmin() {
        when(usuarioRepository.findByCorreo("admin@plataformalms.com")).thenReturn(Optional.of(admin));
        when(cursoRepository.findAll()).thenReturn(List.of(curso));

        List<CursoResponseDTO> result = docenteDashboardService.getCursosAsignados("admin@plataformalms.com");

        assertEquals(1, result.size());
        assertEquals("Curso Test", result.get(0).nombre());
        verify(cursoRepository, times(1)).findAll();
        verify(cursoRepository, never()).findByDocenteId(any());
    }

    @Test
    void getCursosAsignados_shouldReturnOnlyAssignedCursosForDocente() {
        when(usuarioRepository.findByCorreo("docente@plataformalms.com")).thenReturn(Optional.of(docente));
        when(cursoRepository.findByDocenteId(11L)).thenReturn(List.of(curso));

        List<CursoResponseDTO> result = docenteDashboardService.getCursosAsignados("docente@plataformalms.com");

        assertEquals(1, result.size());
        assertEquals("Curso Test", result.get(0).nombre());
        assertEquals(11L, result.get(0).docenteId());
        verify(cursoRepository, never()).findAll();
        verify(cursoRepository, times(1)).findByDocenteId(11L);
    }

    @Test
    void getCursosAsignados_shouldThrowNotFoundWhenUserDoesNotExist() {
        when(usuarioRepository.findByCorreo("nonexistent@plataformalms.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, 
                () -> docenteDashboardService.getCursosAsignados("nonexistent@plataformalms.com"));
    }

    @Test
    void getAlumnosCurso_shouldReturnStudentProgressForAdmin() {
        Matricula matricula = Matricula.builder().id(1L).usuario(alumno).curso(curso).fechaMatricula(LocalDateTime.now()).estado(true).build();
        AvanceCurso avance = AvanceCurso.builder().id(1L).usuario(alumno).curso(curso).porcentajeAvance(BigDecimal.valueOf(75.5)).completado(false).fechaActualizacion(LocalDateTime.now()).build();

        when(usuarioRepository.findByCorreo("admin@plataformalms.com")).thenReturn(Optional.of(admin));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));
        when(matriculaRepository.findByCursoId(100L)).thenReturn(List.of(matricula));
        when(avanceCursoRepository.findByCursoId(100L)).thenReturn(List.of(avance));

        List<DocenteEstudianteProgressResponse> result = docenteDashboardService.getAlumnosCurso("admin@plataformalms.com", 100L);

        assertEquals(1, result.size());
        assertEquals("Alumno", result.get(0).nombres());
        assertEquals(75.5, result.get(0).porcentajeAvance());
        assertFalse(result.get(0).completado());
    }

    @Test
    void getAlumnosCurso_shouldReturnStudentProgressForOwnerDocente() {
        Matricula matricula = Matricula.builder().id(1L).usuario(alumno).curso(curso).fechaMatricula(LocalDateTime.now()).estado(true).build();

        when(usuarioRepository.findByCorreo("docente@plataformalms.com")).thenReturn(Optional.of(docente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));
        when(matriculaRepository.findByCursoId(100L)).thenReturn(List.of(matricula));
        when(avanceCursoRepository.findByCursoId(100L)).thenReturn(List.of());

        List<DocenteEstudianteProgressResponse> result = docenteDashboardService.getAlumnosCurso("docente@plataformalms.com", 100L);

        assertEquals(1, result.size());
        assertEquals(0.0, result.get(0).porcentajeAvance()); // Default to 0 when no progress record exists
    }

    @Test
    void getAlumnosCurso_shouldThrowForbiddenForNonOwnerDocente() {
        Usuario otherDocente = Usuario.builder().id(15L).correo("other@plataformalms.com")
                .rol(Rol.builder().id(2L).nombre("DOCENTE").build()).build();

        when(usuarioRepository.findByCorreo("other@plataformalms.com")).thenReturn(Optional.of(otherDocente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));

        assertThrows(ForbiddenException.class, 
                () -> docenteDashboardService.getAlumnosCurso("other@plataformalms.com", 100L));
    }
}

