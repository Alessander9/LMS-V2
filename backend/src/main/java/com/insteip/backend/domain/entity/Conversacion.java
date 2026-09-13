package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversaciones", indexes = {
    @Index(name = "idx_conversaciones_emisor", columnList = "emisor_id, fecha_ultimo_mensaje"),
    @Index(name = "idx_conversaciones_destinatario", columnList = "destinatario_id, fecha_ultimo_mensaje"),
    @Index(name = "idx_conversaciones_curso", columnList = "curso_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String asunto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emisor_id", nullable = false)
    private Usuario emisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id")
    private Usuario destinatario;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String tipo = "INDIVIDUAL"; // 'INDIVIDUAL', 'CURSO_MASIVO', 'ROL_MASIVO'

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String prioridad = "NORMAL"; // 'NORMAL', 'IMPORTANTE', 'URGENTE'

    @Column(name = "ultimo_mensaje", columnDefinition = "TEXT")
    private String ultimoMensaje;

    @Column(name = "fecha_ultimo_mensaje")
    private LocalDateTime fechaUltimoMensaje;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
