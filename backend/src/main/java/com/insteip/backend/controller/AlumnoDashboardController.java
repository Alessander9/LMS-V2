package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.certificado.AlumnoCertificadoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoCursoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoDashboardMetrics;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayCourseResponse;
import com.insteip.backend.service.interfaces.AlumnoDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alumno")
@PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
@RequiredArgsConstructor
public class AlumnoDashboardController {

    private final AlumnoDashboardService alumnoDashboardService;

    private String getCorreo(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalStateException("La autenticación es obligatoria");
        }
        return authentication.getName();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AlumnoDashboardMetrics> getMetrics(Authentication authentication) {
        String correo = getCorreo(authentication);
        return ResponseEntity.ok(alumnoDashboardService.getMetrics(correo));
    }

    @GetMapping("/cursos")
    public ResponseEntity<List<AlumnoCursoResponse>> getEnrolledCursos(Authentication authentication) {
        String correo = getCorreo(authentication);
        return ResponseEntity.ok(alumnoDashboardService.getEnrolledCursos(correo));
    }

    @GetMapping("/certificados")
    public ResponseEntity<List<AlumnoCertificadoResponse>> getCertificados(Authentication authentication) {
        String correo = getCorreo(authentication);
        return ResponseEntity.ok(alumnoDashboardService.getCertificados(correo));
    }

    @GetMapping("/cursos/{id}/play")
    public ResponseEntity<AlumnoPlayCourseResponse> getPlayCourse(
            Authentication authentication,
            @PathVariable Long id) {
        String correo = getCorreo(authentication);
        return ResponseEntity.ok(alumnoDashboardService.getPlayCourse(correo, id));
    }
}
