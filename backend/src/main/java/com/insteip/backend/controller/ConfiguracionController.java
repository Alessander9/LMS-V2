package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.configuracion.ConfiguracionRequest;
import com.insteip.backend.domain.dto.configuracion.ConfiguracionResponse;
import com.insteip.backend.service.interfaces.ConfiguracionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<ConfiguracionResponse> obtenerConfiguracion() {
        return ResponseEntity.ok(configuracionService.obtenerConfiguracion());
    }

    @PutMapping
    public ResponseEntity<ConfiguracionResponse> actualizarConfiguracion(
            @Valid @RequestBody ConfiguracionRequest request) {
        return ResponseEntity.ok(configuracionService.actualizarConfiguracion(request));
    }
}
