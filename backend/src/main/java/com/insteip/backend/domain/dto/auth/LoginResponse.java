package com.insteip.backend.domain.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String refreshToken;
    private String nombres;
    private String apellidos;
    private String rol;
    private Boolean isExpUser;
    private Long expDurationSeconds;
}
