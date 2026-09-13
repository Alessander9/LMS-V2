package com.insteip.backend.domain.dto.certificado;

import java.time.LocalDateTime;

public record AlumnoCertificadoResponse(
    Long id,
    String codigo,
    String cursoNombre,
    LocalDateTime fechaEmision,
    String archivoPdf,
    String urlValidacion
) {}
