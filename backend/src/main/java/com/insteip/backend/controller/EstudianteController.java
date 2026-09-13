package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.academico.EstudianteDtos.*;
import com.insteip.backend.service.interfaces.EstudianteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
@RequiredArgsConstructor
public class EstudianteController {

    private final EstudianteService estudianteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<EstudianteResponse> registrarEstudiante(@RequestBody RegistroEstudianteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(estudianteService.registrarEstudiante(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<EstudianteResponse>> listarEstudiantes(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(estudianteService.listarEstudiantes(search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<EstudianteResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(estudianteService.obtenerPorId(id));
    }

    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<EstudianteResponse> obtenerPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(estudianteService.obtenerPorDni(dni));
    }

    @GetMapping("/codigo/{codigo}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<EstudianteResponse> obtenerPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(estudianteService.obtenerPorCodigo(codigo));
    }

    @GetMapping("/{id}/carnet-qr")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<CarnetEstudianteQrResponse> obtenerCarnetQr(@PathVariable Long id) {
        return ResponseEntity.ok(estudianteService.obtenerCarnetQr(id));
    }

    @GetMapping("/seccion/{seccionId}/periodo/{periodoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<EstudianteResponse>> listarPorSeccion(
            @PathVariable Long seccionId,
            @PathVariable Long periodoId) {
        return ResponseEntity.ok(estudianteService.listarPorSeccion(seccionId, periodoId));
    }
}
