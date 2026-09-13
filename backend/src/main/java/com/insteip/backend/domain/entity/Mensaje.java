package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes", indexes = {
    @Index(name = "idx_mensajes_conversacion", columnList = "conversacion_id, fecha_envio"),
    @Index(name = "idx_mensajes_destinatario_leido", columnList = "destinatario_id, leido, fecha_envio"),
    @Index(name = "idx_mensajes_remitente", columnList = "remitente_id, fecha_envio")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversacion_id", nullable = false)
    private Conversacion conversacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "remitente_id", nullable = false)
    private Usuario remitente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id")
    private Usuario destinatario;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String prioridad = "NORMAL"; // 'NORMAL', 'IMPORTANTE', 'URGENTE'

    @Column(name = "adjunto_url", columnDefinition = "TEXT")
    private String adjuntoUrl;

    @Column(name = "adjunto_nombre", length = 200)
    private String adjuntoNombre;

    @Column(name = "adjunto_tamano", length = 50)
    private String adjuntoTamano;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean leido = false;

    @Column(name = "fecha_leido")
    private LocalDateTime fechaLeido;

    @Column(name = "destacado_remitente", nullable = false)
    @Builder.Default
    private Boolean destacadoRemitente = false;

    @Column(name = "destacado_destinatario", nullable = false)
    @Builder.Default
    private Boolean destacadoDestinatario = false;

    @CreationTimestamp
    @Column(name = "fecha_envio", updatable = false)
    private LocalDateTime fechaEnvio;
}
