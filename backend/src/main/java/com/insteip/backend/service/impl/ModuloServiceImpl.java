package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.modulo.ModuloRequestDTO;
import com.insteip.backend.domain.dto.modulo.ModuloResponseDTO;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Modulo;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.service.interfaces.ModuloService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuloServiceImpl implements ModuloService {

    private final ModuloRepository moduloRepository;

    private final CursoRepository cursoRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Override
    public List<ModuloResponseDTO> listarModulosPorCurso(Long cursoId) {
        if (!cursoRepository.existsById(cursoId)) {
            throw new ResourceNotFoundException("Curso no encontrado con id: " + cursoId);
        }
        return moduloRepository.findByCursoIdOrderByOrdenAsc(cursoId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public ModuloResponseDTO obtenerModulo(Long id) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + id));
        return convertToResponseDto(modulo);
    }

    @Override
    public ModuloResponseDTO crearModulo(ModuloRequestDTO dto) {
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + dto.cursoId()));

        Modulo modulo = Modulo.builder()
                .curso(curso)
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .orden(dto.orden())
                .estado(true)
                .build();

        Modulo saved = moduloRepository.save(modulo);
        auditoriaService.registrarEvento("MODULO", "CREAR", "Creado módulo: " + saved.getNombre() + " (ID: " + saved.getId() + ") en curso: " + saved.getCurso().getNombre() + " (ID: " + saved.getCurso().getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public ModuloResponseDTO editarModulo(Long id, ModuloRequestDTO dto) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + id));

        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + dto.cursoId()));

        modulo.setCurso(curso);
        modulo.setNombre(dto.nombre());
        modulo.setDescripcion(dto.descripcion());
        modulo.setOrden(dto.orden());

        Modulo saved = moduloRepository.save(modulo);
        auditoriaService.registrarEvento("MODULO", "EDITAR", "Editado módulo: " + saved.getNombre() + " (ID: " + saved.getId() + ") en curso: " + saved.getCurso().getNombre() + " (ID: " + saved.getCurso().getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + id));
        modulo.setEstado(estado);
        Modulo saved = moduloRepository.save(modulo);
        auditoriaService.registrarEvento("MODULO", estado ? "ACTIVAR" : "DESACTIVAR", 
                (estado ? "Activado" : "Desactivado") + " módulo: " + saved.getNombre() + " (ID: " + saved.getId() + ")");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void eliminar(Long id) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + id));
        String nombreModulo = modulo.getNombre();
        moduloRepository.deleteById(id);
        auditoriaService.registrarEvento("MODULO", "ELIMINAR", "Eliminado módulo: " + nombreModulo + " (ID: " + id + ")");
    }

    private ModuloResponseDTO convertToResponseDto(Modulo m) {
        return new ModuloResponseDTO(
                m.getId(),
                m.getNombre(),
                m.getDescripcion(),
                m.getOrden(),
                m.getEstado(),
                m.getCurso().getId(),
                m.getCurso().getNombre()
        );
    }
}
