package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.auth.LoginRequest;
import com.insteip.backend.domain.dto.auth.LoginResponse;
import com.insteip.backend.domain.dto.auth.UserProfileResponse;
import com.insteip.backend.domain.dto.auth.TokenRefreshRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshResponse;
import com.insteip.backend.domain.dto.auth.LogoutRequest;
import com.insteip.backend.domain.dto.auth.ChangePasswordRequest;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.entity.LoginAuditoria;
import com.insteip.backend.domain.entity.RefreshToken;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.LoginAuditoriaRepository;
import com.insteip.backend.repository.RefreshTokenRepository;
import com.insteip.backend.infrastructure.security.JwtService;
import com.insteip.backend.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final LoginAuditoriaRepository loginAuditoriaRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final HttpServletRequest httpServletRequest;
    private final Optional<org.springframework.mail.javamail.JavaMailSender> mailSender;
    private final AuditoriaService auditoriaService;
    private final com.insteip.backend.repository.RolRepository rolRepository;
    private final com.insteip.backend.repository.CursoRepository cursoRepository;
    private final com.insteip.backend.repository.MatriculaRepository matriculaRepository;

    public static final String EXP_USER_EMAIL_1 = "ExperianciaInsteip@insteip.com";
    public static final String EXP_USER_EMAIL_2 = "ExperienciaInsteip@insteip.com";
    public static final String EXP_PASSWORD_DEFAULT = "insteip";
    public static final long EXP_DURATION_SECONDS = 1200L; // 20 minutos
    public static final long EXP_DURATION_MILLIS = 1200000L; // 20 minutos

    private boolean isExpEmail(String correo) {
        if (correo == null) return false;
        String clean = correo.trim().toLowerCase();
        return clean.equals(EXP_USER_EMAIL_1.toLowerCase()) || clean.equals(EXP_USER_EMAIL_2.toLowerCase());
    }

    private Usuario asegurarUsuarioExp(String correo, String rawPassword) {
        if (!EXP_PASSWORD_DEFAULT.equals(rawPassword)) {
            throw new BadRequestException("Credenciales inválidas para EXP INSTEIP");
        }

        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);
        if (usuario == null) {
            com.insteip.backend.domain.entity.Rol rolAlumno = rolRepository.findByNombre("ALUMNO")
                    .orElseGet(() -> rolRepository.save(com.insteip.backend.domain.entity.Rol.builder().nombre("ALUMNO").build()));

            usuario = Usuario.builder()
                    .nombres("Experiencia")
                    .apellidos("INSTEIP")
                    .correo(correo)
                    .passwordHash(passwordEncoder.encode(EXP_PASSWORD_DEFAULT))
                    .passwordPlain(EXP_PASSWORD_DEFAULT)
                    .rol(rolAlumno)
                    .estado(true)
                    .build();
            usuario = usuarioRepository.save(usuario);
        } else {
            boolean needsUpdate = false;
            if (!Boolean.TRUE.equals(usuario.getEstado())) {
                usuario.setEstado(true);
                needsUpdate = true;
            }
            if (usuario.getBloqueadoHasta() != null || (usuario.getIntentosFallidos() != null && usuario.getIntentosFallidos() > 0)) {
                usuario.setBloqueadoHasta(null);
                usuario.setIntentosFallidos(0);
                needsUpdate = true;
            }
            if (usuario.getPasswordHash() == null || !passwordEncoder.matches(EXP_PASSWORD_DEFAULT, usuario.getPasswordHash())) {
                usuario.setPasswordHash(passwordEncoder.encode(EXP_PASSWORD_DEFAULT));
                usuario.setPasswordPlain(EXP_PASSWORD_DEFAULT);
                needsUpdate = true;
            }
            if (needsUpdate) {
                usuario = usuarioRepository.save(usuario);
            }
        }

        // Matricular en lote al usuario EXP en todos los cursos holísticos activos que aún no tenga asignados
        try {
            List<com.insteip.backend.domain.entity.Matricula> matriculasActuales = matriculaRepository.findByUsuarioId(usuario.getId());

            // Eliminar matrículas no holísticas/de prueba (como Excel Avanzado) si existieran
            matriculasActuales.stream()
                    .filter(m -> m.getCurso() != null && m.getCurso().getNombre() != null && m.getCurso().getNombre().toLowerCase().contains("excel"))
                    .forEach(m -> {
                        try {
                            matriculaRepository.delete(m);
                        } catch (Exception ignored) {}
                    });

            java.util.Set<Long> cursoIdsMatriculados = matriculaRepository.findByUsuarioId(usuario.getId()).stream()
                    .map(m -> m.getCurso().getId())
                    .collect(java.util.stream.Collectors.toSet());

            List<com.insteip.backend.domain.entity.Curso> cursosActivos = cursoRepository.findAll();
            List<com.insteip.backend.domain.entity.Matricula> nuevasMatriculas = new java.util.ArrayList<>();

            for (com.insteip.backend.domain.entity.Curso c : cursosActivos) {
                if (Boolean.TRUE.equals(c.getEstado())
                        && c.getNombre() != null
                        && !c.getNombre().toLowerCase().contains("excel")
                        && !cursoIdsMatriculados.contains(c.getId())) {
                    nuevasMatriculas.add(com.insteip.backend.domain.entity.Matricula.builder()
                            .usuario(usuario)
                            .curso(c)
                            .estado(true)
                            .fechaMatricula(LocalDateTime.now())
                            .fechaExpiracion(LocalDateTime.now().plusMonths(12))
                            .build());
                }
            }
            if (!nuevasMatriculas.isEmpty()) {
                matriculaRepository.saveAll(nuevasMatriculas);
            }
        } catch (Exception ignored) {}

        return usuario;
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String ip = getClientIp(httpServletRequest);
        String userAgent = httpServletRequest.getHeader("User-Agent");
        
        String correo = request.getCorreo() != null ? request.getCorreo().trim() : "";
        boolean isExp = isExpEmail(correo);

        if (isExp) {
            Usuario usuarioExp = asegurarUsuarioExp(correo, request.getPassword());
            
            // Audit EXP login
            LoginAuditoria audit = LoginAuditoria.builder()
                    .usuario(usuarioExp)
                    .correo(usuarioExp.getCorreo())
                    .ip(ip)
                    .userAgent(userAgent)
                    .exitoso(true)
                    .build();
            loginAuditoriaRepository.save(audit);

            // Token de 20 minutos (1200000 ms)
            String expToken = jwtService.generateExpToken(
                    usuarioExp.getId(),
                    usuarioExp.getCorreo(),
                    usuarioExp.getRol().getNombre(),
                    EXP_DURATION_MILLIS
            );

            return LoginResponse.builder()
                    .token(expToken)
                    .refreshToken(null) // No refresh token para sesión EXP limitada
                    .nombres(usuarioExp.getNombres())
                    .apellidos(usuarioExp.getApellidos())
                    .rol(usuarioExp.getRol().getNombre())
                    .isExpUser(true)
                    .expDurationSeconds(EXP_DURATION_SECONDS)
                    .build();
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getBloqueadoHasta() != null && usuario.getBloqueadoHasta().isAfter(LocalDateTime.now())) {
                String msg = "Su cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente más tarde.";
                logLoginFailure(usuario, correo, ip, userAgent, msg);
                throw new BadRequestException(msg);
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            correo,
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                int attempts = usuario.getIntentosFallidos() != null ? usuario.getIntentosFallidos() + 1 : 1;
                usuario.setIntentosFallidos(attempts);
                String motivo = "Credenciales inválidas";
                String responseMessage = "Credenciales inválidas";
                if (attempts >= 5) {
                    usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(15));
                    motivo = "Bloqueo por superar el límite de intentos fallidos (5)";
                    responseMessage = "Su cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente más tarde.";
                }
                usuarioRepository.save(usuario);
                logLoginFailure(usuario, correo, ip, userAgent, motivo);
                throw new BadRequestException(responseMessage);
            } else {
                logLoginFailure(null, correo, ip, userAgent, "Usuario no encontrado");
            }
            throw new BadRequestException("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();

        if (usuario.getEstado() != null && !usuario.getEstado()) {
            logLoginFailure(usuario, request.getCorreo(), ip, userAgent, "La cuenta de usuario está inactiva");
            throw new BadRequestException("La cuenta de usuario está inactiva");
        }

        // Reset attempts
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);

        // Audit success
        LoginAuditoria audit = LoginAuditoria.builder()
                .usuario(usuario)
                .correo(usuario.getCorreo())
                .ip(ip)
                .userAgent(userAgent)
                .exitoso(true)
                .build();
        loginAuditoriaRepository.save(audit);

        // Generate Access Token (JWT)
        String token = jwtService.generateToken(usuario.getId(), usuario.getCorreo(), usuario.getRol().getNombre());

        // Generate Refresh Token
        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(refreshTokenStr)
                .expiracion(LocalDateTime.now().plusDays(7)) // Valid for 7 days
                .activo(true)
                .build();
        refreshTokenRepository.save(refreshToken);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshTokenStr)
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .rol(usuario.getRol().getNombre())
                .isExpUser(false)
                .expDurationSeconds(null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String correo) {
        String cleanCorreo = correo != null ? correo.trim() : "";
        Usuario usuario = usuarioRepository.findByCorreo(cleanCorreo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        boolean isExp = isExpEmail(usuario.getCorreo());

        return UserProfileResponse.builder()
                .id(usuario.getId())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol().getNombre())
                .nivelSuscripcion(usuario.getNivelSuscripcion() != null ? usuario.getNivelSuscripcion().getNombre() : "NINGUNO")
                .isExpUser(isExp)
                .expDurationSeconds(isExp ? EXP_DURATION_SECONDS : null)
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String tokenStr = request.getRefreshToken();
        String ip = getClientIp(httpServletRequest);
        String userAgent = httpServletRequest.getHeader("User-Agent");
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(tokenStr)
                .orElseGet(() -> {
                    logLoginFailure(null, null, ip, userAgent, "Refresh token inválido");
                    throw new BadRequestException("Refresh token inválido o no encontrado");
                });

        if (!refreshTokenEntity.getActivo()) {
            Usuario usuario = refreshTokenEntity.getUsuario();
            logLoginFailure(usuario, usuario != null ? usuario.getCorreo() : null, ip, userAgent, "Refresh token inactivo");
            throw new BadRequestException("Refresh token inactivo");
        }

        if (refreshTokenEntity.getExpiracion().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new BadRequestException("Refresh token expirado. Por favor, inicie sesión nuevamente.");
        }

        Usuario usuario = refreshTokenEntity.getUsuario();
        if (usuario.getEstado() != null && !usuario.getEstado()) {
            logLoginFailure(usuario, usuario.getCorreo(), ip, userAgent, "La cuenta de usuario está inactiva");
            throw new BadRequestException("La cuenta de usuario está inactiva");
        }

        // Generate new access token
        String newAccessToken = jwtService.generateToken(usuario.getId(), usuario.getCorreo(), usuario.getRol().getNombre());

        // Rotate refresh token
        refreshTokenRepository.delete(refreshTokenEntity);

        String newRefreshTokenStr = UUID.randomUUID().toString();
        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .usuario(usuario)
                .token(newRefreshTokenStr)
                .expiracion(LocalDateTime.now().plusDays(7))
                .activo(true)
                .build();
        refreshTokenRepository.save(newRefreshTokenEntity);

        return TokenRefreshResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .build();
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken()).ifPresent(refreshToken -> {
            refreshToken.setActivo(false);
            refreshTokenRepository.save(refreshToken);
        });
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private void logLoginFailure(Usuario usuario, String correo, String ip, String userAgent, String motivo) {
        LoginAuditoria audit = LoginAuditoria.builder()
                .usuario(usuario)
                .correo(correo)
                .ip(ip)
                .userAgent(userAgent)
                .exitoso(false)
                .motivo(motivo)
                .build();
        loginAuditoriaRepository.save(audit);
    }

    @Override
    @Transactional
    public void forgotPassword(String correo) {
        String cleanCorreo = correo != null ? correo.trim() : "";
        Usuario usuario = usuarioRepository.findByCorreo(cleanCorreo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + cleanCorreo));

        String token = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        usuario.setPasswordResetToken(token);
        usuario.setPasswordResetTokenExpira(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        System.out.println("==================================================");
        System.out.println("RECUPERACIÓN DE CONTRASEÑA MOCK:");
        System.out.println("Usuario: " + correo);
        System.out.println("Token temporal de 15 min: " + token);
        System.out.println("==================================================");

        mailSender.ifPresent(sender -> {
            try {
                org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
                message.setTo(correo);
                message.setSubject("Recuperación de contraseña - INSTEIP");
                message.setText("Hola " + usuario.getNombres() + ",\n\n" +
                        "Has solicitado restablecer tu contraseña. Utiliza el siguiente código temporal válido por 15 minutos:\n\n" +
                        "CÓDIGO: " + token + "\n\n" +
                        "Si no solicitaste esto, puedes ignorar este mensaje.\n\n" +
                        "Saludos,\nEquipo INSTEIP");
                sender.send(message);
            } catch (Exception e) {
                System.err.println("No se pudo enviar el correo de recuperación real (SMTP no configurado). Error: " + e.getMessage());
            }
        });
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        Usuario usuario = usuarioRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("El token de recuperación no es válido o ya fue utilizado."));

        if (usuario.getPasswordResetTokenExpira() == null || usuario.getPasswordResetTokenExpira().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("El token de recuperación ha expirado.");
        }

        usuario.setPasswordHash(passwordEncoder.encode(newPassword));
        usuario.setPasswordPlain(newPassword);
        usuario.setPasswordResetToken(null);
        usuario.setPasswordResetTokenExpira(null);
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void changePassword(String correo, ChangePasswordRequest request) {
        String cleanCorreo = correo != null ? correo.trim() : "";
        Usuario usuario = usuarioRepository.findByCorreo(cleanCorreo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + cleanCorreo));

        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPasswordHash())) {
            throw new BadRequestException("La contraseña actual es incorrecta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        usuario.setPasswordPlain(request.getNewPassword());
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);

        auditoriaService.registrarEvento("AUTENTICACIÓN", "CAMBIAR_PASSWORD", "El usuario " + cleanCorreo + " cambió su contraseña.");
    }
}
