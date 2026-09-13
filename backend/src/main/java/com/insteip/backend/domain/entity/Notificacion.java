package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones", indexes = {
    @Index(name = "idx_notificaciones_usuario_leido", columnList = "usuario_id, leido, fecha_creacion"),
    @Index(name = "idx_notificaciones_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(name = "url_destino", length = 500)
    private String urlDestino;

    @Column(length = 50)
    @Builder.Default
    private String icono = "notifications";

    @Column(nullable = false)
    @Builder.Default
    private Boolean leido = false;

    @Column(length = 20)
    @Builder.Default
    private String prioridad = "INFO"; // 'INFO', 'AVISO', 'URGENTE', 'PROMO'

    @Column(nullable = false)
    @Builder.Default
    private Boolean fijado = false;

    @Column(name = "adjunto_url", columnDefinition = "TEXT")
    private String adjuntoUrl;

    @Column(name = "adjunto_nombre", length = 200)
    private String adjuntoNombre;

    @Column(name = "adjunto_tamano", length = 50)
    private String adjuntoTamano;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
