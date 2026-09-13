package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.matricula.MatriculaRequestDTO;
import com.insteip.backend.domain.dto.matricula.MatriculaResponseDTO;
import com.insteip.backend.domain.dto.matricula.ModuloAccesoDTO;
import java.util.List;

public interface MatriculaService {
    MatriculaResponseDTO matricularAlumno(MatriculaRequestDTO dto);
    List<MatriculaResponseDTO> listarMatriculadosPorCurso(Long cursoId);
    List<MatriculaResponseDTO> listarMatriculadosPorUsuario(Long usuarioId);
    void cambiarEstado(Long matriculaId, Boolean estado);
    void eliminar(Long id);

    List<ModuloAccesoDTO> listarModulosAcceso(Long matriculaId);
    void actualizarModuloAcceso(Long matriculaId, Long moduloId, Boolean habilitado);
    void actualizarModulosAccesoMasivo(Long matriculaId, List<Long> modulosHabilitadosIds);
}
