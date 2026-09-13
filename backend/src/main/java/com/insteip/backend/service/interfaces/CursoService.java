package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.curso.CursoRequestDTO;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CursoService {
    Page<CursoResponseDTO> listarCursos(Pageable pageable, String search);
    CursoResponseDTO obtenerDetalle(Long id);
    CursoResponseDTO crearCurso(CursoRequestDTO dto);
    CursoResponseDTO editarCurso(Long id, CursoRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
    void eliminar(Long id);
}
