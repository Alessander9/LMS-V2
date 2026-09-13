package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "matriculas", uniqueConstraints = {
    @UniqueConstraint(name = "uq_matricula_usuario_curso", columnNames = {"usuario_id", "curso_id"})
}, indexes = {
    @Index(name = "idx_matriculas_usuario", columnList = "usuario_id"),
    @Index(name = "idx_matriculas_curso", columnList = "curso_id"),
    @Index(name = "idx_matriculas_fecha_expiracion", columnList = "fecha_expiracion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "fecha_matricula", updatable = false)
    @Builder.Default
    private LocalDateTime fechaMatricula = LocalDateTime.now();

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    /**
     * Calcula automáticamente la fecha de expiración (12 meses después de la matrícula)
     * antes de persistir si no fue establecida manualmente.
     */
    @PrePersist
    private void calcularFechaExpiracion() {
        if (this.fechaExpiracion == null && this.fechaMatricula != null) {
            this.fechaExpiracion = this.fechaMatricula.plusMonths(12);
        }
    }
}
