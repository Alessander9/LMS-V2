package com.insteip.backend.service.impl;

import com.insteip.backend.controller.MaterialController;
import com.insteip.backend.domain.dto.auth.LoginRequest;
import com.insteip.backend.domain.dto.auth.LoginResponse;
import com.insteip.backend.domain.dto.auth.UserProfileResponse;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Material;
import com.insteip.backend.domain.entity.Rol;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.infrastructure.security.JwtService;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.MaterialService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpLmsAuthTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private LoginAuditoriaRepository loginAuditoriaRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HttpServletRequest httpServletRequest;

    @Mock
    private AuditoriaService auditoriaService;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private CursoRepository cursoRepository;

    @Mock
    private MatriculaRepository matriculaRepository;

    @Mock
    private MaterialService materialService;

    @Mock
    private MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private MaterialController materialController;

    @BeforeEach
    void setUp() {
        materialController = new MaterialController(
                materialService,
                usuarioRepository,
                matriculaRepository,
                matriculaModuloAccesoRepository
        );
    }

    @Test
    void loginExp_ConCredencialesCorrectas_DebeRetornarToken20MinutosSinRefreshToken() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("ExperianciaInsteip@insteip.com");
        request.setPassword("insteip");

        Rol rolAlumno = Rol.builder().id(3L).nombre("ALUMNO").build();
        Usuario usuarioMock = Usuario.builder()
                .id(999L)
                .nombres("Experiencia")
                .apellidos("INSTEIP")
                .correo("ExperianciaInsteip@insteip.com")
                .rol(rolAlumno)
                .estado(true)
                .build();

        when(usuarioRepository.findByCorreo("ExperianciaInsteip@insteip.com")).thenReturn(Optional.of(usuarioMock));
        when(passwordEncoder.encode("insteip")).thenReturn("hashed_insteip");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioMock);
        when(cursoRepository.findAll()).thenReturn(List.of());
        when(jwtService.generateExpToken(eq(999L), eq("ExperianciaInsteip@insteip.com"), eq("ALUMNO"), eq(1200000L)))
                .thenReturn("mock_jwt_exp_token_20_minutes");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_exp_token_20_minutes", response.getToken());
        assertNull(response.getRefreshToken(), "El usuario EXP no debe recibir Refresh Token de larga duración");
        assertTrue(response.getIsExpUser(), "isExpUser debe ser true");
        assertEquals(1200L, response.getExpDurationSeconds(), "La duración debe ser 1200 segundos (20 min)");
    }

    @Test
    void loginExp_ConClaveIncorrecta_DebeLanzarExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setCorreo("ExperianciaInsteip@insteip.com");
        request.setPassword("clave_erronea");

        assertThrows(BadRequestException.class, () -> authService.login(request));
    }

    @Test
    void getProfileExp_DebeRetornarIsExpUserTrue() {
        Rol rolAlumno = Rol.builder().id(3L).nombre("ALUMNO").build();
        Usuario usuarioMock = Usuario.builder()
                .id(999L)
                .nombres("Experiencia")
                .apellidos("INSTEIP")
                .correo("ExperianciaInsteip@insteip.com")
                .rol(rolAlumno)
                .build();

        when(usuarioRepository.findByCorreo("ExperianciaInsteip@insteip.com")).thenReturn(Optional.of(usuarioMock));

        UserProfileResponse profile = authService.getProfile("ExperianciaInsteip@insteip.com");

        assertNotNull(profile);
        assertTrue(profile.getIsExpUser());
        assertEquals(1200L, profile.getExpDurationSeconds());
    }

    @Test
    void descargarMaterial_ComoUsuarioExp_DebeRetornarForbidden() {
        Authentication authExp = new UsernamePasswordAuthenticationToken(
                "ExperianciaInsteip@insteip.com",
                "insteip"
        );

        ResponseEntity<byte[]> response = materialController.descargarMaterial(10L, authExp);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode(), "Debe retornar 403 Forbidden para usuario EXP");
    }
}
