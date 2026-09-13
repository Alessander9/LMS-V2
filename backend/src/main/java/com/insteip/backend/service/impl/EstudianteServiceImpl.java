package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.academico.EstudianteDtos.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.EstudianteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstudianteServiceImpl implements EstudianteService {

    private final EstudiantePerfilRepository estudianteRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SeccionGradoRepository seccionGradoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final MatriculaAcademicaRepository matriculaAcademicaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EstudianteResponse registrarEstudiante(RegistroEstudianteRequest request) {
        if (request.getDni() == null || request.getDni().trim().isEmpty()) {
            throw new BadRequestException("El DNI del estudiante es obligatorio.");
        }
        if (estudianteRepository.findByDni(request.getDni().trim()).isPresent()) {
            throw new BadRequestException("Ya existe un estudiante registrado con el DNI: " + request.getDni());
        }

        String correo = request.getCorreo() != null && !request.getCorreo().trim().isEmpty()
                ? request.getCorreo().trim()
                : "est_" + request.getDni().trim() + "@plataformalms.com";

        if (usuarioRepository.findByCorreo(correo).isPresent()) {
            throw new BadRequestException("Ya existe un usuario con el correo: " + correo);
        }

        Rol rolAlumno = rolRepository.findByNombre("ALUMNO")
                .or(() -> rolRepository.findByNombre("ROLE_ALUMNO"))
                .orElseGet(() -> rolRepository.findAll().stream().filter(r -> r.getNombre().toUpperCase().contains("ALUMNO")).findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Rol de ALUMNO no encontrado en el sistema.")));

        String rawPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty()
                ? request.getPassword().trim()
                : request.getDni().trim();

        Usuario usuario = Usuario.builder()
                .nombres(request.getNombres().trim())
                .apellidos(request.getApellidos().trim())
                .correo(correo)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .telefono(request.getTelefono())
                .rol(rolAlumno)
                .estado(true)
                .build();
        usuario = usuarioRepository.save(usuario);

        String codigoEstudiante = "EST-" + LocalDateTime.now().getYear() + "-" + String.format("%05d", usuario.getId());
        String qrToken = "QR_STU_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        EstudiantePerfil perfil = EstudiantePerfil.builder()
                .usuario(usuario)
                .codigoEstudiante(codigoEstudiante)
                .dni(request.getDni().trim())
                .fechaNacimiento(request.getFechaNacimiento())
                .genero(request.getGenero())
                .direccion(request.getDireccion())
                .nombreApoderado(request.getNombreApoderado())
                .telefonoApoderado(request.getTelefonoApoderado())
                .parentescoApoderado(request.getParentescoApoderado())
                .qrToken(qrToken)
                .build();
        perfil = estudianteRepository.save(perfil);

        // Si se especificó sección y periodo, crear matrícula automática
        if (request.getSeccionGradoId() != null && request.getPeriodoAcademicoId() != null) {
            SeccionGrado seccion = seccionGradoRepository.findById(request.getSeccionGradoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sección/Grado no encontrada."));
            PeriodoAcademico periodo = periodoAcademicoRepository.findById(request.getPeriodoAcademicoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Periodo Académico no encontrado."));

            MatriculaAcademica matricula = MatriculaAcademica.builder()
                    .estudiante(perfil)
                    .seccionGrado(seccion)
                    .periodoAcademico(periodo)
                    .estado("ACTIVA")
                    .observaciones("Matrícula inicial al registrar estudiante")
                    .build();
            matriculaAcademicaRepository.save(matricula);
        }

        return mapearEstudianteResponse(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public EstudianteResponse obtenerPorId(Long id) {
        EstudiantePerfil perfil = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + id));
        return mapearEstudianteResponse(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public EstudianteResponse obtenerPorDni(String dni) {
        EstudiantePerfil perfil = estudianteRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con DNI: " + dni));
        return mapearEstudianteResponse(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public EstudianteResponse obtenerPorCodigo(String codigo) {
        EstudiantePerfil perfil = estudianteRepository.findByCodigoEstudiante(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con Código: " + codigo));
        return mapearEstudianteResponse(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public EstudianteResponse obtenerPorUsuarioId(Long usuarioId) {
        EstudiantePerfil perfil = estudianteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado para usuario ID: " + usuarioId));
        return mapearEstudianteResponse(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public CarnetEstudianteQrResponse obtenerCarnetQr(Long estudianteId) {
        EstudiantePerfil perfil = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + estudianteId));

        String gradoSeccion = "Sin Asignar";
        String nivel = "GENERAL";

        List<MatriculaAcademica> matriculas = matriculaAcademicaRepository.findByEstudianteId(estudianteId);
        if (!matriculas.isEmpty()) {
            MatriculaAcademica m = matriculas.get(0);
            gradoSeccion = m.getSeccionGrado().getGradoOCiclo() + " - Sec. " + m.getSeccionGrado().getSeccion();
            nivel = m.getSeccionGrado().getNivel();
        }

        return CarnetEstudianteQrResponse.builder()
                .estudianteId(perfil.getId())
                .codigoEstudiante(perfil.getCodigoEstudiante())
                .nombresCompletos(perfil.getUsuario().getNombres() + " " + perfil.getUsuario().getApellidos())
                .dni(perfil.getDni())
                .gradoOSeccion(gradoSeccion)
                .nivel(nivel)
                .qrToken(perfil.getQrToken())
                .fechaEmision(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstudianteResponse> listarEstudiantes(String query) {
        List<EstudiantePerfil> lista;
        if (query != null && !query.trim().isEmpty()) {
            lista = estudianteRepository.buscarEstudiantes(query.trim());
        } else {
            lista = estudianteRepository.findAll();
        }
        return lista.stream().map(this::mapearEstudianteResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstudianteResponse> listarPorSeccion(Long seccionId, Long periodoId) {
        return matriculaAcademicaRepository.listarMatriculadosActivos(seccionId, periodoId)
                .stream()
                .map(m -> mapearEstudianteResponse(m.getEstudiante()))
                .collect(Collectors.toList());
    }

    private EstudianteResponse mapearEstudianteResponse(EstudiantePerfil perfil) {
        String gradoSeccion = "Sin Asignar";
        String nivel = "GENERAL";

        List<MatriculaAcademica> matriculas = matriculaAcademicaRepository.findByEstudianteId(perfil.getId());
        if (!matriculas.isEmpty()) {
            MatriculaAcademica m = matriculas.get(0);
            gradoSeccion = m.getSeccionGrado().getGradoOCiclo() + " - " + m.getSeccionGrado().getSeccion();
            nivel = m.getSeccionGrado().getNivel();
        }

        return EstudianteResponse.builder()
                .id(perfil.getId())
                .usuarioId(perfil.getUsuario().getId())
                .codigoEstudiante(perfil.getCodigoEstudiante())
                .nombres(perfil.getUsuario().getNombres())
                .apellidos(perfil.getUsuario().getApellidos())
                .correo(perfil.getUsuario().getCorreo())
                .telefono(perfil.getUsuario().getTelefono())
                .dni(perfil.getDni())
                .fechaNacimiento(perfil.getFechaNacimiento())
                .genero(perfil.getGenero())
                .direccion(perfil.getDireccion())
                .nombreApoderado(perfil.getNombreApoderado())
                .telefonoApoderado(perfil.getTelefonoApoderado())
                .parentescoApoderado(perfil.getParentescoApoderado())
                .qrToken(perfil.getQrToken())
                .gradoOSeccionActual(gradoSeccion)
                .nivelActual(nivel)
                .estadoUsuario(perfil.getUsuario().getEstado())
                .build();
    }
}
