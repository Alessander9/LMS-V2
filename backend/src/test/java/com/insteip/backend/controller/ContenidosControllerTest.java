package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.avance.AvanceProgressRequest;
import com.insteip.backend.domain.dto.avance.AvanceProgressResponse;
import com.insteip.backend.domain.dto.curso.CursoRequestDTO;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.material.MaterialResponseDTO;
import com.insteip.backend.domain.dto.modulo.ModuloRequestDTO;
import com.insteip.backend.domain.dto.modulo.ModuloResponseDTO;
import com.insteip.backend.domain.dto.video.VideoRequestDTO;
import com.insteip.backend.domain.dto.video.VideoResponseDTO;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.service.interfaces.*;
import com.insteip.backend.domain.entity.Material;
import com.insteip.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = {
        CursoController.class,
        ModuloController.class,
        VideoController.class,
        MaterialController.class,
        AvanceController.class
    },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
    }
)
@AutoConfigureMockMvc(addFilters = false)
class ContenidosControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private CursoService cursoService;
    @MockitoBean private ModuloService moduloService;
    @MockitoBean private VideoService videoService;
    @MockitoBean private MaterialService materialService;
    @MockitoBean private AvanceService avanceService;
    @MockitoBean private UsuarioRepository usuarioRepository;
    @MockitoBean private com.insteip.backend.repository.MatriculaRepository matriculaRepository;
    @MockitoBean private com.insteip.backend.repository.MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;

    // --- CURSO CONTROLLER ---

    @Test
    void listarCursos_shouldReturnCursos() throws Exception {
        CursoResponseDTO response = new CursoResponseDTO(1L, "Curso 1", "Desc", "img", List.of("BASICO"), true, 10L, "Docente", java.time.LocalDateTime.now());
        when(cursoService.listarCursos(any(Pageable.class), any())).thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/cursos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nombre").value("Curso 1"));
    }

    @Test
    void obtenerCurso_shouldReturnCurso() throws Exception {
        CursoResponseDTO response = new CursoResponseDTO(1L, "Curso 1", "Desc", "img", List.of("BASICO"), true, 10L, "Docente", java.time.LocalDateTime.now());
        when(cursoService.obtenerDetalle(1L)).thenReturn(response);

        mockMvc.perform(get("/api/cursos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Curso 1"));
    }

    @Test
    void crearCurso_shouldReturnCreatedCurso() throws Exception {
        CursoRequestDTO request = new CursoRequestDTO("Curso 1", "Desc 10 char min", "img", List.of(1L), 10L);
        CursoResponseDTO response = new CursoResponseDTO(1L, "Curso 1", "Desc 10 char min", "img", List.of("BASICO"), true, 10L, "Docente", java.time.LocalDateTime.now());
        when(cursoService.crearCurso(any(CursoRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/cursos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Curso 1"));
    }

    // --- MODULO CONTROLLER ---

    @Test
    void listarModulosPorCurso_shouldReturnModulos() throws Exception {
        ModuloResponseDTO response = new ModuloResponseDTO(2L, "Modulo 1", "Desc", 1, true, 1L, "Curso 1");
        // Mapped at CursoController GET /api/cursos/{id}/modulos
        when(moduloService.listarModulosPorCurso(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/cursos/1/modulos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Modulo 1"));
    }

    @Test
    void crearModulo_shouldReturnCreatedModulo() throws Exception {
        ModuloRequestDTO request = new ModuloRequestDTO(1L, "Modulo 1", "Desc Modulo", 1);
        ModuloResponseDTO response = new ModuloResponseDTO(2L, "Modulo 1", "Desc Modulo", 1, true, 1L, "Curso 1");
        when(moduloService.crearModulo(any(ModuloRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/modulos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Modulo 1"));
    }

    // --- VIDEO CONTROLLER ---

    @Test
    void listarVideosPorModulo_shouldReturnVideos() throws Exception {
        VideoResponseDTO response = new VideoResponseDTO(3L, "Video 1", "Desc", "https://youtube.com/watch?v=123", 1, true, java.time.LocalDateTime.now(), 300);
        // Mapped at ModuloController GET /api/modulos/{id}/videos
        when(videoService.listarVideosPorModulo(eq(2L), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/modulos/2/videos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].titulo").value("Video 1"));
    }

    @Test
    void crearVideo_shouldReturnCreatedVideo() throws Exception {
        VideoRequestDTO request = new VideoRequestDTO(2L, "Video 1", "Desc Video", "https://youtube.com/watch?v=123", 1, 300);
        VideoResponseDTO response = new VideoResponseDTO(3L, "Video 1", "Desc Video", "https://youtube.com/watch?v=123", 1, true, java.time.LocalDateTime.now(), 300);
        when(videoService.crearVideo(any(VideoRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/videos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Video 1"));
    }

    // --- MATERIAL CONTROLLER ---

    @Test
    void listarMaterialesPorModulo_shouldReturnMateriales() throws Exception {
        MaterialResponseDTO response = new MaterialResponseDTO(4L, "Material 1", "http://material", "application/pdf", 1024L, true, java.time.LocalDateTime.now());
        // Mapped at ModuloController GET /api/modulos/{id}/materiales
        when(materialService.listarMaterialesPorModulo(eq(2L), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/modulos/2/materiales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nombre").value("Material 1"));
    }

    @Test
    void crearMaterial_shouldReturnCreatedMaterial() throws Exception {
        MaterialResponseDTO response = new MaterialResponseDTO(4L, "Material 1", "http://material", "application/pdf", 1024L, true, java.time.LocalDateTime.now());
        MockMultipartFile file = new MockMultipartFile("archivo", "test.pdf", "application/pdf", "bytes".getBytes());
        when(materialService.crearMaterial(eq(2L), eq("Material 1"), any())).thenReturn(response);

        mockMvc.perform(multipart("/api/materiales")
                        .file(file)
                        .param("moduloId", "2")
                        .param("nombre", "Material 1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Material 1"));
    }

    @Test
    void descargarMaterial_shouldReturnFileBytes() throws Exception {
        byte[] fileBytes = "test-file-content".getBytes();
        Material mat = new Material();
        mat.setId(4L);
        mat.setNombre("test.pdf");
        mat.setTipoArchivo("application/pdf");

        when(materialService.obtenerMaterialEntity(4L)).thenReturn(mat);
        when(materialService.descargarMaterialBytes(4L)).thenReturn(fileBytes);

        mockMvc.perform(get("/api/materiales/4/download"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(fileBytes));
    }

    // --- AVANCE CONTROLLER ---

    @Test
    void guardarProgreso_shouldReturnProgress() throws Exception {
        AvanceProgressRequest request = new AvanceProgressRequest();
        request.setVideoId(3L);
        request.setUltimoSegundo(120);
        request.setDuracionSegundos(300);

        AvanceProgressResponse response = AvanceProgressResponse.builder()
                .videoId(3L)
                .ultimoSegundo(120)
                .porcentajeVisto(BigDecimal.valueOf(40.0))
                .completado(false)
                .build();

        // Security Authentication stub
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken authToken = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "test@insteip.com", "token", Collections.emptyList()
                );
        when(usuarioRepository.findByCorreo("test@insteip.com")).thenReturn(Optional.of(
                com.insteip.backend.domain.entity.Usuario.builder().id(2L).correo("test@insteip.com").build()
        ));
        when(avanceService.guardarProgreso(eq(2L), any(AvanceProgressRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/avance")
                        .principal(authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ultimoSegundo").value(120));
    }
}
