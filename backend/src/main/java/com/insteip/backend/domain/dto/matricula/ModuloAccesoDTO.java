package com.insteip.backend.domain.dto.matricula;

import java.time.LocalDateTime;

public record ModuloAccesoDTO(
    Long moduloId,
    String nombreModulo,
    Integer orden,
    Boolean habilitado,
    LocalDateTime fechaHabilitacion
) {}
