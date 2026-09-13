package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.academico.AsistenciaDtos.*;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AsistenciaQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
@RequiredArgsConstructor
public class AsistenciaController {

    private final AsistenciaQrService asistenciaQrService;
    private final UsuarioRepository usuarioRepository;

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return 1L;
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(Usuario::getId)
                .orElse(1L);
    }

    @PostMapping("/sesiones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<SesionClaseResponse> crearSesionClase(
            @RequestBody CrearSesionClaseRequest request,
            Authentication authentication) {
        Long docenteId = getUsuarioId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(asistenciaQrService.crearSesionClase(request, docenteId));
    }

    @GetMapping("/sesiones/{sesionId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<SesionClaseResponse> obtenerSesionPorId(@PathVariable Long sesionId) {
        return ResponseEntity.ok(asistenciaQrService.obtenerSesionPorId(sesionId));
    }

    @GetMapping("/sesiones/curso/{cursoId}/seccion/{seccionId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<SesionClaseResponse>> listarSesiones(
            @PathVariable Long cursoId,
            @PathVariable Long seccionId) {
        return ResponseEntity.ok(asistenciaQrService.listarSesionesPorCursoYSeccion(cursoId, seccionId));
    }

    @PostMapping("/qr/marcar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<MarcacionResponse> marcarAsistenciaPorQr(@RequestBody MarcacionQrRequest request) {
        return ResponseEntity.ok(asistenciaQrService.marcarAsistenciaPorQr(request));
    }

    @GetMapping("/sesiones/{sesionId}/listado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<AsistenciaItemResponse>> listarAsistenciaPorSesion(@PathVariable Long sesionId) {
        return ResponseEntity.ok(asistenciaQrService.listarAsistenciaPorSesion(sesionId));
    }

    @GetMapping("/estudiante/{estudianteId}/resumen")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<ResumenAsistenciaEstudiante> obtenerResumenEstudiante(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(asistenciaQrService.obtenerResumenEstudiante(estudianteId));
    }
}
