package com.insteip.backend.domain.dto.certificado;

import java.time.LocalDateTime;

public record CertificadoResponseDTO(
    Long id,
    Long usuarioId,
    Long cursoId,
    String alumnoNombre,
    String alumnoCorreo,
    String cursoNombre,
    String codigo,
    String archivoPdf,
    String urlValidacion,
    String numeroRegistro,
    LocalDateTime fechaEmision
) {}
