package com.insteip.backend.domain.dto.alumno;

import java.util.List;

public record AlumnoPlayCourseResponse(
    Long id,
    String nombre,
    String descripcion,
    String imagenPortada,
    String nivelSuscripcion,
    List<AlumnoPlayModulo> modulos
) {}
