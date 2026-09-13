package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.tarea.CalificarEntregaDTO;
import com.insteip.backend.domain.dto.tarea.EntregaTareaResponseDTO;
import com.insteip.backend.domain.entity.EntregaTarea;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.service.interfaces.EntregaTareaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/entregas-tareas")
@RequiredArgsConstructor
public class EntregaTareaController {

    private final EntregaTareaService entregaTareaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
    public ResponseEntity<EntregaTareaResponseDTO> entregarTarea(
            @RequestParam Long tareaId,
            @RequestParam(required = false) String comentario,
            @RequestPart MultipartFile archivo,
            Authentication authentication) {
        String correo = authentication.getName();
        return new ResponseEntity<>(
                entregaTareaService.entregarTarea(tareaId, correo, comentario, archivo),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/tarea/{tareaId}/mi-entrega")
    @PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
    public ResponseEntity<EntregaTareaResponseDTO> obtenerMiEntrega(
            @PathVariable Long tareaId,
            Authentication authentication) {
        String correo = authentication.getName();
        return ResponseEntity.ok(entregaTareaService.obtenerMiEntrega(tareaId, correo));
    }

    @GetMapping("/tarea/{tareaId}/todas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<EntregaTareaResponseDTO>> listarEntregasPorTarea(@PathVariable Long tareaId) {
        return ResponseEntity.ok(entregaTareaService.listarEntregasPorTarea(tareaId));
    }

    @PutMapping("/{id}/calificar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<EntregaTareaResponseDTO> calificarEntrega(
            @PathVariable Long id,
            @Valid @RequestBody CalificarEntregaDTO dto) {
        return ResponseEntity.ok(entregaTareaService.calificarEntrega(id, dto));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarArchivo(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String correo = authentication.getName();
            EntregaTarea entrega = entregaTareaService.obtenerEntregaEntity(id);
            byte[] data = entregaTareaService.descargarArchivoEntregaBytes(id, correo);

            String alumnoName = entrega.getUsuario() != null
                    ? (entrega.getUsuario().getNombres() + "_" + entrega.getUsuario().getApellidos()).replaceAll("\\s+", "_")
                    : "Alumno";
            String tareaTitulo = entrega.getTarea() != null
                    ? entrega.getTarea().getTitulo().replaceAll("\\s+", "_")
                    : "Tarea";

            String filename = "Tarea_" + tareaTitulo + "_" + alumnoName;
            String extension = "";
            String cleanType = entrega.getTipoArchivo() != null ? entrega.getTipoArchivo() : "application/octet-stream";

            if ("application/pdf".equalsIgnoreCase(cleanType)) extension = ".pdf";
            else if ("application/msword".equalsIgnoreCase(cleanType)) extension = ".doc";
            else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(cleanType)) extension = ".docx";
            else if ("image/jpeg".equalsIgnoreCase(cleanType)) extension = ".jpg";
            else if ("image/png".equalsIgnoreCase(cleanType)) extension = ".png";
            else if ("application/zip".equalsIgnoreCase(cleanType)) extension = ".zip";
            else if ("application/vnd.rar".equalsIgnoreCase(cleanType)) extension = ".rar";

            if (!filename.toLowerCase().endsWith(extension)) {
                filename += extension;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(cleanType))
                    .body(data);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (ForbiddenException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
