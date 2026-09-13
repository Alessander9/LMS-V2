package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventos_sistema", indexes = {
    @Index(name = "idx_eventos_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_eventos_fecha", columnList = "fecha")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String modulo;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime fecha = LocalDateTime.now();
}
