package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_auditoria", indexes = {
    @Index(name = "idx_login_auditoria_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_login_auditoria_correo", columnList = "correo"),
    @Index(name = "idx_login_auditoria_fecha", columnList = "fecha")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(length = 150)
    private String correo;

    @Column(length = 100)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(nullable = false)
    private Boolean exitoso;

    @Column(length = 255)
    private String motivo;

    @Column(name = "fecha", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime fecha = LocalDateTime.now();
}
