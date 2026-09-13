package com.insteip.backend.service.impl;

import com.insteip.backend.domain.entity.*;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatriculaPdfServiceTest {

    @Mock
    private MatriculaRepository matriculaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private MatriculaPdfServiceImpl matriculaPdfService;

    @Test
    void generarPdfMatricula_DebeGenerarArchivoValido() throws Exception {
        ReflectionTestUtils.setField(matriculaPdfService, "frontendBaseUrl", "https://insteip.edu.pe");

        Rol rolAlumno = Rol.builder().id(3L).nombre("ALUMNO").build();
        Rol rolDocente = Rol.builder().id(2L).nombre("DOCENTE").build();

        Usuario alumno = Usuario.builder()
                .id(101L)
                .nombres("Carlos Alberto")
                .apellidos("Mendoza Quispe")
                .correo("carlos.mendoza@insteip.edu.pe")
                .passwordPlain("Insteip2026*")
                .telefono("+51 987 654 321")
                .rol(rolAlumno)
                .estado(true)
                .build();

        Usuario docente = Usuario.builder()
                .id(201L)
                .nombres("Dra. Elena")
                .apellidos("Vargas Morales")
                .correo("elena.vargas@insteip.edu.pe")
                .rol(rolDocente)
                .estado(true)
                .build();

        Curso curso = Curso.builder()
                .id(501L)
                .nombre("Especialización en Fitoterapia y Medicina Integrativa")
                .docente(docente)
                .estado(true)
                .build();

        Matricula matricula = Matricula.builder()
                .id(1001L)
                .usuario(alumno)
                .curso(curso)
                .fechaMatricula(LocalDateTime.now())
                .fechaExpiracion(LocalDateTime.now().plusMonths(12))
                .estado(true)
                .build();

        when(matriculaRepository.findById(1001L)).thenReturn(Optional.of(matricula));

        byte[] pdfBytes = matriculaPdfService.generarPdfMatricula(1001L, "carlos.mendoza@insteip.edu.pe");

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);

        // Guardar en la raíz del proyecto para que el usuario pueda visualizarlo
        Path outputPath = Paths.get("..", "ficha_matricula_test.pdf").toAbsolutePath().normalize();
        try (FileOutputStream fos = new FileOutputStream(outputPath.toFile())) {
            fos.write(pdfBytes);
        }
        System.out.println("PDF de prueba generado con éxito en: " + outputPath);
    }
}
