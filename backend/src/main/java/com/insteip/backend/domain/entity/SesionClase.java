package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesiones_clase", indexes = {
    @Index(name = "idx_sesiones_fecha", columnList = "fecha"),
    @Index(name = "idx_sesiones_curso", columnList = "curso_id"),
    @Index(name = "idx_sesiones_seccion", columnList = "seccion_grado_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seccion_grado_id", nullable = false)
    private SeccionGrado seccionGrado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(length = 250)
    private String tema;

    @Column(name = "qr_sesion_token", unique = true, length = 200)
    private String qrSesionToken;

    @Column(length = 30)
    @Builder.Default
    private String estado = "ABIERTA"; // ABIERTA, CERRADA, CANCELADA

    @Column(name = "fecha_creacion", updatable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
