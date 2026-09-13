package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.avance.AvanceProgressRequest;
import com.insteip.backend.domain.dto.avance.AvanceProgressResponse;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AvanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avance")
@PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
@RequiredArgsConstructor
public class AvanceController {

    private final AvanceService avanceService;

    private final UsuarioRepository usuarioRepository;

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalStateException("La autenticación es obligatoria");
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(usuario -> usuario.getId())
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado"));
    }

    @PostMapping
    public ResponseEntity<AvanceProgressResponse> guardarProgreso(
            Authentication authentication,
            @Valid @RequestBody AvanceProgressRequest request) {
        Long usuarioId = getUsuarioId(authentication);
        return ResponseEntity.ok(avanceService.guardarProgreso(usuarioId, request));
    }

    @GetMapping("/video/{id}")
    public ResponseEntity<AvanceProgressResponse> obtenerProgreso(
            Authentication authentication,
            @PathVariable Long id) {
        Long usuarioId = getUsuarioId(authentication);
        try {
            return ResponseEntity.ok(avanceService.obtenerProgreso(usuarioId, id));
        } catch (Exception e) {
            return ResponseEntity.ok(AvanceProgressResponse.builder()
                    .videoId(id)
                    .ultimoSegundo(0)
                    .porcentajeVisto(java.math.BigDecimal.ZERO)
                    .completado(false)
                    .build());
        }
    }
}
