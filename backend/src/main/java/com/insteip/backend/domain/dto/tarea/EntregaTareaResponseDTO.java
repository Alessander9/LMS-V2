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
public class EntregaTareaResponseDTO {
    private Long id;
    private Long tareaId;
    private String tareaTitulo;
    private Long usuarioId;
    private String alumnoNombre;
    private String alumnoCorreo;
    private String archivoUrl;
    private String tipoArchivo;
    private Long pesoBytes;
    private String comentarioAlumno;
    private BigDecimal calificacion;
    private String feedbackDocente;
    private LocalDateTime fechaEntrega;
    private LocalDateTime fechaCalificacion;
    private String estado; // 'ENTREGADO', 'APROBADO', 'DESAPROBADO', 'OBSERVADO'
}
