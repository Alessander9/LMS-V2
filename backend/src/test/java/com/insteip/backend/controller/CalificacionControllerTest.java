package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.academico.CalificacionDtos.*;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.CalificacionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = CalificacionController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
})
@AutoConfigureMockMvc(addFilters = false)
class CalificacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CalificacionService calificacionService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @Test
    void crearEvaluacionConfig_DebeRetornar201() throws Exception {
        EvaluacionConfigRequest request = EvaluacionConfigRequest.builder()
                .cursoId(1L)
                .periodoAcademicoId(1L)
                .nombre("Examen Parcial")
                .tipoEscala("VIGESIMAL")
                .pesoPorcentual(new BigDecimal("30.00"))
                .orden(1)
                .build();

        EvaluacionConfigResponse response = EvaluacionConfigResponse.builder()
                .id(10L)
                .cursoId(1L)
                .cursoNombre("Desarrollo Web")
                .periodoAcademicoId(1L)
                .periodoNombre("Ciclo 2026-I")
                .nombre("Examen Parcial")
                .tipoEscala("VIGESIMAL")
                .pesoPorcentual(new BigDecimal("30.00"))
                .orden(1)
                .activo(true)
                .build();

        when(calificacionService.crearEvaluacionConfig(any(EvaluacionConfigRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/calificaciones/config")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nombre").value("Examen Parcial"))
                .andExpect(jsonPath("$.tipoEscala").value("VIGESIMAL"));
    }

    @Test
    void registrarCalificacion_ColegioMINEDU_DebeRetornar201() throws Exception {
        RegistroCalificacionRequest request = RegistroCalificacionRequest.builder()
                .matriculaAcademicaId(500L)
                .evaluacionId(10L)
                .valorLiteral("AD")
                .observacion("Excelente")
                .build();

        CalificacionItemResponse response = CalificacionItemResponse.builder()
                .calificacionId(1L)
                .evaluacionId(10L)
                .evaluacionNombre("Evaluación Bimestral")
                .tipoEscala("LITERAL")
                .valorLiteral("AD")
                .fechaRegistro(LocalDateTime.now())
                .build();

        when(calificacionService.registrarCalificacion(any(RegistroCalificacionRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/calificaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.calificacionId").value(1))
                .andExpect(jsonPath("$.valorLiteral").value("AD"));
    }

    @Test
    void modificarCalificacion_ConAuditoria_DebeRetornar200() throws Exception {
        ModificarCalificacionRequest request = ModificarCalificacionRequest.builder()
                .nuevoValorNumerico(new BigDecimal("18.00"))
                .motivoJustificacion("Reclamo resuelto con rúbrica")
                .build();

        CalificacionItemResponse response = CalificacionItemResponse.builder()
                .calificacionId(1L)
                .evaluacionId(10L)
                .valorNumerico(new BigDecimal("18.00"))
                .build();

        when(calificacionService.modificarCalificacion(eq(1L), any(ModificarCalificacionRequest.class), any())).thenReturn(response);

        mockMvc.perform(put("/api/calificaciones/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valorNumerico").value(18.00));
    }

    @Test
    void obtenerHistorialModificaciones_DebeRetornarListaAuditoria() throws Exception {
        HistorialCambioResponse cambio = HistorialCambioResponse.builder()
                .id(1L)
                .calificacionId(1L)
                .notaAnteriorNum(new BigDecimal("14.00"))
                .notaNuevaNum(new BigDecimal("18.00"))
                .modificadoPorNombre("Prof. García")
                .fechaModificacion(LocalDateTime.now())
                .motivoJustificacion("Revisión de rúbrica")
                .build();

        when(calificacionService.obtenerHistorialModificaciones(1L)).thenReturn(List.of(cambio));

        mockMvc.perform(get("/api/calificaciones/1/historial"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].motivoJustificacion").value("Revisión de rúbrica"))
                .andExpect(jsonPath("$[0].notaNuevaNum").value(18.00));
    }

    @Test
    void generarBoletaNotas_DebeRetornarBoletaConsolidada() throws Exception {
        BoletaNotasEstudianteResponse boleta = BoletaNotasEstudianteResponse.builder()
                .estudianteId(1L)
                .codigoEstudiante("EST-2026-001")
                .estudianteNombre("Lucía Mendoza")
                .dni("78451296")
                .tipoInstitucion("INSTITUTO")
                .tipoEscala("VIGESIMAL")
                .promedioFinalNumerico(new BigDecimal("17.50"))
                .estadoAprobacion("APROBADO")
                .conclusionDescriptiva("Desempeño sobresaliente en todas las competencias evaluadas.")
                .calificaciones(Collections.emptyList())
                .build();

        when(calificacionService.generarBoletaNotas(500L)).thenReturn(boleta);

        mockMvc.perform(get("/api/calificaciones/boleta/500"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estudianteNombre").value("Lucía Mendoza"))
                .andExpect(jsonPath("$.promedioFinalNumerico").value(17.50))
                .andExpect(jsonPath("$.estadoAprobacion").value("APROBADO"));
    }
}
