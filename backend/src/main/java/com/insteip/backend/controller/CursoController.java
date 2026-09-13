package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.curso.CursoRequestDTO;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.modulo.ModuloResponseDTO;
import com.insteip.backend.service.interfaces.CursoService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cursos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    private final com.insteip.backend.service.interfaces.ModuloService moduloService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<org.springframework.data.domain.Page<CursoResponseDTO>> listarCursos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(cursoService.listarCursos(pageable, search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessCurso(#id)")
    public ResponseEntity<CursoResponseDTO> obtenerDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.obtenerDetalle(id));
    }

    @GetMapping("/{id}/modulos")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessCurso(#id)")
    public ResponseEntity<List<ModuloResponseDTO>> listarModulosPorCurso(@PathVariable Long id) {
        return ResponseEntity.ok(moduloService.listarModulosPorCurso(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CursoResponseDTO> crearCurso(@Valid @RequestBody CursoRequestDTO dto) {
        return new ResponseEntity<>(cursoService.crearCurso(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CursoResponseDTO> editarCurso(@PathVariable Long id, @Valid @RequestBody CursoRequestDTO dto) {
        return ResponseEntity.ok(cursoService.editarCurso(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarCurso(@PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
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
        cursoService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }
}
