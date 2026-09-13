package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.docente.DocenteEstudianteProgressResponse;
import com.insteip.backend.service.interfaces.DocenteDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/docente")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
@RequiredArgsConstructor
public class DocenteDashboardController {

    private final DocenteDashboardService docenteDashboardService;

    private String getCorreo(Authentication authentication) {
        if (authentication == null) {
            return "profesor@insteip.com"; // Fallback para desarrollo/pruebas
        }
        return authentication.getName();
    }

    @GetMapping("/cursos")
    public ResponseEntity<List<CursoResponseDTO>> getCursosAsignados(Authentication authentication) {
        String correo = getCorreo(authentication);
        return ResponseEntity.ok(docenteDashboardService.getCursosAsignados(correo));
    }

    @GetMapping("/cursos/{id}/alumnos")
    public ResponseEntity<List<DocenteEstudianteProgressResponse>> getAlumnosCurso(
            Authentication authentication,
            @PathVariable Long id) {
        String correo = getCorreo(authentication);
        return ResponseEntity.ok(docenteDashboardService.getAlumnosCurso(correo, id));
    }
}
