package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "matricula_modulos_acceso", uniqueConstraints = {
    @UniqueConstraint(name = "uq_matricula_modulo_acceso", columnNames = {"matricula_id", "modulo_id"})
}, indexes = {
    @Index(name = "idx_matricula_modulos_matricula", columnList = "matricula_id"),
    @Index(name = "idx_matricula_modulos_modulo", columnList = "modulo_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaModuloAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean habilitado = true;

    @Column(name = "fecha_habilitacion")
    @Builder.Default
    private LocalDateTime fechaHabilitacion = LocalDateTime.now();
}
