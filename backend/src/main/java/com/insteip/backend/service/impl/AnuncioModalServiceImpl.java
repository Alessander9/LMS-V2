package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.anuncio.AnuncioModalRequestDTO;
import com.insteip.backend.domain.dto.anuncio.AnuncioModalResponseDTO;
import com.insteip.backend.domain.entity.AnuncioModal;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.AnuncioModalRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AnuncioModalService;
import com.insteip.backend.service.interfaces.AuditoriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnuncioModalServiceImpl implements AnuncioModalService {

    private final AnuncioModalRepository anuncioModalRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    @Override
    @Transactional(readOnly = true)
    public AnuncioModalResponseDTO obtenerAnuncioActivoParaUsuario(String correoUsuario) {
        String audiencia = "SOLO_ESTUDIANTES";

        if (correoUsuario != null && !correoUsuario.isBlank()) {
            Usuario u = usuarioRepository.findByCorreo(correoUsuario).orElse(null);
            if (u != null && u.getRol() != null) {
                String rol = u.getRol().getNombre();
                if ("DOCENTE".equalsIgnoreCase(rol)) {
                    audiencia = "SOLO_DOCENTES";
                } else if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
                    audiencia = "TODOS";
                } else {
                    audiencia = "SOLO_ESTUDIANTES";
                }
            }
        }

        LocalDateTime now = LocalDateTime.now();
        List<AnuncioModal> activos = anuncioModalRepository.findAnunciosActivosPorAudiencia(now, audiencia);

        if (activos.isEmpty()) {
            return null;
        }

        // Retorna el anuncio activo más reciente
        return convertToDto(activos.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnuncioModalResponseDTO> listarTodosParaAdmin() {
        return anuncioModalRepository.findAllByOrderByFechaCreacionDesc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AnuncioModalResponseDTO crear(AnuncioModalRequestDTO request, String correoAdmin) {
        AnuncioModal anuncio = AnuncioModal.builder()
                .titulo(request.getTitulo().trim())
                .mensaje(request.getMensaje())
                .imagenUrl(request.getImagenUrl())
                .botonTexto(request.getBotonTexto() != null && !request.getBotonTexto().isBlank() ? request.getBotonTexto().trim() : "Ver Más")
                .botonUrl(request.getBotonUrl())
                .audiencia(request.getAudiencia() != null ? request.getAudiencia().trim() : "TODOS")
                .activo(request.getActivo() != null ? request.getActivo() : true)
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .creadoPor(correoAdmin)
                .build();

        AnuncioModal guardado = anuncioModalRepository.save(anuncio);
        auditoriaService.registrarEvento("ANUNCIO_MODAL", "CREAR", "Creado anuncio modal: " + guardado.getTitulo());
        return convertToDto(guardado);
    }

    @Override
    @Transactional
    public AnuncioModalResponseDTO actualizar(Long id, AnuncioModalRequestDTO request, String correoAdmin) {
        AnuncioModal anuncio = anuncioModalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anuncio modal no encontrado con ID: " + id));

        anuncio.setTitulo(request.getTitulo().trim());
        anuncio.setMensaje(request.getMensaje());
        anuncio.setImagenUrl(request.getImagenUrl());
        if (request.getBotonTexto() != null) {
            anuncio.setBotonTexto(request.getBotonTexto().trim());
        }
        anuncio.setBotonUrl(request.getBotonUrl());
        if (request.getAudiencia() != null) {
            anuncio.setAudiencia(request.getAudiencia().trim());
        }
        if (request.getActivo() != null) {
            anuncio.setActivo(request.getActivo());
        }
        anuncio.setFechaInicio(request.getFechaInicio());
        anuncio.setFechaFin(request.getFechaFin());

        AnuncioModal actualizado = anuncioModalRepository.save(anuncio);
        auditoriaService.registrarEvento("ANUNCIO_MODAL", "ACTUALIZAR", "Actualizado anuncio modal ID: " + id);
        return convertToDto(actualizado);
    }

    @Override
    @Transactional
    public void cambiarEstado(Long id, Boolean estado, String correoAdmin) {
        AnuncioModal anuncio = anuncioModalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anuncio modal no encontrado con ID: " + id));

        anuncio.setActivo(estado);
        anuncioModalRepository.save(anuncio);
        auditoriaService.registrarEvento("ANUNCIO_MODAL", "CAMBIAR_ESTADO", "Estado de anuncio ID " + id + " cambiado a " + estado);
    }

    @Override
    @Transactional
    public void eliminar(Long id, String correoAdmin) {
        if (!anuncioModalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Anuncio modal no encontrado con ID: " + id);
        }
        anuncioModalRepository.deleteById(id);
        auditoriaService.registrarEvento("ANUNCIO_MODAL", "ELIMINAR", "Eliminado anuncio modal ID: " + id);
    }

    private AnuncioModalResponseDTO convertToDto(AnuncioModal a) {
        return AnuncioModalResponseDTO.builder()
                .id(a.getId())
                .titulo(a.getTitulo())
                .mensaje(a.getMensaje())
                .imagenUrl(a.getImagenUrl())
                .botonTexto(a.getBotonTexto())
                .botonUrl(a.getBotonUrl())
                .audiencia(a.getAudiencia())
                .activo(a.getActivo())
                .fechaInicio(a.getFechaInicio())
                .fechaFin(a.getFechaFin())
                .creadoPor(a.getCreadoPor())
                .fechaCreacion(a.getFechaCreacion())
                .build();
    }
}
