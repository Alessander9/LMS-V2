package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "entregas_tareas", uniqueConstraints = {
        @UniqueConstraint(name = "uq_entrega_tarea_usuario", columnNames = {"tarea_id", "usuario_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntregaTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tarea_id", nullable = false)
    private Tarea tarea;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "archivo_url", nullable = false, columnDefinition = "TEXT")
    private String archivoUrl;

    @Column(name = "archivo_interno", nullable = false, unique = true, length = 120)
    private String archivoInterno;

    @Column(name = "tipo_archivo", length = 100)
    private String tipoArchivo;

    @Column(name = "peso_bytes")
    private Long pesoBytes;

    @Column(name = "comentario_alumno", columnDefinition = "TEXT")
    private String comentarioAlumno;

    @Column(name = "calificacion", precision = 4, scale = 2)
    private BigDecimal calificacion;

    @Column(name = "feedback_docente", columnDefinition = "TEXT")
    private String feedbackDocente;

    @Column(name = "fecha_entrega", updatable = false)
    @Builder.Default
    private LocalDateTime fechaEntrega = LocalDateTime.now();

    @Column(name = "fecha_calificacion")
    private LocalDateTime fechaCalificacion;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "ENTREGADO"; // 'ENTREGADO', 'APROBADO', 'DESAPROBADO', 'OBSERVADO'
}
