package com.insteip.backend.domain.dto.tarea;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TareaResponseDTO {
    private Long id;
    private Long moduloId;
    private String moduloNombre;
    private Integer moduloOrden;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaLimite;
    private Boolean permitirReenvio;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
    private Integer totalEntregas;
}
