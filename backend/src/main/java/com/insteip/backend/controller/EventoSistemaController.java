package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.evento.EventoSistemaResponseDTO;
import com.insteip.backend.service.interfaces.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class EventoSistemaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<EventoSistemaResponseDTO>> listarEventosSistema() {
        return ResponseEntity.ok(auditoriaService.listarEventosSistema());
    }

    @GetMapping("/modulo/{modulo}")
    public ResponseEntity<List<EventoSistemaResponseDTO>> listarEventosPorModulo(@PathVariable String modulo) {
        return ResponseEntity.ok(auditoriaService.listarEventosSistemaPorModulo(modulo));
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<EventoSistemaResponseDTO>> listarEventosPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.listarEventosSistemaPorUsuario(id));
    }
}
