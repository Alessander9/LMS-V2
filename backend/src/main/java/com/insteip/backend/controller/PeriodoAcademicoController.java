package com.insteip.backend.controller;

import com.insteip.backend.domain.entity.PeriodoAcademico;
import com.insteip.backend.repository.PeriodoAcademicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/periodos-academicos")
@RequiredArgsConstructor
public class PeriodoAcademicoController {

    private final PeriodoAcademicoRepository periodoAcademicoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<List<PeriodoAcademico>> listarPeriodos(@RequestParam(required = false) String tipoInstitucion) {
        if (tipoInstitucion != null && !tipoInstitucion.trim().isEmpty()) {
            return ResponseEntity.ok(periodoAcademicoRepository.findByTipoInstitucion(tipoInstitucion.trim()));
        }
        return ResponseEntity.ok(periodoAcademicoRepository.findByActivoTrueOrderByFechaInicioDesc());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PeriodoAcademico> crearPeriodo(@RequestBody PeriodoAcademico periodo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(periodoAcademicoRepository.save(periodo));
    }
}
