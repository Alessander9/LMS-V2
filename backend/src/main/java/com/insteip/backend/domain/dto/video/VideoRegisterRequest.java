package com.insteip.backend.domain.dto.video;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VideoRegisterRequest {
    @NotNull(message = "El ID del módulo es obligatorio")
    private Long moduloId;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String descripcion;

    @NotBlank(message = "La URL de YouTube es obligatoria")
    private String youtubeUrl;

    private Integer orden;
}
