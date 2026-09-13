package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.evento.EventoSistemaResponseDTO;
import com.insteip.backend.domain.dto.evento.LoginAuditoriaResponseDTO;
import com.insteip.backend.service.interfaces.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping("/login")
    public ResponseEntity<List<LoginAuditoriaResponseDTO>> listarLoginAuditoria(
            @RequestParam(required = false) LocalDate fecha,
            @RequestParam(required = false) String correo,
            @RequestParam(required = false) Boolean resultado) {
        return ResponseEntity.ok(auditoriaService.listarLoginAuditorias(fecha, correo, resultado));
    }

    @GetMapping("/login/usuario/{id}")
    public ResponseEntity<List<LoginAuditoriaResponseDTO>> listarLoginAuditoriaPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.listarLoginAuditoriasPorUsuario(id));
    }

    @GetMapping("/eventos")
    public ResponseEntity<List<EventoSistemaResponseDTO>> listarEventosSistema() {
        return ResponseEntity.ok(auditoriaService.listarEventosSistema());
    }

    @GetMapping("/eventos/modulo/{modulo}")
    public ResponseEntity<List<EventoSistemaResponseDTO>> listarEventosPorModulo(@PathVariable String modulo) {
        return ResponseEntity.ok(auditoriaService.listarEventosSistemaPorModulo(modulo));
    }

    @GetMapping("/eventos/usuario/{id}")
    public ResponseEntity<List<EventoSistemaResponseDTO>> listarEventosPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.listarEventosSistemaPorUsuario(id));
    }
}
