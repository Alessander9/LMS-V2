package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.matricula.ModuloAccesoDTO;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.service.interfaces.MatriculaPdfService;
import com.insteip.backend.service.interfaces.MatriculaService;
import com.insteip.backend.service.interfaces.AuditoriaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = { MatriculaController.class },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
            SecurityConfig.class,
            JwtAuthenticationFilter.class
        })
    }
)
@AutoConfigureMockMvc(addFilters = false)
class MatriculaModuloAccesoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MatriculaService matriculaService;

    @MockitoBean
    private MatriculaPdfService matriculaPdfService;

    @MockitoBean
    private AuditoriaService auditoriaService;

    @Test
    @DisplayName("GET /api/matriculas/{id}/modulos-acceso - Retorna lista de módulos con estado de habilitación")
    void testListarModulosAcceso() throws Exception {
        Long matriculaId = 1L;
        List<ModuloAccesoDTO> mockList = List.of(
                new ModuloAccesoDTO(101L, "Módulo 1: Fundamentos", 1, true, LocalDateTime.now()),
                new ModuloAccesoDTO(102L, "Módulo 2: Técnicas Avanzadas", 2, false, null)
        );

        when(matriculaService.listarModulosAcceso(matriculaId)).thenReturn(mockList);

        mockMvc.perform(get("/api/matriculas/{id}/modulos-acceso", matriculaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].moduloId").value(101))
                .andExpect(jsonPath("$[0].nombreModulo").value("Módulo 1: Fundamentos"))
                .andExpect(jsonPath("$[0].habilitado").value(true))
                .andExpect(jsonPath("$[1].moduloId").value(102))
                .andExpect(jsonPath("$[1].habilitado").value(false));

        verify(matriculaService).listarModulosAcceso(matriculaId);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/modulos/{moduloId}/acceso - Actualiza acceso individual")
    void testActualizarModuloAcceso() throws Exception {
        Long matriculaId = 1L;
        Long moduloId = 102L;

        doNothing().when(matriculaService).actualizarModuloAcceso(matriculaId, moduloId, true);

        mockMvc.perform(patch("/api/matriculas/{id}/modulos/{moduloId}/acceso", matriculaId, moduloId)
                        .param("habilitado", "true"))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarModuloAcceso(matriculaId, moduloId, true);
    }

    @Test
    @DisplayName("PUT /api/matriculas/{id}/modulos-acceso - Actualiza accesos masivamente")
    void testActualizarModulosAccesoMasivo() throws Exception {
        Long matriculaId = 1L;
        List<Long> modulosHabilitados = List.of(101L, 103L);

        doNothing().when(matriculaService).actualizarModulosAccesoMasivo(eq(matriculaId), eq(modulosHabilitados));

        mockMvc.perform(put("/api/matriculas/{id}/modulos-acceso", matriculaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modulosHabilitados)))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarModulosAccesoMasivo(eq(matriculaId), eq(modulosHabilitados));
    }
}
