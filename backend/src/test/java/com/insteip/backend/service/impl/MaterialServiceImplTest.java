package com.insteip.backend.service.impl;

import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Material;
import com.insteip.backend.domain.entity.Modulo;
import com.insteip.backend.domain.entity.Rol;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.repository.MaterialRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AuditoriaService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceImplTest {

    @Mock private MaterialRepository materialRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private MatriculaRepository matriculaRepository;
    @Mock private AuditoriaService auditoriaService;
    
    @InjectMocks
    private MaterialServiceImpl materialService;

    private String previousUserDir;
    private Path tempWorkspace;

    @BeforeEach
    void setUp() throws IOException {
        previousUserDir = System.getProperty("user.dir");
        tempWorkspace = Files.createTempDirectory("insteip-material-tests");
        System.setProperty("user.dir", tempWorkspace.toString());
        ReflectionTestUtils.setField(materialService, "storagePathSetting", tempWorkspace.resolve("uploads").toString());
        materialService.init();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        if (previousUserDir != null) {
            System.setProperty("user.dir", previousUserDir);
        }
    }

    @Test
    void crearMaterial_should_reject_disallowed_mime_and_extensions() {
        Modulo modulo = buildModulo();
        when(moduloRepository.findById(1L)).thenReturn(Optional.of(modulo));

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "virus.exe",
                "application/x-msdownload",
                new byte[] {1, 2, 3}
        );

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> materialService.crearMaterial(1L, "Manual", archivo));

        assertTrue(exception.getMessage().contains("Tipo de archivo") || exception.getMessage().contains("ejecutables"));
        verify(materialRepository, never()).save(any());
    }

    @Test
    void crearMaterial_should_reject_files_larger_than_100mb() {
        Modulo modulo = buildModulo();
        when(moduloRepository.findById(1L)).thenReturn(Optional.of(modulo));

        byte[] oversized = new byte[100 * 1024 * 1024 + 1];
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "manual.pdf",
                "application/pdf",
                oversized
        );

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> materialService.crearMaterial(1L, "Manual", archivo));

        assertEquals("El tamaño del archivo no puede superar los 100MB", exception.getMessage());
        verify(materialRepository, never()).save(any());
    }

    @Test
    void descargarMaterialBytes_should_deny_student_without_enrollment() {
        Usuario alumno = buildUsuario("ALUMNO");
        Usuario admin = buildUsuario("ADMINISTRADOR");
        Curso curso = Curso.builder().id(20L).nombre("Curso QA").estado(true).build();
        Modulo modulo = Modulo.builder().id(15L).curso(curso).nombre("Modulo QA").orden(1).estado(true).build();
        Material material = Material.builder()
                .id(9L)
                .modulo(modulo)
                .nombre("Guia")
                .archivoUrl("http://localhost:8081/api/materiales/9/download")
                .archivoInterno("internal-material.pdf")
                .tipoArchivo("application/pdf")
                .pesoBytes(128L)
                .estado(true)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(alumno.getCorreo(), "token", Collections.emptyList()));
        when(usuarioRepository.findByCorreo(alumno.getCorreo())).thenReturn(Optional.of(alumno));
        when(materialRepository.findById(9L)).thenReturn(Optional.of(material));

        ForbiddenException exception = assertThrows(ForbiddenException.class,
                () -> materialService.descargarMaterialBytes(9L));

        assertTrue(exception.getMessage().contains("No tiene permisos"));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin.getCorreo(), "token", Collections.emptyList()));
        when(usuarioRepository.findByCorreo(admin.getCorreo())).thenReturn(Optional.of(admin));
        when(materialRepository.findById(9L)).thenReturn(Optional.of(material));
        Path filePath = tempWorkspace.resolve("uploads").resolve("materiales").resolve("internal-material.pdf");
        try {
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, "contenido".getBytes());
            byte[] bytes = materialService.descargarMaterialBytes(9L);
            assertArrayEquals("contenido".getBytes(), bytes);
        } catch (IOException e) {
            fail(e);
        }
    }

    private Usuario buildUsuario(String rolNombre) {
        Rol rol = Rol.builder().id(1L).nombre(rolNombre).estado(true).build();
        return Usuario.builder()
                .id(7L)
                .correo(rolNombre.toLowerCase() + "@insteip.com")
                .nombres("Test")
                .apellidos("User")
                .passwordHash("hash")
                .rol(rol)
                .estado(true)
                .intentosFallidos(0)
                .bloqueadoHasta(null)
                .fechaRegistro(LocalDateTime.now())
                .build();
    }

    private Modulo buildModulo() {
        Curso curso = Curso.builder().id(20L).nombre("Curso QA").estado(true).build();
        return Modulo.builder()
                .id(15L)
                .curso(curso)
                .nombre("Modulo QA")
                .descripcion("descripcion")
                .orden(1)
                .estado(true)
                .build();
    }
}
