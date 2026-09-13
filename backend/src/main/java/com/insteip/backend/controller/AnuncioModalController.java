package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.anuncio.AnuncioModalRequestDTO;
import com.insteip.backend.domain.dto.anuncio.AnuncioModalResponseDTO;
import com.insteip.backend.service.interfaces.AnuncioModalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anuncios-modal")
@RequiredArgsConstructor
public class AnuncioModalController {

    private final AnuncioModalService anuncioModalService;

    @GetMapping("/activo")
    public ResponseEntity<AnuncioModalResponseDTO> obtenerAnuncioActivo(Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : null;
        AnuncioModalResponseDTO anuncio = anuncioModalService.obtenerAnuncioActivoParaUsuario(correo);
        return ResponseEntity.ok(anuncio);
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<AnuncioModalResponseDTO>> listarTodosParaAdmin() {
        return ResponseEntity.ok(anuncioModalService.listarTodosParaAdmin());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<AnuncioModalResponseDTO> crear(
            @Valid @RequestBody AnuncioModalRequestDTO request,
            Authentication authentication) {
        String correoAdmin = authentication != null ? authentication.getName() : "admin@insteip.com";
        return new ResponseEntity<>(anuncioModalService.crear(request, correoAdmin), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<AnuncioModalResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody AnuncioModalRequestDTO request,
            Authentication authentication) {
        String correoAdmin = authentication != null ? authentication.getName() : "admin@insteip.com";
        return ResponseEntity.ok(anuncioModalService.actualizar(id, request, correoAdmin));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean estado,
            Authentication authentication) {
        String correoAdmin = authentication != null ? authentication.getName() : "admin@insteip.com";
        anuncioModalService.cambiarEstado(id, estado, correoAdmin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            Authentication authentication) {
        String correoAdmin = authentication != null ? authentication.getName() : "admin@insteip.com";
        anuncioModalService.eliminar(id, correoAdmin);
        return ResponseEntity.noContent().build();
    }
}
