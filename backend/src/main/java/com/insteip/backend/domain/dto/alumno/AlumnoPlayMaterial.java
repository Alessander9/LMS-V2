package com.insteip.backend.domain.dto.alumno;

public record AlumnoPlayMaterial(
    Long id,
    String nombre,
    String archivoUrl,
    String tipoArchivo,
    Long pesoBytes
) {}
