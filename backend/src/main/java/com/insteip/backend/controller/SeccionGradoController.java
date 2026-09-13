package com.insteip.backend.controller;

import com.insteip.backend.domain.entity.SeccionGrado;
import com.insteip.backend.repository.SeccionGradoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secciones-grados")
@RequiredArgsConstructor
public class SeccionGradoController {

    private final SeccionGradoRepository seccionGradoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<List<SeccionGrado>> listarSecciones(@RequestParam(required = false) String nivel) {
        if (nivel != null && !nivel.trim().isEmpty()) {
            return ResponseEntity.ok(seccionGradoRepository.findByNivelAndActivoTrue(nivel.toUpperCase().trim()));
        }
        return ResponseEntity.ok(seccionGradoRepository.findByActivoTrue());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<SeccionGrado> crearSeccion(@RequestBody SeccionGrado seccion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seccionGradoRepository.save(seccion));
    }
}
