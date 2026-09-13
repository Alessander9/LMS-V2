package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.anuncio.AnuncioModalRequestDTO;
import com.insteip.backend.domain.dto.anuncio.AnuncioModalResponseDTO;
import com.insteip.backend.domain.dto.notificacion.ComunicadoRequestDTO;
import com.insteip.backend.domain.dto.notificacion.NotificacionResponseDTO;
import com.insteip.backend.domain.dto.notificacion.NotificacionResumenDTO;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.service.interfaces.AnuncioModalService;
import com.insteip.backend.service.interfaces.NotificacionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = {
        NotificacionController.class,
        AnuncioModalController.class
    },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
    }
)
@AutoConfigureMockMvc(addFilters = false)
class NotificacionYAnuncioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private NotificacionService notificacionService;

    @MockitoBean
    private AnuncioModalService anuncioModalService;

    @Test
    @DisplayName("GET /api/notificaciones/mis-notificaciones - Debe retornar resumen de notificaciones y conteo")
    @WithMockUser(username = "alumno@insteip.com", roles = {"ALUMNO"})
    void testObtenerMisNotificaciones() throws Exception {
        NotificacionResponseDTO item = NotificacionResponseDTO.builder()
                .id(1L)
                .titulo("🎬 Nueva clase disponible")
                .mensaje("Se ha publicado la clase 1")
                .tipo("VIDEO_NUEVO")
                .urlDestino("/dashboard/cursos-play/1")
                .icono("smart_display")
                .leido(false)
                .fechaCreacion(LocalDateTime.now())
                .build();

        NotificacionResumenDTO resumen = NotificacionResumenDTO.builder()
                .totalNoLeidas(1)
                .notificaciones(List.of(item))
                .build();

        when(notificacionService.obtenerNotificacionesUsuario(anyString(), anyInt())).thenReturn(resumen);

        mockMvc.perform(get("/api/notificaciones/mis-notificaciones")
                        .param("limite", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalNoLeidas").value(1))
                .andExpect(jsonPath("$.notificaciones[0].titulo").value("🎬 Nueva clase disponible"))
                .andExpect(jsonPath("$.notificaciones[0].tipo").value("VIDEO_NUEVO"));
    }

    @Test
    @DisplayName("PATCH /api/notificaciones/1/leer - Debe marcar la notificación como leída")
    @WithMockUser(username = "alumno@insteip.com", roles = {"ALUMNO"})
    void testMarcarComoLeida() throws Exception {
        doNothing().when(notificacionService).marcarComoLeida(eq(1L), anyString());

        mockMvc.perform(patch("/api/notificaciones/1/leer"))
                .andExpect(status().isNoContent());

        verify(notificacionService, times(1)).marcarComoLeida(eq(1L), anyString());
    }

    @Test
    @DisplayName("PATCH /api/notificaciones/leer-todas - Debe marcar todas las notificaciones como leídas")
    @WithMockUser(username = "alumno@insteip.com", roles = {"ALUMNO"})
    void testMarcarTodasComoLeidas() throws Exception {
        doNothing().when(notificacionService).marcarTodasComoLeidas(anyString());

        mockMvc.perform(patch("/api/notificaciones/leer-todas"))
                .andExpect(status().isNoContent());

        verify(notificacionService, times(1)).marcarTodasComoLeidas(anyString());
    }

    @Test
    @DisplayName("POST /api/notificaciones/comunicado - Admin debe enviar comunicado segmentado")
    @WithMockUser(username = "admin@insteip.com", roles = {"ADMINISTRADOR"})
    void testEnviarComunicadoSegmentado() throws Exception {
        ComunicadoRequestDTO request = ComunicadoRequestDTO.builder()
                .titulo("Aviso General")
                .mensaje("Mensaje para toda la comunidad")
                .audiencia("SOLO_ESTUDIANTES")
                .urlDestino("/dashboard/mis-cursos")
                .icono("campaign")
                .build();

        doNothing().when(notificacionService).enviarComunicadoSegmentado(any(ComunicadoRequestDTO.class), anyString());

        mockMvc.perform(post("/api/notificaciones/comunicado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(notificacionService, times(1)).enviarComunicadoSegmentado(any(ComunicadoRequestDTO.class), anyString());
    }

    @Test
    @DisplayName("GET /api/anuncios-modal/activo - Debe retornar el anuncio modal vigente para el usuario")
    @WithMockUser(username = "alumno@insteip.com", roles = {"ALUMNO"})
    void testObtenerAnuncioActivo() throws Exception {
        AnuncioModalResponseDTO anuncio = AnuncioModalResponseDTO.builder()
                .id(10L)
                .titulo("🔥 Diplomado con 30% Dcto")
                .mensaje("Promoción válida por tiempo limitado")
                .botonTexto("Inscribirme")
                .botonUrl("https://wa.me/51987654321")
                .audiencia("SOLO_ESTUDIANTES")
                .activo(true)
                .build();

        when(anuncioModalService.obtenerAnuncioActivoParaUsuario(any())).thenReturn(anuncio);

        mockMvc.perform(get("/api/anuncios-modal/activo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.titulo").value("🔥 Diplomado con 30% Dcto"))
                .andExpect(jsonPath("$.botonTexto").value("Inscribirme"));
    }

    @Test
    @DisplayName("POST /api/anuncios-modal - Admin debe crear nuevo anuncio modal")
    @WithMockUser(username = "admin@insteip.com", roles = {"ADMINISTRADOR"})
    void testCrearAnuncioModal() throws Exception {
        AnuncioModalRequestDTO request = AnuncioModalRequestDTO.builder()
                .titulo("Nuevo Curso Online")
                .mensaje("Aprende terapias holísticas")
                .botonTexto("Ver Curso")
                .botonUrl("/cursos")
                .audiencia("TODOS")
                .activo(true)
                .build();

        AnuncioModalResponseDTO response = AnuncioModalResponseDTO.builder()
                .id(15L)
                .titulo("Nuevo Curso Online")
                .mensaje("Aprende terapias holísticas")
                .botonTexto("Ver Curso")
                .botonUrl("/cursos")
                .audiencia("TODOS")
                .activo(true)
                .build();

        when(anuncioModalService.crear(any(AnuncioModalRequestDTO.class), anyString())).thenReturn(response);

        mockMvc.perform(post("/api/anuncios-modal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(15))
                .andExpect(jsonPath("$.titulo").value("Nuevo Curso Online"));
    }

    @Test
    @DisplayName("PATCH /api/anuncios-modal/15/estado - Admin debe cambiar estado de anuncio")
    @WithMockUser(username = "admin@insteip.com", roles = {"ADMINISTRADOR"})
    void testCambiarEstadoAnuncio() throws Exception {
        doNothing().when(anuncioModalService).cambiarEstado(eq(15L), eq(false), anyString());

        mockMvc.perform(patch("/api/anuncios-modal/15/estado")
                        .param("estado", "false"))
                .andExpect(status().isNoContent());

        verify(anuncioModalService, times(1)).cambiarEstado(eq(15L), eq(false), anyString());
    }
}
