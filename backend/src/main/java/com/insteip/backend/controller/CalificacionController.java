package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.academico.CalificacionDtos.*;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.CalificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;
    private final UsuarioRepository usuarioRepository;

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return 1L;
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(Usuario::getId)
                .orElse(1L);
    }

    @PostMapping("/config")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<EvaluacionConfigResponse> crearEvaluacionConfig(@RequestBody EvaluacionConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calificacionService.crearEvaluacionConfig(request));
    }

    @GetMapping("/config/curso/{cursoId}/periodo/{periodoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<EvaluacionConfigResponse>> listarEvaluaciones(
            @PathVariable Long cursoId,
            @PathVariable Long periodoId) {
        return ResponseEntity.ok(calificacionService.listarEvaluacionesPorCursoYPeriodo(cursoId, periodoId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<CalificacionItemResponse> registrarCalificacion(
            @RequestBody RegistroCalificacionRequest request,
            Authentication authentication) {
        Long docenteId = getUsuarioId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(calificacionService.registrarCalificacion(request, docenteId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<CalificacionItemResponse> modificarCalificacion(
            @PathVariable Long id,
            @RequestBody ModificarCalificacionRequest request,
            Authentication authentication) {
        Long usuarioId = getUsuarioId(authentication);
        return ResponseEntity.ok(calificacionService.modificarCalificacion(id, request, usuarioId));
    }

    @GetMapping("/{id}/historial")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<HistorialCambioResponse>> obtenerHistorialModificaciones(@PathVariable Long id) {
        return ResponseEntity.ok(calificacionService.obtenerHistorialModificaciones(id));
    }

    @GetMapping("/boleta/{matriculaAcademicaId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<BoletaNotasEstudianteResponse> generarBoletaNotas(@PathVariable Long matriculaAcademicaId) {
        return ResponseEntity.ok(calificacionService.generarBoletaNotas(matriculaAcademicaId));
    }
}
