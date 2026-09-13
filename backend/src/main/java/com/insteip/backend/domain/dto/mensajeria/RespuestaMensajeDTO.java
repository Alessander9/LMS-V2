package com.insteip.backend.domain.dto.mensajeria;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaMensajeDTO {

    @NotBlank(message = "El contenido de la respuesta es obligatorio")
    private String contenido;

    private String adjuntoUrl;
    private String adjuntoNombre;
    private String adjuntoTamano;
    private String audioUrl;
}
