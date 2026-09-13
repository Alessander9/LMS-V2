package com.insteip.backend.domain.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String nombres;
    private String apellidos;
    private String correo;
    private String rol;
    private String nivelSuscripcion;
    private Boolean isExpUser;
    private Long expDurationSeconds;
}
