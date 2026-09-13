package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.tarea.AlumnoTareaItemDTO;
import com.insteip.backend.domain.dto.tarea.TareaRequestDTO;
import com.insteip.backend.domain.dto.tarea.TareaResponseDTO;

import java.util.List;

public interface TareaService {

    List<TareaResponseDTO> listarPorModulo(Long moduloId);

    List<AlumnoTareaItemDTO> listarTareasPorCursoParaAlumno(Long cursoId, String correo);

    List<AlumnoTareaItemDTO> listarTodasLasTareasParaAlumno(String correo);

    TareaResponseDTO obtenerPorId(Long id);

    TareaResponseDTO crear(TareaRequestDTO request);

    TareaResponseDTO actualizar(Long id, TareaRequestDTO request);

    void cambiarEstado(Long id, Boolean estado);

    void eliminar(Long id);
}
