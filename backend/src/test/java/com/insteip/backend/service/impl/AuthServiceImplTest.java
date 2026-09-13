package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.auth.LoginRequest;
import com.insteip.backend.domain.dto.auth.LoginResponse;
import com.insteip.backend.domain.dto.auth.TokenRefreshRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshResponse;
import com.insteip.backend.domain.entity.LoginAuditoria;
import com.insteip.backend.domain.entity.RefreshToken;
import com.insteip.backend.domain.entity.Rol;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.repository.*;
import com.insteip.backend.domain.dto.auth.ChangePasswordRequest;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.infrastructure.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceImplTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private LoginAuditoriaRepository loginAuditoriaRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private HttpServletRequest httpServletRequest;
    @Mock private AuditoriaService auditoriaService;
    @Mock private RolRepository rolRepository;
    @Mock private CursoRepository cursoRepository;
    @Mock private MatriculaRepository matriculaRepository;

    private JwtService jwtService;
    private AuthServiceImpl authService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey",
                Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8)));
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        authService = new AuthServiceImpl(
                authenticationManager,
                usuarioRepository,
                loginAuditoriaRepository,
                refreshTokenRepository,
                jwtService,
                passwordEncoder,
                httpServletRequest,
                java.util.Optional.empty(),
                auditoriaService,
                rolRepository,
                cursoRepository,
                matriculaRepository
        );

        Rol rol = Rol.builder().id(1L).nombre("ADMINISTRADOR").estado(true).build();
        usuario = Usuario.builder()
                .id(10L)
                .correo("admin@insteip.com")
                .nombres("Admin")
                .apellidos("Test")
                .passwordHash("$2a$10$hash")
                .rol(rol)
                .estado(true)
                .intentosFallidos(0)
                .bloqueadoHasta(null)
                .build();
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("JUnit");
        when(httpServletRequest.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
    }

    @Test
    void login_should_return_tokens_and_reset_failed_attempts() {
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(
                        usuario.getCorreo(),
                        "Password123!",
                        List.of()
                ));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoginRequest request = new LoginRequest();
        request.setCorreo(usuario.getCorreo());
        request.setPassword("Password123!");

        LoginResponse response = authService.login(request);

        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("Admin", response.getNombres());
        assertEquals(0, usuario.getIntentosFallidos());
        assertNull(usuario.getBloqueadoHasta());

        verify(usuarioRepository).save(usuario);

        ArgumentCaptor<LoginAuditoria> auditCaptor = ArgumentCaptor.forClass(LoginAuditoria.class);
        verify(loginAuditoriaRepository).save(auditCaptor.capture());
        assertTrue(auditCaptor.getValue().getExitoso());
        assertEquals(usuario.getCorreo(), auditCaptor.getValue().getCorreo());
        assertEquals("127.0.0.1", auditCaptor.getValue().getIp());
        assertEquals("JUnit", auditCaptor.getValue().getUserAgent());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void login_should_lock_account_after_five_failed_attempts() {
        usuario.setIntentosFallidos(4);
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        LoginRequest request = new LoginRequest();
        request.setCorreo(usuario.getCorreo());
        request.setPassword("wrong");

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.login(request));

        assertEquals("Su cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente más tarde.", exception.getMessage());
        assertEquals(5, usuario.getIntentosFallidos());
        assertNotNull(usuario.getBloqueadoHasta());
        assertTrue(usuario.getBloqueadoHasta().isAfter(LocalDateTime.now()));

        ArgumentCaptor<LoginAuditoria> auditCaptor = ArgumentCaptor.forClass(LoginAuditoria.class);
        verify(loginAuditoriaRepository).save(auditCaptor.capture());
        assertFalse(auditCaptor.getValue().getExitoso());
        assertTrue(auditCaptor.getValue().getMotivo().contains("Bloqueo"));
    }

    @Test
    void refreshToken_should_rotate_refresh_token_and_return_new_access_token() {
        RefreshToken storedToken = RefreshToken.builder()
                .id(1L)
                .usuario(usuario)
                .token("old-refresh")
                .expiracion(LocalDateTime.now().plusDays(1))
                .activo(true)
                .build();

        when(refreshTokenRepository.findByToken("old-refresh")).thenReturn(Optional.of(storedToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("old-refresh");

        TokenRefreshResponse response = authService.refreshToken(request);

        assertNotNull(response.getToken());
        assertNotNull(response.getRefreshToken());
        verify(refreshTokenRepository).delete(storedToken);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void forgotPassword_should_set_reset_token() {
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));

        authService.forgotPassword(usuario.getCorreo());

        assertNotNull(usuario.getPasswordResetToken());
        assertNotNull(usuario.getPasswordResetTokenExpira());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void resetPassword_should_update_password_and_clear_token() {
        usuario.setPasswordResetToken("123456");
        usuario.setPasswordResetTokenExpira(LocalDateTime.now().plusMinutes(15));
        when(usuarioRepository.findByPasswordResetToken("123456")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("new-hash");

        authService.resetPassword("123456", "NewPassword123!");

        assertEquals("new-hash", usuario.getPasswordHash());
        assertNull(usuario.getPasswordResetToken());
        assertNull(usuario.getPasswordResetTokenExpira());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void changePassword_should_update_password_when_current_password_matches() {
        ChangePasswordRequest request = new ChangePasswordRequest("OldPassword123!", "NewPassword123!");
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("OldPassword123!", usuario.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("new-hash");

        authService.changePassword(usuario.getCorreo(), request);

        assertEquals("new-hash", usuario.getPasswordHash());
        verify(usuarioRepository).save(usuario);
        verify(auditoriaService).registrarEvento(eq("AUTENTICACIÓN"), eq("CAMBIAR_PASSWORD"), anyString());
    }

    @Test
    void changePassword_should_throw_exception_when_current_password_mismatches() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrong-password", "NewPassword123!");
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("wrong-password", usuario.getPasswordHash())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> {
            authService.changePassword(usuario.getCorreo(), request);
        });

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}
