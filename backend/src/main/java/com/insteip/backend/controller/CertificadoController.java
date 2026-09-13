package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.certificado.CertificadoResponseDTO;
import com.insteip.backend.domain.dto.certificado.CertificadoValidacionResponse;
import com.insteip.backend.domain.entity.Certificado;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.CertificadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/certificados")
@RequiredArgsConstructor
public class CertificadoController {

    private final CertificadoService certificadoService;

    private final UsuarioRepository usuarioRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Value("${application.storage.path}")
    private String storagePathSetting;

    @Value("${application.api.base-url}")
    private String apiBaseUrl;

    @Value("${application.frontend.base-url}")
    private String frontendBaseUrl;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<Page<CertificadoResponseDTO>> listarCertificados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "fechaEmision,desc") String sort) {
        return ResponseEntity.ok(certificadoService.listarCertificados(buildPageable(page, size, sort), search));
    }

    private Pageable buildPageable(int page, int size, String sortParam) {
        String[] parts = sortParam.split(",");
        String property = parts.length > 0 && !parts[0].isBlank() ? parts[0] : "fechaEmision";
        String direction = parts.length > 1 ? parts[1] : "desc";
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(sortDirection, property));
    }

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return 2L; // Estudiante seed de prueba por defecto
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(usuario -> usuario.getId())
                .orElse(2L);
    }

    @PostMapping("/generar/{cursoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<CertificadoResponseDTO> generarCertificado(
            Authentication authentication,
            @PathVariable Long cursoId) {
        if (authentication != null) {
            String correoAuth = authentication.getName();
            if (correoAuth != null && (correoAuth.equalsIgnoreCase("ExperianciaInsteip@insteip.com") || correoAuth.equalsIgnoreCase("ExperienciaInsteip@insteip.com"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        Long usuarioId = getUsuarioId(authentication);
        Certificado cert = certificadoService.generarCertificado(usuarioId, cursoId);
        CertificadoResponseDTO response = new CertificadoResponseDTO(
                cert.getId(),
                cert.getUsuario().getId(),
                cert.getCurso().getId(),
                cert.getUsuario().getNombres() + " " + cert.getUsuario().getApellidos(),
                cert.getUsuario().getCorreo(),
                cert.getCurso().getNombre(),
                cert.getCodigo(),
                (cert.getArchivoPdf() == null || cert.getArchivoPdf().isBlank())
                        ? apiBaseUrl + "/api/certificados/" + cert.getId() + "/download"
                        : cert.getArchivoPdf(),
                (cert.getUrlValidacion() == null || cert.getUrlValidacion().isBlank())
                        ? frontendBaseUrl + "/certificados/validar/" + cert.getCodigo()
                        : cert.getUrlValidacion(),
                cert.getNumeroRegistro(),
                cert.getFechaEmision()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarCertificado(@PathVariable Long id, Authentication authentication) {
        if (authentication != null) {
            String correoAuth = authentication.getName();
            if (correoAuth != null && (correoAuth.equalsIgnoreCase("ExperianciaInsteip@insteip.com") || correoAuth.equalsIgnoreCase("ExperienciaInsteip@insteip.com"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        Certificado cert = certificadoService.obtenerCertificado(id);

        Path basePath = Paths.get(storagePathSetting).toAbsolutePath().normalize().resolve("certificados");
        Path filePath = basePath.resolve(cert.getCodigo() + ".pdf").normalize();
        if (!filePath.startsWith(basePath) || !Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            byte[] pdfBytes = Files.readAllBytes(filePath);
            auditoriaService.registrarEvento("CERTIFICADOS", "DESCARGAR", "Descargado certificado ID: " + cert.getId() + " para el curso ID: " + cert.getCurso().getId());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificado-" + cert.getCodigo() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/validar/{codigo}")
    public ResponseEntity<CertificadoValidacionResponse> validarCertificado(@PathVariable String codigo) {
        Certificado cert = certificadoService.validarCertificado(codigo);
        CertificadoValidacionResponse response = new CertificadoValidacionResponse(
                true,
                cert.getUsuario().getNombres() + " " + cert.getUsuario().getApellidos(),
                cert.getCurso().getNombre(),
                cert.getFechaEmision().toLocalDate(),
                cert.getCodigo()
        );
        return ResponseEntity.ok(response);
    }
}
