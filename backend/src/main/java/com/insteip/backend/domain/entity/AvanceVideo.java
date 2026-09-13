package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "avance_videos", uniqueConstraints = {
    @UniqueConstraint(name = "uq_avance_usuario_video", columnNames = {"usuario_id", "video_id"})
}, indexes = {
    @Index(name = "idx_avance_videos_usuario", columnList = "usuario_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvanceVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "ultimo_segundo", nullable = false)
    @Builder.Default
    private Integer ultimoSegundo = 0;

    @Column(name = "porcentaje_visto", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal porcentajeVisto = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completado = false;

    @Column(name = "fecha_actualizacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaActualizacion = LocalDateTime.now();
}
