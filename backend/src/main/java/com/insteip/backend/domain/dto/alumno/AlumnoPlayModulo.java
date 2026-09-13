package com.insteip.backend.domain.dto.alumno;

import java.util.List;

public record AlumnoPlayModulo(
    Long id,
    String nombre,
    String descripcion,
    Integer orden,
    List<AlumnoPlayVideo> videos,
    List<AlumnoPlayMaterial> materiales,
    Boolean bloqueado,
    String mensajeBloqueo
) {
    public AlumnoPlayModulo(
        Long id,
        String nombre,
        String descripcion,
        Integer orden,
        List<AlumnoPlayVideo> videos,
        List<AlumnoPlayMaterial> materiales
    ) {
        this(id, nombre, descripcion, orden, videos, materiales, false, null);
    }
}
