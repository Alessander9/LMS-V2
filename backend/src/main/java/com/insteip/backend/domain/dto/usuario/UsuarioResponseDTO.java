package com.insteip.backend.domain.dto.usuario;

public record UsuarioResponseDTO(
    Long id,
    String nombres,
    String apellidos,
    String correo,
    String telefono,
    String nivelSuscripcion,
    Boolean estado,
    java.time.LocalDateTime fechaRegistro,
    String passwordPlain
){}
