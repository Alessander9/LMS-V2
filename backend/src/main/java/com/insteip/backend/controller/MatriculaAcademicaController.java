package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.academico.MatriculaAcademicaDtos.*;
import com.insteip.backend.service.interfaces.MatriculaAcademicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas-academicas")
@RequiredArgsConstructor
public class MatriculaAcademicaController {

    private final MatriculaAcademicaService matriculaAcademicaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<MatriculaResponse> matricularEstudiante(@RequestBody MatriculaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matriculaAcademicaService.matricularEstudiante(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<MatriculaResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(matriculaAcademicaService.obtenerPorId(id));
    }

    @GetMapping("/seccion/{seccionId}/periodo/{periodoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<MatriculaResponse>> listarPorSeccionYPeriodo(
            @PathVariable Long seccionId,
            @PathVariable Long periodoId) {
        return ResponseEntity.ok(matriculaAcademicaService.listarPorSeccionYPeriodo(seccionId, periodoId));
    }

    @GetMapping("/estudiante/{estudianteId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<List<MatriculaResponse>> listarPorEstudiante(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(matriculaAcademicaService.listarPorEstudiante(estudianteId));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        matriculaAcademicaService.cambiarEstadoMatricula(id, estado);
        return ResponseEntity.noContent().build();
    }
}
