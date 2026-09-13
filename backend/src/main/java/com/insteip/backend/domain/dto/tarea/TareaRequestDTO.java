package com.insteip.backend.domain.dto.tarea;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TareaRequestDTO {

    @NotNull(message = "El módulo es obligatorio")
    private Long moduloId;

    @NotBlank(message = "El título de la tarea es obligatorio")
    private String titulo;

    private String descripcion;

    private LocalDateTime fechaLimite;

    @Builder.Default
    private Boolean permitirReenvio = true;

    @Builder.Default
    private Boolean estado = true;
}
