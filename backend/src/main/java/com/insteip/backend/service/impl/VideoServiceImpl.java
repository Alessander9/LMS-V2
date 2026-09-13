package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.video.VideoRequestDTO;
import com.insteip.backend.domain.dto.video.VideoResponseDTO;
import com.insteip.backend.domain.entity.Video;
import com.insteip.backend.domain.entity.Modulo;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.VideoRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.service.interfaces.VideoService;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {

    private final VideoRepository videoRepository;

    private final ModuloRepository moduloRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;
    private final com.insteip.backend.service.interfaces.NotificacionService notificacionService;

    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
    private static final Pattern DURATION_PATTERN = Pattern.compile("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?");
    private static final Pattern META_DURATION = Pattern.compile("itemprop=\"duration\" content=\"(PT[^\"]+)\"");
    private static final Pattern JSON_DURATION = Pattern.compile("\"lengthSeconds\":\"(\\d+)\"");

    @Override
    public Page<VideoResponseDTO> listarVideosPorModulo(Long moduloId, String search, Pageable pageable) {
        if (!moduloRepository.existsById(moduloId)) {
            throw new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId);
        }
        String normalizedSearch = search == null ? "" : search.trim();
        return videoRepository.searchByModuloId(moduloId, normalizedSearch, pageable)
                .map(this::convertToResponseDto);
    }

    @Override
    public org.springframework.data.domain.Page<VideoResponseDTO> listarVideos(org.springframework.data.domain.Pageable pageable) {
        return videoRepository.findAll(pageable).map(this::convertToResponseDto);
    }

    @Override
    public VideoResponseDTO crearVideo(VideoRequestDTO dto) {
        Modulo modulo = moduloRepository.findById(dto.moduloId())
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + dto.moduloId()));

        String youtubeId = extraerIdYoutube(dto.youtubeUrl());

        // Usar duración del DTO si fue enviada, o intentar obtenerla desde YouTube
        Integer duracion = dto.duracionSegundos();
        if ((duracion == null || duracion <= 0) && youtubeId != null) {
            duracion = obtenerDuracionDesdeYouTube(youtubeId);
        }

        Video video = Video.builder()
                .modulo(modulo)
                .titulo(dto.titulo())
                .descripcion(dto.descripcion())
                .youtubeUrl(dto.youtubeUrl())
                .youtubeId(youtubeId)
                .duracionSegundos(duracion)
                .orden(dto.orden())
                .estado(true)
                .build();

        Video saved = videoRepository.save(video);
        auditoriaService.registrarEvento("VIDEO", "CREAR", "Creado video: " + saved.getTitulo() + " (ID: " + saved.getId() + ")");

        if (modulo.getCurso() != null) {
            Long cursoId = modulo.getCurso().getId();
            notificacionService.notificarAlumnosDeCurso(
                    cursoId,
                    "🎬 Nueva clase disponible",
                    "Se ha publicado la clase '" + saved.getTitulo() + "' en el Módulo " + modulo.getOrden() + " (" + (modulo.getCurso().getNombre() != null ? modulo.getCurso().getNombre() : "") + ")",
                    "VIDEO_NUEVO",
                    "/dashboard/cursos-play/" + cursoId,
                    "smart_display"
            );
        }

        return convertToResponseDto(saved);
    }

    @Override
    public VideoResponseDTO editarVideo(Long id, VideoRequestDTO dto) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + id));

        Modulo modulo = moduloRepository.findById(dto.moduloId())
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + dto.moduloId()));

        String youtubeId = extraerIdYoutube(dto.youtubeUrl());

        // Si se envía duración en el DTO, usarla; si la URL cambió, intentar obtenerla
        Integer duracion = (dto.duracionSegundos() != null && dto.duracionSegundos() > 0)
                ? dto.duracionSegundos() : video.getDuracionSegundos();
        boolean youtubeUrlChanged = !dto.youtubeUrl().equals(video.getYoutubeUrl());
        if ((duracion == null || duracion <= 0) && youtubeUrlChanged && youtubeId != null) {
            duracion = obtenerDuracionDesdeYouTube(youtubeId);
        }

        video.setModulo(modulo);
        video.setTitulo(dto.titulo());
        video.setDescripcion(dto.descripcion());
        video.setYoutubeUrl(dto.youtubeUrl());
        video.setYoutubeId(youtubeId);
        if (duracion != null && duracion > 0) {
            video.setDuracionSegundos(duracion);
        }
        video.setOrden(dto.orden());

        Video saved = videoRepository.save(video);
        auditoriaService.registrarEvento("VIDEO", "EDITAR", "Editado video: " + saved.getTitulo() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void actualizarDuracion(Long videoId, Integer duracionSegundos) {
        if (duracionSegundos == null || duracionSegundos <= 0) return;
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + videoId));
        if (video.getDuracionSegundos() == null || video.getDuracionSegundos() <= 0) {
            video.setDuracionSegundos(duracionSegundos);
            videoRepository.save(video);
        }
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + id));
        video.setEstado(estado);
        Video saved = videoRepository.save(video);
        auditoriaService.registrarEvento("VIDEO", estado ? "ACTIVAR" : "DESACTIVAR",
                (estado ? "Activado" : "Desactivado") + " video: " + saved.getTitulo() + " (ID: " + saved.getId() + ")");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void eliminar(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + id));
        String nombreVideo = video.getTitulo();
        videoRepository.deleteById(id);
        auditoriaService.registrarEvento("VIDEO", "ELIMINAR", "Eliminado video: " + nombreVideo + " (ID: " + id + ")");
    }

    private Integer obtenerDuracionDesdeYouTube(String youtubeId) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.youtube.com/watch?v=" + youtubeId))
                    .timeout(java.time.Duration.ofSeconds(5))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .GET()
                    .build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                String body = response.body();
                // Intento 1: meta tag <meta itemprop="duration" content="PT3M12S">
                Matcher metaMatcher = META_DURATION.matcher(body);
                if (metaMatcher.find()) {
                    Integer dur = parseIso8601Duration(metaMatcher.group(1));
                    if (dur != null && dur > 0) return dur;
                }
                // Intento 2: JSON interno "lengthSeconds":"212"
                Matcher jsonMatcher = JSON_DURATION.matcher(body);
                if (jsonMatcher.find()) {
                    return Integer.parseInt(jsonMatcher.group(1));
                }
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo duracion desde YouTube (" + youtubeId + "): " + e.getMessage());
        }
        return null;
    }

    private Integer parseIso8601Duration(String iso) {
        if (iso == null) return null;
        Matcher m = DURATION_PATTERN.matcher(iso);
        if (m.find()) {
            int hours = m.group(1) != null ? Integer.parseInt(m.group(1)) : 0;
            int minutes = m.group(2) != null ? Integer.parseInt(m.group(2)) : 0;
            int seconds = m.group(3) != null ? Integer.parseInt(m.group(3)) : 0;
            return hours * 3600 + minutes * 60 + seconds;
        }
        return null;
    }

    private String extraerIdYoutube(String url) {
        if (url == null) return null;
        String pattern = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=)[^#\\&\\?]*";
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private VideoResponseDTO convertToResponseDto(Video v) {
        return new VideoResponseDTO(
                v.getId(),
                v.getTitulo(),
                v.getDescripcion(),
                v.getYoutubeUrl(),
                v.getOrden(),
                v.getEstado(),
                v.getFechaCreacion(),
                v.getDuracionSegundos()
        );
    }
}
