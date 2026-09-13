package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_cambio_notas", indexes = {
    @Index(name = "idx_hist_calificacion", columnList = "calificacion_id"),
    @Index(name = "idx_hist_usuario", columnList = "modificado_por")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistorialCambioNota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calificacion_id", nullable = false)
    private Calificacion calificacion;

    @Column(name = "nota_anterior_num", precision = 4, scale = 2)
    private BigDecimal notaAnteriorNum;

    @Column(name = "nota_anterior_lit", length = 5)
    private String notaAnteriorLit;

    @Column(name = "nota_nueva_num", precision = 4, scale = 2)
    private BigDecimal notaNuevaNum;

    @Column(name = "nota_nueva_lit", length = 5)
    private String notaNuevaLit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modificado_por", nullable = false)
    private Usuario modificadoPor;

    @Column(name = "fecha_modificacion", updatable = false)
    @Builder.Default
    private LocalDateTime fechaModificacion = LocalDateTime.now();

    @Column(name = "motivo_justificacion", nullable = false, columnDefinition = "TEXT")
    private String motivoJustificacion;
}
