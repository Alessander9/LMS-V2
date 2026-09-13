package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.academico.EstudianteDtos.*;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.service.interfaces.EstudianteService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = EstudianteController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
})
@AutoConfigureMockMvc(addFilters = false)
class EstudianteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EstudianteService estudianteService;

    @Test
    void registrarEstudiante_DebeRetornar201() throws Exception {
        RegistroEstudianteRequest request = RegistroEstudianteRequest.builder()
                .nombres("Carlos")
                .apellidos("Ramírez")
                .correo("carlos.ramirez@lmsv2.edu.pe")
                .dni("76543210")
                .fechaNacimiento(LocalDate.of(2010, 5, 12))
                .nombreApoderado("María Ramírez")
                .telefonoApoderado("987654321")
                .build();

        EstudianteResponse response = EstudianteResponse.builder()
                .id(1L)
                .usuarioId(10L)
                .codigoEstudiante("EST-2026-050")
                .dni("76543210")
                .nombres("Carlos")
                .apellidos("Ramírez")
                .correo("carlos.ramirez@lmsv2.edu.pe")
                .nombreApoderado("María Ramírez")
                .qrToken("QR_STU_76543210")
                .build();

        when(estudianteService.registrarEstudiante(any(RegistroEstudianteRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.codigoEstudiante").value("EST-2026-050"))
                .andExpect(jsonPath("$.qrToken").value("QR_STU_76543210"));
    }

    @Test
    void listarEstudiantes_DebeRetornarLista() throws Exception {
        EstudianteResponse response = EstudianteResponse.builder()
                .id(1L)
                .codigoEstudiante("EST-2026-050")
                .nombres("Carlos")
                .apellidos("Ramírez")
                .dni("76543210")
                .build();

        when(estudianteService.listarEstudiantes(any())).thenReturn(List.of(response));

        mockMvc.perform(get("/api/estudiantes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombres").value("Carlos"))
                .andExpect(jsonPath("$[0].dni").value("76543210"));
    }

    @Test
    void obtenerCarnetQr_DebeRetornarDatosDeCarnetConQr() throws Exception {
        CarnetEstudianteQrResponse carnet = CarnetEstudianteQrResponse.builder()
                .estudianteId(1L)
                .codigoEstudiante("EST-2026-050")
                .nombresCompletos("Carlos Ramírez")
                .dni("76543210")
                .qrToken("QR_STU_76543210")
                .gradoOSeccion("3ro Primaria A")
                .nivel("PRIMARIA")
                .fechaEmision("2026-09-13")
                .build();

        when(estudianteService.obtenerCarnetQr(1L)).thenReturn(carnet);

        mockMvc.perform(get("/api/estudiantes/1/carnet-qr"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estudianteId").value(1))
                .andExpect(jsonPath("$.codigoEstudiante").value("EST-2026-050"))
                .andExpect(jsonPath("$.nombresCompletos").value("Carlos Ramírez"))
                .andExpect(jsonPath("$.qrToken").value("QR_STU_76543210"));
    }
}
