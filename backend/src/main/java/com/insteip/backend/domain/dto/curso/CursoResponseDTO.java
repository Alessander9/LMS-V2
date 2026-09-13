package com.insteip.backend.domain.dto.curso;

public record CursoResponseDTO(
    Long id,
    String nombre,
    String descripcion,
    String imagenPortada,
    java.util.List<String> nivelesSuscripcion,
    Boolean estado,
    Long docenteId,
    String docenteNombre,
    java.time.LocalDateTime fechaCreacion
){}
