package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "secciones_grados", indexes = {
    @Index(name = "idx_secciones_nivel", columnList = "nivel"),
    @Index(name = "idx_secciones_tutor", columnList = "tutor_docente_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeccionGrado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String nivel; // PRIMARIA, SECUNDARIA, SUPERIOR

    @Column(name = "grado_o_ciclo", nullable = false, length = 100)
    private String gradoOCiclo; // Ej: '1° de Primaria', '5° de Secundaria', 'Ciclo III - Desarrollo Web'

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String seccion = "A";

    @Column(length = 30)
    @Builder.Default
    private String turno = "MAÑANA"; // MAÑANA, TARDE, NOCHE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_docente_id")
    private Usuario tutorDocente;

    @Column(name = "capacidad_maxima")
    @Builder.Default
    private Integer capacidadMaxima = 35;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
