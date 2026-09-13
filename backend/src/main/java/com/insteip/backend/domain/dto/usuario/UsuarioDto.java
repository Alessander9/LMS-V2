package com.insteip.backend.domain.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDto {
    private Long id;
    private String nombres;
    private String apellidos;
    private String correo;
    private String telefono;
    private Boolean estado;
    private Long rolId;
    private String rolNombre;
    private Long nivelSuscripcionId;
    private String nivelSuscripcionNombre;
    private String passwordPlain;
}
