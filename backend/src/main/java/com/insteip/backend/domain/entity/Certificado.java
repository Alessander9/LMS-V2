package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificados", uniqueConstraints = {
    @UniqueConstraint(name = "uq_certificado_usuario_curso", columnNames = {"usuario_id", "curso_id"})
}, indexes = {
    @Index(name = "idx_certificados_codigo", columnList = "codigo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(name = "archivo_pdf", columnDefinition = "TEXT")
    private String archivoPdf;

    @Column(name = "url_validacion", columnDefinition = "TEXT")
    private String urlValidacion;

    @Column(name = "numero_registro", length = 100)
    private String numeroRegistro;

    @Column(name = "fecha_emision", updatable = false)
    @Builder.Default
    private LocalDateTime fechaEmision = LocalDateTime.now();

}
