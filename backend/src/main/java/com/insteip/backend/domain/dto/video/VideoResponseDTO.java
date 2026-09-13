package com.insteip.backend.domain.dto.video;

public record VideoResponseDTO(
    Long id,
    String titulo,
    String descripcion,
    String youtubeUrl,
    Integer orden,
    Boolean estado,
    java.time.LocalDateTime fechaCreacion,
    Integer duracionSegundos
){}
