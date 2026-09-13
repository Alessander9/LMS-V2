package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.configuracion.ConfiguracionRequest;
import com.insteip.backend.domain.dto.configuracion.ConfiguracionResponse;

public interface ConfiguracionService {
    ConfiguracionResponse obtenerConfiguracion();
    ConfiguracionResponse actualizarConfiguracion(ConfiguracionRequest request);
}
