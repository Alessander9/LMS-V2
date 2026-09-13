package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.material.MaterialResponseDTO;
import com.insteip.backend.domain.dto.modulo.ModuloRequestDTO;
import com.insteip.backend.domain.dto.modulo.ModuloResponseDTO;
import com.insteip.backend.domain.dto.video.VideoResponseDTO;
import com.insteip.backend.service.interfaces.ModuloService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/modulos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
@RequiredArgsConstructor
public class ModuloController {

    private final ModuloService moduloService;

    private final com.insteip.backend.service.interfaces.VideoService videoService;

    private final com.insteip.backend.service.interfaces.MaterialService materialService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#id)")
    public ResponseEntity<ModuloResponseDTO> obtenerModulo(@PathVariable Long id) {
        return ResponseEntity.ok(moduloService.obtenerModulo(id));
    }

    @GetMapping("/{id}/videos")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#id)")
    public ResponseEntity<Page<VideoResponseDTO>> listarVideosPorModulo(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "fechaCreacion,desc") String sort) {
        return ResponseEntity.ok(videoService.listarVideosPorModulo(id, search, buildPageable(page, size, sort)));
    }

    @GetMapping("/{id}/materiales")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#id)")
    public ResponseEntity<Page<MaterialResponseDTO>> listarMaterialesPorModulo(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "fechaSubida,desc") String sort) {
        return ResponseEntity.ok(materialService.listarMaterialesPorModulo(id, search, buildPageable(page, size, sort)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessCurso(#dto.cursoId)")
    public ResponseEntity<ModuloResponseDTO> crearModulo(@Valid @RequestBody ModuloRequestDTO dto) {
        return new ResponseEntity<>(moduloService.crearModulo(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#id)")
    public ResponseEntity<ModuloResponseDTO> editarModulo(@PathVariable Long id, @Valid @RequestBody ModuloRequestDTO dto) {
        return ResponseEntity.ok(moduloService.editarModulo(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#id)")
    public ResponseEntity<Void> eliminarModulo(@PathVariable Long id) {
        moduloService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#id)")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean estado,
            @RequestBody(required = false) Map<String, Boolean> body) {
            
        Boolean nuevoEstado = estado;
        if (nuevoEstado == null && body != null) {
            nuevoEstado = body.get("estado");
        }
        if (nuevoEstado == null) {
            nuevoEstado = true;
        }
        moduloService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    private Pageable buildPageable(int page, int size, String sortParam) {
        String[] parts = sortParam != null ? sortParam.split(",") : new String[0];
        String property = parts.length > 0 && !parts[0].isBlank() ? parts[0] : "fechaCreacion";
        String direction = parts.length > 1 ? parts[1] : "desc";
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(sortDirection, property));
    }
}
