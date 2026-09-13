package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.tarea.CalificarEntregaDTO;
import com.insteip.backend.domain.dto.tarea.EntregaTareaResponseDTO;
import com.insteip.backend.domain.entity.EntregaTarea;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EntregaTareaService {

    EntregaTareaResponseDTO entregarTarea(Long tareaId, String correoAlumno, String comentario, MultipartFile archivo);

    EntregaTareaResponseDTO obtenerMiEntrega(Long tareaId, String correoAlumno);

    List<EntregaTareaResponseDTO> listarEntregasPorTarea(Long tareaId);

    EntregaTareaResponseDTO calificarEntrega(Long entregaId, CalificarEntregaDTO dto);

    byte[] descargarArchivoEntregaBytes(Long entregaId, String correoSolicitante);

    EntregaTarea obtenerEntregaEntity(Long entregaId);
}
