package com.insteip.backend.domain.dto.material;

public record MaterialResponseDTO(
    Long id,
    String nombre,
    String archivoUrl,
    String tipoArchivo,
    Long pesoBytes,
    Boolean estado,
    java.time.LocalDateTime fechaSubida
){}
