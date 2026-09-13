package com.insteip.backend.infrastructure.security;

import com.insteip.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UsuarioRepository usuarioRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            String cleanUsername = username != null ? username.trim() : "";
            return usuarioRepository.findByCorreo(cleanUsername)
                    .map(u -> org.springframework.security.core.userdetails.User.builder()
                            .username(u.getCorreo())
                            .password(u.getPasswordHash())
                            .disabled(u.getEstado() != null && !u.getEstado())
                            .authorities("ROLE_" + u.getRol().getNombre()) // Convierte ADMINISTRADOR a ROLE_ADMINISTRADOR, etc.
                            .build())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + cleanUsername));
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
