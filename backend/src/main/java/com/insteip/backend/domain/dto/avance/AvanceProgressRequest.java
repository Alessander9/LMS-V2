package com.insteip.backend.domain.dto.avance;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvanceProgressRequest {
    @NotNull(message = "El ID del video es obligatorio")
    private Long videoId;

    @NotNull(message = "El último segundo es obligatorio")
    private Integer ultimoSegundo;

    private Integer duracionSegundos;
}

