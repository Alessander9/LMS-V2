package com.insteip.backend.domain.dto.modulo;

public record ModuloResponseDTO(
    Long id,
    String nombre,
    String descripcion,
    Integer orden,
    Boolean estado,
    Long cursoId,
    String cursoNombre
){}
