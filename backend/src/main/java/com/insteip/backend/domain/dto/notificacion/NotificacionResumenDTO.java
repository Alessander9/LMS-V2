package com.insteip.backend.domain.dto.notificacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionResumenDTO {
    private long totalNoLeidas;
    private List<NotificacionResponseDTO> notificaciones;
}
