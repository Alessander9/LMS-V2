package com.insteip.backend.domain.dto.evento;

import java.time.LocalDateTime;

public record LoginAuditoriaResponseDTO(
        Long id,
        Long usuarioId,
        String correo,
        String ip,
        String userAgent,
        Boolean exitoso,
        String motivo,
        LocalDateTime fecha
) {}
