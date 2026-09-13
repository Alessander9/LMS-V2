package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.docente.DocenteEstudianteProgressResponse;
import java.util.List;

public interface DocenteDashboardService {
    List<CursoResponseDTO> getCursosAsignados(String correo);
    List<DocenteEstudianteProgressResponse> getAlumnosCurso(String correo, Long cursoId);
}
