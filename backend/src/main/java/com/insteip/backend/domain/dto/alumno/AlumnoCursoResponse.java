package com.insteip.backend.domain.dto.alumno;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AlumnoCursoResponse(
    Long id,
    String nombre,
    String descripcion,
    String imagenPortada,
    String nivelSuscripcion,
    BigDecimal avancePorcentaje,
    Boolean completado,
    LocalDateTime fechaMatricula,
    LocalDateTime fechaExpiracion,
    Long diasRestantes,
    String alertaExpiracion
) {
    // Constructor for backwards compatibility with tests
    public AlumnoCursoResponse(
        Long id,
        String nombre,
        String descripcion,
        String imagenPortada,
        String nivelSuscripcion,
        BigDecimal avancePorcentaje,
        Boolean completado,
        LocalDateTime fechaMatricula,
        LocalDateTime fechaExpiracion
    ) {
        this(
            id,
            nombre,
            descripcion,
            imagenPortada,
            nivelSuscripcion,
            avancePorcentaje,
            completado,
            fechaMatricula,
            fechaExpiracion,
            365L,
            "OK"
        );
    }
}
