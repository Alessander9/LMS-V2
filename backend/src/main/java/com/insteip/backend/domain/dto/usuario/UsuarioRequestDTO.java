package com.insteip.backend.domain.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(
    @NotBlank(message = "Los nombres son obligatorios")
    String nombres,
    
    @NotBlank(message = "Los apellidos son obligatorios")
    String apellidos,
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe ser válido")
    String correo,
    
    String telefono,
    
    @NotNull(message = "El nivel de suscripción es obligatorio")
    Long nivelSuscripcionId,

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    String password
){}
