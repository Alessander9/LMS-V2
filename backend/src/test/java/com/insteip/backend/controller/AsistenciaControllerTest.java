package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.academico.AsistenciaDtos.*;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AsistenciaQrService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = AsistenciaController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
})
@AutoConfigureMockMvc(addFilters = false)
class AsistenciaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AsistenciaQrService asistenciaQrService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @Test
    void crearSesionClase_DebeRetornar201() throws Exception {
        CrearSesionClaseRequest request = CrearSesionClaseRequest.builder()
                .cursoId(1L)
                .seccionGradoId(2L)
                .fecha(LocalDate.now())
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(9, 30))
                .tema("Clase Magistral de Ecosistemas")
                .build();

        SesionClaseResponse response = SesionClaseResponse.builder()
                .id(10L)
                .cursoId(1L)
                .cursoNombre("Ciencias Naturales")
                .seccionGradoId(2L)
                .gradoOCiclo("3ro Primaria")
                .seccion("A")
                .docenteId(5L)
                .docenteNombre("Prof. Juan")
                .fecha(LocalDate.now())
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(9, 30))
                .tema("Clase Magistral de Ecosistemas")
                .qrSesionToken("QR_SES_1234567890ABCDEF")
                .estado("ABIERTA")
                .build();

        when(asistenciaQrService.crearSesionClase(any(CrearSesionClaseRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/asistencias/sesiones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.estado").value("ABIERTA"))
                .andExpect(jsonPath("$.qrSesionToken").value("QR_SES_1234567890ABCDEF"));
    }

    @Test
    void marcarAsistenciaPorQr_DebeRetornarMarcacionExitosa() throws Exception {
        MarcacionQrRequest request = MarcacionQrRequest.builder()
                .qrToken("QR_STU_78945612")
                .sesionId(10L)
                .estado("PRESENTE")
                .metodo("QR_SCAN")
                .build();

        MarcacionResponse response = MarcacionResponse.builder()
                .asistenciaId(100L)
                .sesionId(10L)
                .estudianteId(1L)
                .estudianteNombre("Ana Lucía Morales")
                .dni("78945612")
                .estado("PRESENTE")
                .metodoMarcacion("QR_SCAN")
                .fechaHoraMarcacion(LocalDateTime.now())
                .mensaje("¡Asistencia registrada exitosamente! Estado: PRESENTE")
                .build();

        when(asistenciaQrService.marcarAsistenciaPorQr(any(MarcacionQrRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/asistencias/qr/marcar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.asistenciaId").value(100))
                .andExpect(jsonPath("$.estado").value("PRESENTE"))
                .andExpect(jsonPath("$.estudianteNombre").value("Ana Lucía Morales"));
    }

    @Test
    void listarAsistenciaPorSesion_DebeRetornarListaEstudiantes() throws Exception {
        AsistenciaItemResponse item = AsistenciaItemResponse.builder()
                .asistenciaId(100L)
                .estudianteId(1L)
                .codigoEstudiante("EST-2026-001")
                .estudianteNombres("Ana Lucía")
                .estudianteApellidos("Morales")
                .dni("78945612")
                .estado("PRESENTE")
                .metodoMarcacion("QR_SCAN")
                .fechaHoraMarcacion(LocalDateTime.now())
                .build();

        when(asistenciaQrService.listarAsistenciaPorSesion(10L)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/asistencias/sesiones/10/listado"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigoEstudiante").value("EST-2026-001"))
                .andExpect(jsonPath("$[0].estado").value("PRESENTE"));
    }

    @Test
    void obtenerResumenEstudiante_DebeRetornarMetricas() throws Exception {
        ResumenAsistenciaEstudiante resumen = ResumenAsistenciaEstudiante.builder()
                .estudianteId(1L)
                .estudianteNombre("Ana Lucía Morales")
                .totalClases(20L)
                .asistencias(18L)
                .tardanzas(2L)
                .faltas(0L)
                .porcentajeAsistencia(98.0)
                .historial(Collections.emptyList())
                .build();

        when(asistenciaQrService.obtenerResumenEstudiante(1L)).thenReturn(resumen);

        mockMvc.perform(get("/api/asistencias/estudiante/1/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClases").value(20))
                .andExpect(jsonPath("$.porcentajeAsistencia").value(98.0));
    }
}
