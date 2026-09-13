package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.mensajeria.*;
import com.insteip.backend.service.interfaces.MensajeriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensajeria")
@RequiredArgsConstructor
public class MensajeriaController {

    private final MensajeriaService mensajeriaService;

    @PostMapping("/enviar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MensajeResponseDTO> enviarMensaje(
            @Valid @RequestBody MensajeRequestDTO request,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return new ResponseEntity<>(mensajeriaService.enviarMensaje(request, correo), HttpStatus.CREATED);
    }

    @PostMapping("/conversaciones/{id}/responder")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MensajeResponseDTO> responderMensaje(
            @PathVariable Long id,
            @Valid @RequestBody RespuestaMensajeDTO request,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return new ResponseEntity<>(mensajeriaService.responderMensaje(id, request, correo), HttpStatus.CREATED);
    }

    @GetMapping("/conversaciones")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ConversacionResponseDTO>> listarConversaciones(
            @RequestParam(required = false) Long cursoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(mensajeriaService.listarConversaciones(correo, cursoId, PageRequest.of(page, size)));
    }

    @GetMapping("/conversaciones/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversacionResponseDTO> obtenerConversacion(
            @PathVariable Long id,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(mensajeriaService.obtenerConversacion(id, correo));
    }

    @GetMapping("/bandeja")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MensajeResponseDTO>> obtenerBandeja(
            @RequestParam(defaultValue = "RECIBIDOS") String carpeta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(mensajeriaService.obtenerBandeja(correo, carpeta, PageRequest.of(page, size)));
    }

    @PatchMapping("/mensajes/{id}/leer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarComoLeido(
            @PathVariable Long id,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        mensajeriaService.marcarComoLeido(id, correo);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/conversaciones/{id}/leer-todas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarConversacionComoLeida(
            @PathVariable Long id,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        mensajeriaService.marcarConversacionComoLeida(id, correo);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/mensajes/{id}/destacar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> toggleDestacado(
            @PathVariable Long id,
            Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        mensajeriaService.toggleDestacado(id, correo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/destinatarios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DestinatarioDTO>> obtenerDestinatarios(Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(mensajeriaService.obtenerDestinatariosDisponibles(correo));
    }

    @GetMapping("/resumen")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BuzonResumenDTO> obtenerResumen(Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(mensajeriaService.obtenerResumenBuzon(correo));
    }
}
