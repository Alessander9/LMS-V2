package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "avance_cursos", uniqueConstraints = {
    @UniqueConstraint(name = "uq_avance_usuario_curso", columnNames = {"usuario_id", "curso_id"})
}, indexes = {
    @Index(name = "idx_avance_cursos_curso_id", columnList = "curso_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvanceCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "porcentaje_avance", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal porcentajeAvance = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completado = false;

    @Column(name = "fecha_actualizacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaActualizacion = LocalDateTime.now();
}
