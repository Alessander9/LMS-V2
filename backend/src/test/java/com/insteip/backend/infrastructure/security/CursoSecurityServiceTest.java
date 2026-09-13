package com.insteip.backend.infrastructure.security;

import com.insteip.backend.domain.entity.*;
import com.insteip.backend.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CursoSecurityServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private CursoRepository cursoRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private VideoRepository videoRepository;
    @Mock private MaterialRepository materialRepository;

    @InjectMocks
    private CursoSecurityService cursoSecurityService;

    private Usuario admin;
    private Usuario docente;
    private Usuario alumno;
    private Curso curso;

    @BeforeEach
    void setUp() {
        Rol rolAdmin = Rol.builder().id(1L).nombre("ADMINISTRADOR").estado(true).build();
        Rol rolDocente = Rol.builder().id(2L).nombre("DOCENTE").estado(true).build();
        Rol rolAlumno = Rol.builder().id(3L).nombre("ALUMNO").estado(true).build();

        admin = Usuario.builder().id(10L).correo("admin@insteip.com").rol(rolAdmin).estado(true).build();
        docente = Usuario.builder().id(11L).correo("docente@insteip.com").rol(rolDocente).estado(true).build();
        alumno = Usuario.builder().id(12L).correo("alumno@insteip.com").rol(rolAlumno).estado(true).build();

        curso = Curso.builder().id(100L).nombre("Curso Test").docente(docente).estado(true).build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void canAccessCurso_shouldReturnFalseWhenNoAuthentication() {
        assertFalse(cursoSecurityService.canAccessCurso(100L));
    }

    @Test
    void canAccessCurso_shouldReturnTrueForAdministrador() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(admin.getCorreo())).thenReturn(Optional.of(admin));

        assertTrue(cursoSecurityService.canAccessCurso(100L));
    }

    @Test
    void canAccessCurso_shouldReturnFalseForAlumno() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(alumno.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(alumno.getCorreo())).thenReturn(Optional.of(alumno));

        assertFalse(cursoSecurityService.canAccessCurso(100L));
    }

    @Test
    void canAccessCurso_shouldReturnTrueForOwnerDocente() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(docente.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(docente.getCorreo())).thenReturn(Optional.of(docente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));

        assertTrue(cursoSecurityService.canAccessCurso(100L));
    }

    @Test
    void canAccessCurso_shouldReturnFalseForNonOwnerDocente() {
        Usuario otherDocente = Usuario.builder().id(15L).correo("other@insteip.com")
                .rol(Rol.builder().id(2L).nombre("DOCENTE").build()).build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(otherDocente.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(otherDocente.getCorreo())).thenReturn(Optional.of(otherDocente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));

        assertFalse(cursoSecurityService.canAccessCurso(100L));
    }

    @Test
    void canAccessModulo_shouldCheckCursoOwnership() {
        Modulo modulo = Modulo.builder().id(200L).curso(curso).estado(true).build();
        when(moduloRepository.findById(200L)).thenReturn(Optional.of(modulo));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(docente.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(docente.getCorreo())).thenReturn(Optional.of(docente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));

        assertTrue(cursoSecurityService.canAccessModulo(200L));
    }

    @Test
    void canAccessVideo_shouldCheckModuloAndCursoOwnership() {
        Modulo modulo = Modulo.builder().id(200L).curso(curso).estado(true).build();
        Video video = Video.builder().id(300L).modulo(modulo).estado(true).build();
        when(videoRepository.findById(300L)).thenReturn(Optional.of(video));
        when(moduloRepository.findById(200L)).thenReturn(Optional.of(modulo));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(docente.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(docente.getCorreo())).thenReturn(Optional.of(docente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));

        assertTrue(cursoSecurityService.canAccessVideo(300L));
    }

    @Test
    void canAccessMaterial_shouldCheckModuloAndCursoOwnership() {
        Modulo modulo = Modulo.builder().id(200L).curso(curso).estado(true).build();
        Material material = Material.builder().id(400L).modulo(modulo).estado(true).build();
        when(materialRepository.findById(400L)).thenReturn(Optional.of(material));
        when(moduloRepository.findById(200L)).thenReturn(Optional.of(modulo));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(docente.getCorreo(), "token", Collections.emptyList())
        );
        when(usuarioRepository.findByCorreo(docente.getCorreo())).thenReturn(Optional.of(docente));
        when(cursoRepository.findById(100L)).thenReturn(Optional.of(curso));

        assertTrue(cursoSecurityService.canAccessMaterial(400L));
    }
}
