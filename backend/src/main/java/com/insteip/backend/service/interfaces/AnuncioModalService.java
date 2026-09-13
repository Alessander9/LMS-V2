package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.anuncio.AnuncioModalRequestDTO;
import com.insteip.backend.domain.dto.anuncio.AnuncioModalResponseDTO;

import java.util.List;

public interface AnuncioModalService {

    AnuncioModalResponseDTO obtenerAnuncioActivoParaUsuario(String correoUsuario);

    List<AnuncioModalResponseDTO> listarTodosParaAdmin();

    AnuncioModalResponseDTO crear(AnuncioModalRequestDTO request, String correoAdmin);

    AnuncioModalResponseDTO actualizar(Long id, AnuncioModalRequestDTO request, String correoAdmin);

    void cambiarEstado(Long id, Boolean estado, String correoAdmin);

    void eliminar(Long id, String correoAdmin);
}
