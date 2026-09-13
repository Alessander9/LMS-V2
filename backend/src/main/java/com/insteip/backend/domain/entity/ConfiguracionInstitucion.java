package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "configuracion_institucion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionInstitucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_institucion", length = 250)
    private String nombreInstitucion;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "correo", length = 150)
    private String correo;

    @Column(length = 50)
    private String telefono;

    @Column(name = "direccion", length = 250)
    private String direccion;

    @Column(name = "qr_yape", columnDefinition = "TEXT")
    private String qrYape;

    @Column(name = "qr_plin", columnDefinition = "TEXT")
    private String qrPlin;

    @Column(name = "paypal_url", columnDefinition = "TEXT")
    private String paypalUrl;

    @Column(name = "color_principal", length = 50)
    private String colorPrincipal;

    @Column(name = "color_secundario", length = 50)
    private String colorSecundario;
}
