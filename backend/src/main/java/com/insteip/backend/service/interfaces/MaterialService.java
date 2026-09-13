package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.material.MaterialResponseDTO;
import com.insteip.backend.domain.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface MaterialService {
    Page<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId, String search, Pageable pageable);
    MaterialResponseDTO crearMaterial(Long moduloId, String nombre, MultipartFile archivo);
    MaterialResponseDTO editarMaterial(Long id, String nombre, MultipartFile archivo);
    void cambiarEstado(Long id, Boolean estado);
    Material obtenerMaterialEntity(Long id);
    byte[] descargarMaterialBytes(Long id);
    void eliminar(Long id);
}
