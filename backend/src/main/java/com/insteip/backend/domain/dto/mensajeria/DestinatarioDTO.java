package com.insteip.backend.domain.dto.mensajeria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinatarioDTO {
    private Long id;
    private String nombreCompleto;
    private String correo;
    private String rol;
    private String cursoNombre;
    private Long cursoId;
}
