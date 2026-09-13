package com.insteip.backend.domain.dto.modulo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ModuloRequestDTO(
    @NotNull(message = "El ID del curso es obligatorio")
    Long cursoId,
    
    @NotBlank(message = "El nombre del módulo es obligatorio")
    String nombre,
    
    String descripcion,
    
    @NotNull(message = "El orden del módulo es obligatorio")
    Integer orden
){}
