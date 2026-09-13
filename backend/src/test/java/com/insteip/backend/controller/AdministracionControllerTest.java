package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.configuracion.ConfiguracionResponse;
import com.insteip.backend.domain.dto.matricula.MatriculaRequestDTO;
import com.insteip.backend.domain.dto.matricula.MatriculaResponseDTO;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.CertificadoService;
import com.insteip.backend.service.interfaces.ConfiguracionService;
import com.insteip.backend.service.interfaces.MatriculaService;
import com.insteip.backend.service.interfaces.UsuarioService;
import com.insteip.backend.repository.CertificadoRepository;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.PagoRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.domain.entity.Certificado;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.entity.Curso;
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
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = {
        UsuarioController.class,
        MatriculaController.class,
        PagoController.class,
        CertificadoController.class,
        ReportesController.class,
        AuditoriaController.class,
        EventoSistemaController.class,
        ConfiguracionController.class
    },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
    }
)
@AutoConfigureMockMvc(addFilters = false)
class AdministracionControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private UsuarioService usuarioService;
    @MockitoBean private MatriculaService matriculaService;
    @MockitoBean private com.insteip.backend.service.interfaces.MatriculaPdfService matriculaPdfService;
    @MockitoBean private CertificadoService certificadoService;
    @MockitoBean private AuditoriaService auditoriaService;
    @MockitoBean private ConfiguracionService configuracionService;

    // Direct repository mocks autowired by controllers
    @MockitoBean private UsuarioRepository usuarioRepository;
    @MockitoBean private MatriculaRepository matriculaRepository;
    @MockitoBean private CertificadoRepository certificadoRepository;
    @MockitoBean private CursoRepository cursoRepository;
    @MockitoBean private PagoRepository pagoRepository;

    // --- USUARIO CONTROLLER ---

    @Test
    void listarAlumnos_shouldReturnEmptyPage() throws Exception {
        when(usuarioService.listarAlumnos(any(), any(), anyBoolean())).thenReturn(org.springframework.data.domain.Page.empty());

        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk());
    }

    // --- MATRICULA CONTROLLER ---

    @Test
    void matricularAlumno_shouldReturnMatricula() throws Exception {
        MatriculaRequestDTO request = new MatriculaRequestDTO(12L, 100L);
        MatriculaResponseDTO response = new MatriculaResponseDTO(1L, 12L, "Juan", "Perez", "juan@insteip.com", 100L, "Angular", LocalDateTime.now(), LocalDateTime.now().plusMonths(12), true);

        when(matriculaService.matricularAlumno(any(MatriculaRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/matriculas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cursoNombre").value("Angular"));
    }

    // --- PAGO CONTROLLER ---

    @Test
    void listarPagos_shouldReturnPagos() throws Exception {
        when(pagoRepository.findByAprobadoFalse()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/pagos/pendientes"))
                .andExpect(status().isOk());
    }

    // --- CERTIFICADO CONTROLLER ---

    @Test
    void validarCertificado_shouldReturnValidation() throws Exception {
        Certificado cert = new Certificado();
        cert.setId(1L);
        cert.setCodigo("CERT-123");
        cert.setFechaEmision(LocalDateTime.now());
        cert.setUsuario(Usuario.builder().id(12L).nombres("Juan").apellidos("Perez").build());
        cert.setCurso(Curso.builder().id(100L).nombre("Angular").build());
        cert.setArchivoPdf("test.pdf");

        when(certificadoService.validarCertificado("CERT-123")).thenReturn(cert);

        mockMvc.perform(get("/api/certificados/validar/CERT-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alumno").value("Juan Perez"));
    }

    // --- REPORTES CONTROLLER ---

    @Test
    void exportarAlumnos_shouldWriteCsv() throws Exception {
        when(usuarioRepository.findByRolNombre("ALUMNO")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/reportes/alumnos"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv;charset=UTF-8"));
    }

    // --- AUDITORIA CONTROLLER ---

    @Test
    void listarLoginAuditoria_shouldReturnList() throws Exception {
        when(auditoriaService.listarLoginAuditorias(any(), any(), any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/auditoria/login"))
                .andExpect(status().isOk());
    }

    // --- EVENTOS SISTEMA CONTROLLER ---

    @Test
    void listarEventosSistema_shouldReturnList() throws Exception {
        when(auditoriaService.listarEventosSistema()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/eventos"))
                .andExpect(status().isOk());
    }

    // --- CONFIGURACION CONTROLLER ---

    @Test
    void obtenerConfiguracion_shouldReturnConfig() throws Exception {
        ConfiguracionResponse response = new ConfiguracionResponse(1L, "Insteip", "logo", "mail", "tel", "dir", "yape", "plin", "paypal", "#color1", "#color2");
        when(configuracionService.obtenerConfiguracion()).thenReturn(response);

        mockMvc.perform(get("/api/configuracion"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreInstitucion").value("Insteip"));
    }
}
