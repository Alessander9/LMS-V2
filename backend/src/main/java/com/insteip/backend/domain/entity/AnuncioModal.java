package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "anuncios_modal", indexes = {
    @Index(name = "idx_anuncios_modal_activo", columnList = "activo, fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnuncioModal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "boton_texto", length = 100)
    @Builder.Default
    private String botonTexto = "Ver Más";

    @Column(name = "boton_url", length = 500)
    private String botonUrl;

    @Column(length = 50)
    @Builder.Default
    private String audiencia = "TODOS"; // 'TODOS', 'SOLO_ESTUDIANTES', 'SOLO_DOCENTES', 'DOCENTES_Y_ESTUDIANTES'

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "creado_por", length = 150)
    private String creadoPor;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
