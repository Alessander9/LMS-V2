package com.insteip.backend.domain.dto.tarea;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalificarEntregaDTO {

    @NotNull(message = "La calificación es obligatoria")
    @DecimalMin(value = "0.0", message = "La calificación mínima es 0")
    @DecimalMax(value = "20.0", message = "La calificación máxima es 20")
    private BigDecimal calificacion;

    private String feedbackDocente;

    private String estado; // Opcional, si es null se calcula: >= 14 APROBADO, sino DESAPROBADO
}
