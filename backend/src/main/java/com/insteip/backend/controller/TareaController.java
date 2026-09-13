package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.tarea.AlumnoTareaItemDTO;
import com.insteip.backend.domain.dto.tarea.TareaRequestDTO;
import com.insteip.backend.domain.dto.tarea.TareaResponseDTO;
import com.insteip.backend.service.interfaces.TareaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService tareaService;

    @GetMapping("/modulo/{moduloId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<List<TareaResponseDTO>> listarPorModulo(@PathVariable Long moduloId) {
        return ResponseEntity.ok(tareaService.listarPorModulo(moduloId));
    }

    @GetMapping("/curso/{cursoId}/alumno")
    @PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
    public ResponseEntity<List<AlumnoTareaItemDTO>> listarTareasPorCursoParaAlumno(
            @PathVariable Long cursoId,
            Authentication authentication) {
        String correo = authentication.getName();
        return ResponseEntity.ok(tareaService.listarTareasPorCursoParaAlumno(cursoId, correo));
    }

    @GetMapping("/alumno/todas")
    @PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
    public ResponseEntity<List<AlumnoTareaItemDTO>> listarTodasLasTareasParaAlumno(Authentication authentication) {
        String correo = authentication.getName();
        return ResponseEntity.ok(tareaService.listarTodasLasTareasParaAlumno(correo));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<TareaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tareaService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<TareaResponseDTO> crear(@Valid @RequestBody TareaRequestDTO request) {
        return new ResponseEntity<>(tareaService.crear(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<TareaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TareaRequestDTO request) {
        return ResponseEntity.ok(tareaService.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean estado) {
        tareaService.cambiarEstado(id, estado);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tareaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
