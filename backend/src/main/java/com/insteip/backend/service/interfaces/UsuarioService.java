package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.usuario.UsuarioRequestDTO;
import com.insteip.backend.domain.dto.usuario.UsuarioResponseDTO;
import com.insteip.backend.domain.dto.docente.DocenteRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioService {
    Page<UsuarioResponseDTO> listarAlumnos(Pageable pageable, String search, boolean includeInactive);
    Page<UsuarioResponseDTO> listarDocentes(Pageable pageable, String search);
    UsuarioResponseDTO obtenerDocente(Long id);
    UsuarioResponseDTO crearDocente(DocenteRequestDTO dto);
    UsuarioResponseDTO editarDocente(Long id, DocenteRequestDTO dto);
    void cambiarEstadoDocente(Long id, Boolean estado);
    UsuarioResponseDTO obtenerAlumno(Long id);
    UsuarioResponseDTO crearAlumno(UsuarioRequestDTO dto);
    UsuarioResponseDTO editarAlumno(Long id, UsuarioRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
    void eliminarAlumno(Long id);
    void eliminarDocente(Long id);
}
