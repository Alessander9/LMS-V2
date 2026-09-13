package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.video.VideoRequestDTO;
import com.insteip.backend.domain.dto.video.VideoResponseDTO;
import com.insteip.backend.service.interfaces.VideoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<org.springframework.data.domain.Page<VideoResponseDTO>> listarVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(videoService.listarVideos(pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#dto.moduloId)")
    public ResponseEntity<VideoResponseDTO> crearVideo(@Valid @RequestBody VideoRequestDTO dto) {
        return new ResponseEntity<>(videoService.crearVideo(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessVideo(#id)")
    public ResponseEntity<VideoResponseDTO> editarVideo(@PathVariable Long id, @Valid @RequestBody VideoRequestDTO dto) {
        return ResponseEntity.ok(videoService.editarVideo(id, dto));
    }

    @PostMapping("/{id}/duracion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<Void> actualizarDuracion(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer duracion = body.get("duracionSegundos");
        videoService.actualizarDuracion(id, duracion);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessVideo(#id)")
    public ResponseEntity<Void> eliminarVideo(@PathVariable Long id) {
        videoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessVideo(#id)")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean estado,
            @RequestBody(required = false) Map<String, Boolean> body) {
            
        Boolean nuevoEstado = estado;
        if (nuevoEstado == null && body != null) {
            nuevoEstado = body.get("estado");
        }
        if (nuevoEstado == null) {
            nuevoEstado = true;
        }
        videoService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }
}
