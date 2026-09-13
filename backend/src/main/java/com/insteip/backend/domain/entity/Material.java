package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "materiales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    @Column(nullable = false, length = 250)
    private String nombre;

    @Column(name = "archivo_url", nullable = false, columnDefinition = "TEXT")
    private String archivoUrl;

    @Column(name = "archivo_interno", nullable = false, unique = true, length = 120)
    private String archivoInterno;

    @Column(name = "tipo_archivo", length = 100)
    private String tipoArchivo;

    @Column(name = "peso_bytes")
    private Long pesoBytes;


    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;

    @Column(name = "fecha_subida", updatable = false)
    @Builder.Default
    private LocalDateTime fechaSubida = LocalDateTime.now();
}
