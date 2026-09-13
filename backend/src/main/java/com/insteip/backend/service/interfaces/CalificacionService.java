package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.academico.CalificacionDtos.*;
import java.util.List;

public interface CalificacionService {
    EvaluacionConfigResponse crearEvaluacionConfig(EvaluacionConfigRequest request);
    List<EvaluacionConfigResponse> listarEvaluacionesPorCursoYPeriodo(Long cursoId, Long periodoId);
    
    CalificacionItemResponse registrarCalificacion(RegistroCalificacionRequest request, Long docenteId);
    CalificacionItemResponse modificarCalificacion(Long calificacionId, ModificarCalificacionRequest request, Long usuarioId);
    
    List<HistorialCambioResponse> obtenerHistorialModificaciones(Long calificacionId);
    BoletaNotasEstudianteResponse generarBoletaNotas(Long matriculaAcademicaId);
}
