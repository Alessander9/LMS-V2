package com.insteip.backend.controller;

import com.insteip.backend.domain.entity.Certificado;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Matricula;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.repository.CertificadoRepository;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AuditoriaService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ReportesController {

    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;
    private final CertificadoRepository certificadoRepository;
    private final CursoRepository cursoRepository;
    private final AuditoriaService auditoriaService;

    @GetMapping("/alumnos")
    public void exportarAlumnos(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"alumnos.csv\"");

        PrintWriter writer = response.getWriter();
        // BOM para compatibilidad con Excel (UTF-8)
        writer.write('\ufeff');
        writer.println("ID,Nombres,Apellidos,Correo,Suscripción,Estado,Fecha Registro");

        List<Usuario> alumnos = usuarioRepository.findByRolNombre("ALUMNO");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Usuario u : alumnos) {
            String suscripcion = u.getNivelSuscripcion() != null ? u.getNivelSuscripcion().getNombre() : "NINGUNA";
            String fechaReg = u.getFechaRegistro() != null ? u.getFechaRegistro().format(formatter) : "";
            writer.println(String.format("%d,%s,%s,%s,%s,%s,%s",
                    u.getId(),
                    escapeCsv(u.getNombres()),
                    escapeCsv(u.getApellidos()),
                    escapeCsv(u.getCorreo()),
                    escapeCsv(suscripcion),
                    u.getEstado() ? "ACTIVO" : "INACTIVO",
                    fechaReg
            ));
        }
        writer.flush();
        auditoriaService.registrarEvento("REPORTES", "EXPORTAR_ALUMNOS", "Exportado listado de alumnos a CSV");
    }

    @GetMapping("/matriculas")
    public void exportarMatriculas(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"matriculas.csv\"");

        PrintWriter writer = response.getWriter();
        writer.write('\ufeff');
        writer.println("Alumno,Curso,Fecha Matrícula,Fecha Expiración,Estado");

        List<Matricula> matriculas = matriculaRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Matricula m : matriculas) {
            String alumno = m.getUsuario().getNombres() + " " + m.getUsuario().getApellidos();
            String curso = m.getCurso().getNombre();
            String fechaMat = m.getFechaMatricula() != null ? m.getFechaMatricula().format(formatter) : "";
            String fechaExp = m.getFechaExpiracion() != null ? m.getFechaExpiracion().format(formatter) : "";
            writer.println(String.format("%s,%s,%s,%s,%s",
                    escapeCsv(alumno),
                    escapeCsv(curso),
                    fechaMat,
                    fechaExp,
                    m.getEstado() ? "ACTIVO" : "INACTIVO"
            ));
        }
        writer.flush();
        auditoriaService.registrarEvento("REPORTES", "EXPORTAR_MATRICULAS", "Exportado listado de matrículas a CSV");
    }

    @GetMapping("/cursos")
    public void exportarCursos(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cursos.csv\"");

        PrintWriter writer = response.getWriter();
        writer.write('\ufeff');
        writer.println("ID,Nombre,Descripción,Estado,Fecha Creación");

        List<Curso> cursos = cursoRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Curso c : cursos) {
            String fechaCreacion = c.getFechaCreacion() != null ? c.getFechaCreacion().format(formatter) : "";
            writer.println(String.format("%d,%s,%s,%s,%s",
                    c.getId(),
                    escapeCsv(c.getNombre()),
                    escapeCsv(c.getDescripcion()),
                    c.getEstado() ? "ACTIVO" : "INACTIVO",
                    fechaCreacion
            ));
        }
        writer.flush();
        auditoriaService.registrarEvento("REPORTES", "EXPORTAR_CURSOS", "Exportado listado de cursos a CSV");
    }

    @GetMapping("/certificados")
    public void exportarCertificados(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificados.csv\"");

        PrintWriter writer = response.getWriter();
        writer.write('\ufeff');
        writer.println("Alumno,Curso,Código,Fecha Emisión");

        List<Certificado> certificados = certificadoRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Certificado c : certificados) {
            String alumno = c.getUsuario().getNombres() + " " + c.getUsuario().getApellidos();
            String curso = c.getCurso().getNombre();
            String fechaEmision = c.getFechaEmision() != null ? c.getFechaEmision().format(formatter) : "";
            writer.println(String.format("%s,%s,%s,%s",
                    escapeCsv(alumno),
                    escapeCsv(curso),
                    escapeCsv(c.getCodigo()),
                    fechaEmision
            ));
        }
        writer.flush();
        auditoriaService.registrarEvento("REPORTES", "EXPORTAR_CERTIFICADOS", "Exportado listado de certificados a CSV");
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
