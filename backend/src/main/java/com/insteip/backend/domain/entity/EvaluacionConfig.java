package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "evaluaciones_config", indexes = {
    @Index(name = "idx_eval_curso", columnList = "curso_id"),
    @Index(name = "idx_eval_periodo", columnList = "periodo_academico_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "periodo_academico_id", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "tipo_escala", nullable = false, length = 20)
    @Builder.Default
    private String tipoEscala = "LITERAL"; // LITERAL (AD, A, B, C) o VIGESIMAL (0 a 20)

    @Column(name = "peso_porcentual", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pesoPorcentual = new BigDecimal("100.00");

    @Builder.Default
    private Integer orden = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
