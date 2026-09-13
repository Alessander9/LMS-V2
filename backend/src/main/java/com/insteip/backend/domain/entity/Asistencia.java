package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "asistencias", uniqueConstraints = {
    @UniqueConstraint(name = "uq_asistencia_sesion_estudiante", columnNames = {"sesion_id", "estudiante_id"})
}, indexes = {
    @Index(name = "idx_asistencias_sesion", columnList = "sesion_id"),
    @Index(name = "idx_asistencias_estudiante", columnList = "estudiante_id"),
    @Index(name = "idx_asistencias_estado", columnList = "estado")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sesion_id", nullable = false)
    private SesionClase sesion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private EstudiantePerfil estudiante;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "PRESENTE"; // PRESENTE, TARDANZA, FALTA_JUSTIFICADA, FALTA_INJUSTIFICADA

    @Column(name = "metodo_marcacion", length = 30)
    @Builder.Default
    private String metodoMarcacion = "QR_SCAN"; // QR_SCAN, QR_SESION, MANUAL

    @Column(name = "fecha_hora_marcacion", updatable = false)
    @Builder.Default
    private LocalDateTime fechaHoraMarcacion = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
