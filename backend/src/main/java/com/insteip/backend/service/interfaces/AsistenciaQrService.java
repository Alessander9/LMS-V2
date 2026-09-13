package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.academico.AsistenciaDtos.*;
import java.util.List;

public interface AsistenciaQrService {
    SesionClaseResponse crearSesionClase(CrearSesionClaseRequest request, Long docenteId);
    SesionClaseResponse obtenerSesionPorId(Long sesionId);
    List<SesionClaseResponse> listarSesionesPorCursoYSeccion(Long cursoId, Long seccionId);
    MarcacionResponse marcarAsistenciaPorQr(MarcacionQrRequest request);
    List<AsistenciaItemResponse> listarAsistenciaPorSesion(Long sesionId);
    ResumenAsistenciaEstudiante obtenerResumenEstudiante(Long estudianteId);
}
