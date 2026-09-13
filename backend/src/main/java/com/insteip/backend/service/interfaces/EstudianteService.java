package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.academico.EstudianteDtos.*;
import java.util.List;

public interface EstudianteService {
    EstudianteResponse registrarEstudiante(RegistroEstudianteRequest request);
    EstudianteResponse obtenerPorId(Long id);
    EstudianteResponse obtenerPorDni(String dni);
    EstudianteResponse obtenerPorCodigo(String codigo);
    EstudianteResponse obtenerPorUsuarioId(Long usuarioId);
    CarnetEstudianteQrResponse obtenerCarnetQr(Long estudianteId);
    List<EstudianteResponse> listarEstudiantes(String query);
    List<EstudianteResponse> listarPorSeccion(Long seccionId, Long periodoId);
}
