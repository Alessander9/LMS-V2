package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.modulo.ModuloRequestDTO;
import com.insteip.backend.domain.dto.modulo.ModuloResponseDTO;
import java.util.List;

public interface ModuloService {
    List<ModuloResponseDTO> listarModulosPorCurso(Long cursoId);
    ModuloResponseDTO obtenerModulo(Long id);
    ModuloResponseDTO crearModulo(ModuloRequestDTO dto);
    ModuloResponseDTO editarModulo(Long id, ModuloRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
    void eliminar(Long id);
}
