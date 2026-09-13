package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.notificacion.ComunicadoRequestDTO;
import com.insteip.backend.domain.dto.notificacion.NotificacionResumenDTO;
import com.insteip.backend.service.interfaces.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/mis-notificaciones")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificacionResumenDTO> obtenerMisNotificaciones(
            @RequestParam(defaultValue = "20") int limite,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(notificacionService.obtenerNotificacionesUsuario(correo, limite));
    }

    @PatchMapping("/{id}/leer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarComoLeida(
            @PathVariable Long id,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        notificacionService.marcarComoLeida(id, correo);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/leer-todas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarTodasComoLeidas(Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        notificacionService.marcarTodasComoLeidas(correo);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comunicado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> enviarComunicado(
            @Valid @RequestBody ComunicadoRequestDTO request,
            Authentication authentication) {
        String correoAdmin = authentication != null ? authentication.getName() : "admin";
        notificacionService.enviarComunicadoSegmentado(request, correoAdmin);
        return ResponseEntity.ok().build();
    }
}
