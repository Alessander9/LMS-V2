package com.insteip.backend.domain.dto.configuracion;

import jakarta.validation.constraints.NotBlank;

public record ConfiguracionRequest(
    @NotBlank(message = "El nombre de la institución es obligatorio")
    String nombreInstitucion,
    
    String logoUrl,
    
    String correo,
    
    String telefono,
    
    String direccion,
    
    String qrYape,
    
    String qrPlin,
    
    String paypalUrl,
    
    String colorPrincipal,
    
    String colorSecundario
) {}
