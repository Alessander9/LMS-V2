package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "plantilla_certificado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantillaCertificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(name = "imagen_fondo", columnDefinition = "TEXT")
    private String imagenFondo;

    @Column(name = "firma_director", columnDefinition = "TEXT")
    private String firmaDirector;

    @Column(name = "cargo_director", length = 150)
    private String cargoDirector;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
