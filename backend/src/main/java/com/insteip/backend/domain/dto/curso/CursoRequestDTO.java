package com.insteip.backend.domain.dto.curso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CursoRequestDTO(
    @NotBlank(message = "El nombre del curso es obligatorio")
    String nombre,
    
    @NotBlank(message = "La descripción del curso es obligatoria")
    String descripcion,
    
    String imagenPortada,
    
    @NotNull(message = "Los niveles de suscripción son obligatorios")
    java.util.List<Long> nivelesSuscripcionIds,
    
    Long docenteId
){}
