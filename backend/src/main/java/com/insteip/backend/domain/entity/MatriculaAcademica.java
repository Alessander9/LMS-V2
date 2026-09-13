package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "matriculas_academicas", uniqueConstraints = {
    @UniqueConstraint(name = "uq_estudiante_periodo", columnNames = {"estudiante_id", "periodo_academico_id"})
}, indexes = {
    @Index(name = "idx_mat_acad_estudiante", columnList = "estudiante_id"),
    @Index(name = "idx_mat_acad_seccion", columnList = "seccion_grado_id"),
    @Index(name = "idx_mat_acad_periodo", columnList = "periodo_academico_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private EstudiantePerfil estudiante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seccion_grado_id", nullable = false)
    private SeccionGrado seccionGrado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "periodo_academico_id", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @Column(length = 30)
    @Builder.Default
    private String estado = "ACTIVA"; // ACTIVA, RETIRADO, TRASLADADO, CULMINADA

    @Column(name = "fecha_matricula", updatable = false)
    @Builder.Default
    private LocalDateTime fechaMatricula = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
