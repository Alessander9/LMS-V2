package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.alumno.AlumnoCursoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoDashboardMetrics;
import com.insteip.backend.domain.dto.curso.CursoResponseDTO;
import com.insteip.backend.domain.dto.docente.DocenteEstudianteProgressResponse;
import com.insteip.backend.infrastructure.scheduler.BackupScheduler;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.service.interfaces.AlumnoDashboardService;
import com.insteip.backend.service.interfaces.DocenteDashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = {
        AlumnoDashboardController.class,
        DocenteDashboardController.class,
        SistemaController.class
    },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
    }
)
@AutoConfigureMockMvc(addFilters = false)
class DashboardsControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private AlumnoDashboardService alumnoDashboardService;
    @MockitoBean private DocenteDashboardService docenteDashboardService;

    static class StubBackupScheduler extends BackupScheduler {
        @Override
        public String runBackup() throws Exception {
            return "2026-07-06_12-00-00";
        }
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        public DataSource dataSource() {
            // Use real Spring DriverManagerDataSource to avoid Mockito instrumenting JDK javax.sql.DataSource on Java 25
            return new DriverManagerDataSource();
        }

        @Bean
        public BackupScheduler backupScheduler() {
            // Use stub subclass of BackupScheduler to avoid Mockito instrumenting the concrete class on Java 25
            return new StubBackupScheduler();
        }
    }

    // --- ALUMNO DASHBOARD ---

    @Test
    void getMetrics_shouldReturnMetrics() throws Exception {
        AlumnoDashboardMetrics response = new AlumnoDashboardMetrics(1, 0, 0);
        when(alumnoDashboardService.getMetrics("test@insteip.com")).thenReturn(response);

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "test@insteip.com", "token", Collections.emptyList()
                );

        mockMvc.perform(get("/api/alumno/dashboard").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cursosInscritos").value(1));
    }

    @Test
    void getEnrolledCursos_shouldReturnCursos() throws Exception {
        AlumnoCursoResponse response = new AlumnoCursoResponse(1L, "Curso", "Desc", "img", "BASICO", java.math.BigDecimal.valueOf(45.0), false, java.time.LocalDateTime.now(), java.time.LocalDateTime.now());
        when(alumnoDashboardService.getEnrolledCursos("test@insteip.com")).thenReturn(List.of(response));

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "test@insteip.com", "token", Collections.emptyList()
                );

        mockMvc.perform(get("/api/alumno/cursos").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Curso"));
    }

    // --- DOCENTE DASHBOARD ---

    @Test
    void getCursosAsignados_shouldReturnCursos() throws Exception {
        CursoResponseDTO response = new CursoResponseDTO(1L, "Curso Docente", "Desc", "img", List.of("BASICO"), true, 11L, "Docente", java.time.LocalDateTime.now());
        when(docenteDashboardService.getCursosAsignados("docente@insteip.com")).thenReturn(List.of(response));

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "docente@insteip.com", "token", Collections.emptyList()
                );

        mockMvc.perform(get("/api/docente/cursos").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Curso Docente"));
    }

    @Test
    void getAlumnosCurso_shouldReturnAlumnos() throws Exception {
        DocenteEstudianteProgressResponse response = new DocenteEstudianteProgressResponse(2L, "Juan", "Perez", "juan@insteip.com", 70.0, false, LocalDateTime.now());
        when(docenteDashboardService.getAlumnosCurso("docente@insteip.com", 1L)).thenReturn(List.of(response));

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "docente@insteip.com", "token", Collections.emptyList()
                );

        mockMvc.perform(get("/api/docente/cursos/1/alumnos").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombres").value("Juan"));
    }

    // --- SISTEMA CONTROLLER ---

    @Test
    void triggerBackup_shouldReturnSuccess() throws Exception {
        mockMvc.perform(post("/api/sistema/backup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.timestamp").value("2026-07-06_12-00-00"));
    }
}
