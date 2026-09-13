package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.auth.ForgotPasswordRequest;
import com.insteip.backend.domain.dto.auth.LoginRequest;
import com.insteip.backend.domain.dto.auth.LoginResponse;
import com.insteip.backend.domain.dto.auth.LogoutRequest;
import com.insteip.backend.domain.dto.auth.ResetPasswordRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshRequest;
import com.insteip.backend.domain.dto.auth.TokenRefreshResponse;
import com.insteip.backend.domain.dto.auth.UserProfileResponse;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.service.interfaces.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = AuthController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
})
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void login_shouldReturnOkAndResponse() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setCorreo("test@insteip.com");
        request.setPassword("Password123!");

        LoginResponse response = LoginResponse.builder()
                .token("access-token")
                .refreshToken("refresh-token")
                .nombres("Test")
                .apellidos("User")
                .rol("ALUMNO")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.rol").value("ALUMNO"));
    }

    @Test
    void refreshToken_shouldReturnOkAndTokens() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("refresh-token");

        TokenRefreshResponse response = TokenRefreshResponse.builder()
                .token("new-access-token")
                .refreshToken("refresh-token")
                .build();

        when(authService.refreshToken(any(TokenRefreshRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-access-token"));
    }

    @Test
    void logout_shouldReturnNoContent() throws Exception {
        LogoutRequest request = new LogoutRequest();
        request.setRefreshToken("refresh-token");

        doNothing().when(authService).logout(any(LogoutRequest.class));

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    void getProfile_shouldReturnProfileInfo() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .correo("test@insteip.com")
                .nombres("Test")
                .apellidos("User")
                .rol("ALUMNO")
                .nivelSuscripcion("BASICO")
                .build();

        when(authService.getProfile("test@insteip.com")).thenReturn(response);

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken authToken = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "test@insteip.com", "token", java.util.Collections.emptyList()
                );

        mockMvc.perform(get("/api/auth/me")
                        .principal(authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("test@insteip.com"))
                .andExpect(jsonPath("$.rol").value("ALUMNO"));
    }

    @Test
    void forgotPassword_shouldReturnOkAndMessage() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setCorreo("test@insteip.com");

        doNothing().when(authService).forgotPassword("test@insteip.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").exists());
    }

    @Test
    void resetPassword_shouldReturnOkAndMessage() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("reset-token");
        request.setNewPassword("Password123!");

        doNothing().when(authService).resetPassword("reset-token", "Password123!");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").exists());
    }
}
