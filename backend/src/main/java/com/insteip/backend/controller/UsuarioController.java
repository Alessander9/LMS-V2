package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.docente.DocenteRequestDTO;
import com.insteip.backend.domain.dto.usuario.UsuarioRequestDTO;
import com.insteip.backend.domain.dto.usuario.UsuarioResponseDTO;
import com.insteip.backend.service.interfaces.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<UsuarioResponseDTO>> listarAlumnos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "true") boolean includeInactive) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(usuarioService.listarAlumnos(pageable, search, includeInactive));
    }

    @GetMapping("/docentes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<org.springframework.data.domain.Page<UsuarioResponseDTO>> listarDocentes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "fechaRegistro,desc") String sort) {
        org.springframework.data.domain.Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(usuarioService.listarDocentes(pageable, search));
    }

    @GetMapping("/docentes/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> obtenerDocente(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerDocente(id));
    }

    @PostMapping("/docentes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> crearDocente(@Valid @RequestBody DocenteRequestDTO dto) {
        return new ResponseEntity<>(usuarioService.crearDocente(dto), HttpStatus.CREATED);
    }

    @PutMapping("/docentes/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> editarDocente(@PathVariable Long id, @Valid @RequestBody DocenteRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.editarDocente(id, dto));
    }

    @DeleteMapping("/docentes/{id}")
    public ResponseEntity<Void> eliminarDocente(@PathVariable Long id) {
        usuarioService.eliminarDocente(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/docentes/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> cambiarEstadoDocente(
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
        usuarioService.cambiarEstadoDocente(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerAlumno(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerAlumno(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crearAlumno(@Valid @RequestBody UsuarioRequestDTO dto) {
        return new ResponseEntity<>(usuarioService.crearAlumno(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> editarAlumno(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.editarAlumno(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAlumno(@PathVariable Long id) {
        usuarioService.eliminarAlumno(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean estado,
            @RequestBody(required = false) Map<String, Boolean> body) {
            
        Boolean nuevoEstado = estado;
        if (nuevoEstado == null && body != null) {
            nuevoEstado = body.get("estado");
        }
        if (nuevoEstado == null) {
            // Default to true if not specified
            nuevoEstado = true;
        }
        usuarioService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    private org.springframework.data.domain.Pageable buildPageable(int page, int size, String sortParam) {
        String[] parts = sortParam != null ? sortParam.split(",") : new String[0];
        String property = parts.length > 0 && !parts[0].isBlank() ? parts[0] : "fechaRegistro";
        String direction = parts.length > 1 ? parts[1] : "desc";
        org.springframework.data.domain.Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction)
                ? org.springframework.data.domain.Sort.Direction.ASC
                : org.springframework.data.domain.Sort.Direction.DESC;
        return org.springframework.data.domain.PageRequest.of(Math.max(page, 0), Math.max(size, 1),
                org.springframework.data.domain.Sort.by(sortDirection, property));
    }
}
