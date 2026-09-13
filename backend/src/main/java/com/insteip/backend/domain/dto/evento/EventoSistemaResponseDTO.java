package com.insteip.backend.domain.dto.evento;

import java.time.LocalDateTime;

public record EventoSistemaResponseDTO(
        Long id,
        Long usuarioId,
        String modulo,
        String accion,
        String descripcion,
        LocalDateTime fecha
) {}
