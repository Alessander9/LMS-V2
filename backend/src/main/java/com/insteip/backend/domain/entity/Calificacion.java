package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calificaciones", uniqueConstraints = {
    @UniqueConstraint(name = "uq_calificacion_mat_eval", columnNames = {"matricula_academica_id", "evaluacion_id"})
}, indexes = {
    @Index(name = "idx_calif_matricula", columnList = "matricula_academica_id"),
    @Index(name = "idx_calif_evaluacion", columnList = "evaluacion_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matricula_academica_id", nullable = false)
    private MatriculaAcademica matriculaAcademica;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluacion_id", nullable = false)
    private EvaluacionConfig evaluacion;

    @Column(name = "valor_numerico", precision = 4, scale = 2)
    private BigDecimal valorNumerico; // 0.00 a 20.00 (para institutos)

    @Column(name = "valor_literal", length = 5)
    private String valorLiteral; // AD, A, B, C (para colegios)

    @Column(name = "promedio_calculado", precision = 4, scale = 2)
    private BigDecimal promedioCalculado;

    @Column(name = "promedio_literal", length = 5)
    private String promedioLiteral;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @Column(name = "fecha_registro", updatable = false)
    @Builder.Default
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String observacion;
}
