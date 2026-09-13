package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos", indexes = {
    @Index(name = "idx_pagos_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_pagos_nivel_suscripcion_id", columnList = "nivel_suscripcion_id"),
    @Index(name = "idx_pagos_fecha_pago", columnList = "fecha_pago")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nivel_suscripcion_id", nullable = false)
    private NivelSuscripcion nivelSuscripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "numero_operacion", length = 150)
    private String numeroOperacion;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false)
    @Builder.Default
    private Boolean aprobado = false;

    @Column(name = "fecha_pago", nullable = false)
    @Builder.Default
    private LocalDateTime fechaPago = LocalDateTime.now();

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprobado_por")
    private Usuario aprobadoPor;
}
