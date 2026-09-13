package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.configuracion.ConfiguracionRequest;
import com.insteip.backend.domain.dto.configuracion.ConfiguracionResponse;
import com.insteip.backend.domain.entity.ConfiguracionInstitucion;
import com.insteip.backend.repository.ConfiguracionInstitucionRepository;
import com.insteip.backend.service.interfaces.ConfiguracionService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConfiguracionServiceImpl implements ConfiguracionService {

    private final ConfiguracionInstitucionRepository repository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Override
    public ConfiguracionResponse obtenerConfiguracion() {
        ConfiguracionInstitucion config = getOrCreateConfig();
        return toResponse(config);
    }

    @Override
    public ConfiguracionResponse actualizarConfiguracion(ConfiguracionRequest request) {
        ConfiguracionInstitucion config = getOrCreateConfig();

        config.setNombreInstitucion(request.nombreInstitucion());
        config.setLogoUrl(request.logoUrl());
        config.setCorreo(request.correo());
        config.setTelefono(request.telefono());
        config.setDireccion(request.direccion());
        config.setQrYape(request.qrYape());
        config.setQrPlin(request.qrPlin());
        config.setPaypalUrl(request.paypalUrl());
        config.setColorPrincipal(request.colorPrincipal());
        config.setColorSecundario(request.colorSecundario());

        config = repository.save(config);
        auditoriaService.registrarEvento("CONFIGURACION", "EDITAR", "Modificada configuración de la institución");
        return toResponse(config);
    }

    /**
     * Obtiene la única fila de configuración o crea una con valores por defecto.
     */
    private ConfiguracionInstitucion getOrCreateConfig() {
        return repository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    ConfiguracionInstitucion defaults = ConfiguracionInstitucion.builder()
                            .nombreInstitucion("INSTEIP")
                            .correo("")
                            .telefono("")
                            .direccion("")
                            .logoUrl("")
                            .qrYape("")
                            .qrPlin("")
                            .paypalUrl("")
                            .colorPrincipal("#6366f1")
                            .colorSecundario("#0b0f19")
                            .build();
                    return repository.save(defaults);
                });
    }

    private ConfiguracionResponse toResponse(ConfiguracionInstitucion c) {
        return new ConfiguracionResponse(
                c.getId(),
                c.getNombreInstitucion(),
                c.getLogoUrl(),
                c.getCorreo(),
                c.getTelefono(),
                c.getDireccion(),
                c.getQrYape(),
                c.getQrPlin(),
                c.getPaypalUrl(),
                c.getColorPrincipal(),
                c.getColorSecundario()
        );
    }
}
