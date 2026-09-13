package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    @Column(nullable = false, length = 250)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "youtube_url", nullable = false, columnDefinition = "TEXT")
    private String youtubeUrl;

    @Column(name = "youtube_id", length = 50)
    private String youtubeId;

    @Column(name = "duracion_segundos")
    private Integer duracionSegundos;

    @Column(nullable = false)
    private Integer orden;

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    @Column(name = "fecha_creacion", updatable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
