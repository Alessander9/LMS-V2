package com.insteip.backend.domain.dto.mensajeria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuzonResumenDTO {
    private long totalRecibidos;
    private long totalNoLeidos;
    private long totalEnviados;
    private long totalDestacados;
}
