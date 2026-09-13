package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.curso.CursoRequestDTO;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.NivelSuscripcion;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.NivelSuscripcionRepository;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.CursoService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepository;

    private final NivelSuscripcionRepository suscripcionRepository;

    private final UsuarioRepository usuarioRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    private final com.insteip.backend.repository.CertificadoRepository certificadoRepository;

    @Override
    public org.springframework.data.domain.Page<CursoResponseDTO> listarCursos(org.springframework.data.domain.Pageable pageable, String search) {
        org.springframework.data.domain.Page<Curso> cursosPage;
        if (search != null && !search.trim().isEmpty()) {
            cursosPage = cursoRepository.findPagedAndSearched(search, pageable);
        } else {
            cursosPage = cursoRepository.findAll(pageable);
        }
        return cursosPage.map(this::convertToResponseDto);
    }

    @Override
    public CursoResponseDTO obtenerDetalle(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + id));
        return convertToResponseDto(curso);
    }

    @Override
    public CursoResponseDTO crearCurso(CursoRequestDTO dto) {
        List<NivelSuscripcion> subs = dto.nivelesSuscripcionIds().stream()
                .map(subId -> suscripcionRepository.findById(subId)
                        .orElseThrow(() -> new ResourceNotFoundException("Nivel de suscripción no encontrado con id: " + subId)))
                .collect(Collectors.toList());

        Usuario docente = null;
        if (dto.docenteId() != null) {
            docente = usuarioRepository.findById(dto.docenteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con id: " + dto.docenteId()));
            if (docente.getRol() == null || !"DOCENTE".equalsIgnoreCase(docente.getRol().getNombre())) {
                throw new ResourceNotFoundException("El usuario seleccionado no tiene rol DOCENTE");
            }
        }

        Curso curso = Curso.builder()
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .imagenPortada(dto.imagenPortada())
                .nivelesSuscripcion(subs)
                .docente(docente)
                .estado(true)
                .build();

        Curso saved = cursoRepository.save(curso);
        auditoriaService.registrarEvento("CURSO", "CREAR", "Creado curso: " + saved.getNombre() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public CursoResponseDTO editarCurso(Long id, CursoRequestDTO dto) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + id));

        List<NivelSuscripcion> subs = dto.nivelesSuscripcionIds().stream()
                .map(subId -> suscripcionRepository.findById(subId)
                        .orElseThrow(() -> new ResourceNotFoundException("Nivel de suscripción no encontrado con id: " + subId)))
                .collect(Collectors.toList());

        Usuario docente = null;
        if (dto.docenteId() != null) {
            docente = usuarioRepository.findById(dto.docenteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con id: " + dto.docenteId()));
            if (docente.getRol() == null || !"DOCENTE".equalsIgnoreCase(docente.getRol().getNombre())) {
                throw new ResourceNotFoundException("El usuario seleccionado no tiene rol DOCENTE");
            }
        }

        curso.setNombre(dto.nombre());
        curso.setDescripcion(dto.descripcion());
        curso.setImagenPortada(dto.imagenPortada());
        curso.setNivelesSuscripcion(subs);
        curso.setDocente(docente);

        Curso saved = cursoRepository.save(curso);
        auditoriaService.registrarEvento("CURSO", "EDITAR", "Editado curso: " + saved.getNombre() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + id));
        curso.setEstado(estado);
        Curso saved = cursoRepository.save(curso);
        auditoriaService.registrarEvento("CURSO", estado ? "ACTIVAR" : "DESACTIVAR", 
                (estado ? "Activado" : "Desactivado") + " curso: " + saved.getNombre() + " (ID: " + saved.getId() + ")");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void eliminar(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + id));
        String nombreCurso = curso.getNombre();
        
        // Eliminar certificados asociados primero (tienen ON DELETE RESTRICT en BD)
        certificadoRepository.eliminarPorCursoId(id);
        
        cursoRepository.deleteById(id);
        auditoriaService.registrarEvento("CURSO", "ELIMINAR", "Eliminado curso: " + nombreCurso + " (ID: " + id + ")");
    }

    private CursoResponseDTO convertToResponseDto(Curso c) {
        Long docenteId = c.getDocente() != null ? c.getDocente().getId() : null;
        String docenteNombre = c.getDocente() != null ? (c.getDocente().getNombres() + " " + c.getDocente().getApellidos()) : null;
        return new CursoResponseDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getImagenPortada(),
                c.getNivelesSuscripcion().stream().map(nivel -> nivel.getNombre()).collect(Collectors.toList()),
                c.getEstado(),
                docenteId,
                docenteNombre,
                c.getFechaCreacion()
        );
    }
}
