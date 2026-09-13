package com.insteip.backend.domain.dto.tarea;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumnoTareaItemDTO {
    private Long id; // Tarea ID
    private Long cursoId;
    private String cursoNombre;
    private Long moduloId;
    private String moduloNombre;
    private Integer moduloOrden;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaLimite;
    private Boolean permitirReenvio;
    private Boolean vencida;
    
    // Datos de entrega del alumno (si existe)
    private Boolean entregada;
    private Long entregaId;
    private String archivoUrl;
    private String tipoArchivo;
    private Long pesoBytes;
    private String comentarioAlumno;
    private BigDecimal calificacion;
    private String feedbackDocente;
    private LocalDateTime fechaEntrega;
    private LocalDateTime fechaCalificacion;
    private String estadoEntrega; // 'PENDIENTE', 'ENTREGADO', 'APROBADO', 'DESAPROBADO', 'OBSERVADO'
}
