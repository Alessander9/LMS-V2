package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.academico.MatriculaAcademicaDtos.*;
import java.util.List;

public interface MatriculaAcademicaService {
    MatriculaResponse matricularEstudiante(MatriculaRequest request);
    MatriculaResponse obtenerPorId(Long id);
    List<MatriculaResponse> listarPorSeccionYPeriodo(Long seccionId, Long periodoId);
    List<MatriculaResponse> listarPorEstudiante(Long estudianteId);
    void cambiarEstadoMatricula(Long id, String nuevoEstado);
}
