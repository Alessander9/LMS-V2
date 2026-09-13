package com.insteip.backend.domain.dto.certificado;

import java.time.LocalDate;

public record CertificadoValidacionResponse(
    Boolean valido,
    String alumno,
    String curso,
    LocalDate fechaEmision,
    String codigo
) {}
