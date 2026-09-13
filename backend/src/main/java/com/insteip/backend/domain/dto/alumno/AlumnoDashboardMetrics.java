package com.insteip.backend.domain.dto.alumno;

public record AlumnoDashboardMetrics(
    long cursosInscritos,
    long cursosCompletados,
    long certificados
) {}
