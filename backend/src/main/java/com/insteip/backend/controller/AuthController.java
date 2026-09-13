package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.auth.LoginRequest;
import com.insteip.backend.domain.dto.auth.LoginResponse;
import com.insteip.backend.domain.dto.auth.LogoutRequest;
import com.insteip.backend.domain.dto.auth.ForgotPasswordRequest;
import com.insteip.backend.domain.dto.auth.ResetPasswordRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshResponse;
import com.insteip.backend.domain.dto.auth.UserProfileResponse;
import com.insteip.backend.domain.dto.auth.ChangePasswordRequest;
import com.insteip.backend.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String correo = authentication.getName();
        return ResponseEntity.ok(authService.getProfile(correo));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getCorreo());
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("mensaje", "Si el correo está registrado, recibirás un código de recuperación.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("mensaje", "Contraseña restablecida exitosamente.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<java.util.Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        authService.changePassword(authentication.getName(), request);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("mensaje", "Contraseña cambiada exitosamente.");
        return ResponseEntity.ok(response);
    }
}
