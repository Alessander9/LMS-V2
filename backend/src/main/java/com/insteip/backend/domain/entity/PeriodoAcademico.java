package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "periodos_academicos", indexes = {
    @Index(name = "idx_periodos_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "tipo_periodo", nullable = false, length = 30)
    @Builder.Default
    private String tipoPeriodo = "BIMESTRE"; // BIMESTRE, TRIMESTRE, SEMESTRE, ANUAL

    @Column(name = "tipo_institucion", nullable = false, length = 30)
    @Builder.Default
    private String tipoInstitucion = "COLEGIO_SECUNDARIA"; // COLEGIO_PRIMARIA, COLEGIO_SECUNDARIA, INSTITUTO

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_creacion", updatable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
