package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.usuario.UsuarioRequestDTO;
import com.insteip.backend.domain.dto.docente.DocenteRequestDTO;
import com.insteip.backend.domain.dto.usuario.UsuarioResponseDTO;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.entity.Rol;
import com.insteip.backend.domain.entity.NivelSuscripcion;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.RolRepository;
import com.insteip.backend.repository.NivelSuscripcionRepository;
import com.insteip.backend.service.interfaces.UsuarioService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    private final RolRepository rolRepository;

    private final NivelSuscripcionRepository suscripcionRepository;

    private final PasswordEncoder passwordEncoder;

    private final com.insteip.backend.repository.CertificadoRepository certificadoRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UsuarioResponseDTO> listarAlumnos(org.springframework.data.domain.Pageable pageable, String search, boolean includeInactive) {
        org.springframework.data.domain.Page<Usuario> usuariosPage;
        if (search != null && !search.trim().isEmpty()) {
            usuariosPage = usuarioRepository.findAlumnosPagedAndSearched(search.trim(), includeInactive, pageable);
        } else {
            usuariosPage = includeInactive
                    ? usuarioRepository.findByRolNombre("ALUMNO", pageable)
                    : usuarioRepository.findAlumnosPagedAndSearched("", false, pageable);
        }
        return usuariosPage.map(this::convertToResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UsuarioResponseDTO> listarDocentes(org.springframework.data.domain.Pageable pageable, String search) {
        org.springframework.data.domain.Page<Usuario> docentesPage;
        if (search != null && !search.trim().isEmpty()) {
            docentesPage = usuarioRepository.findDocentesPagedAndSearched(search.trim(), pageable);
        } else {
            docentesPage = usuarioRepository.findByRolNombre("DOCENTE", pageable);
        }
        return docentesPage.map(this::convertToResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerDocente(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con id: " + id));
        if (!"DOCENTE".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Docente");
        }
        return convertToResponseDto(usuario);
    }

    @Override
    public UsuarioResponseDTO obtenerAlumno(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado con id: " + id));
        if (!"ALUMNO".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Alumno");
        }
        return convertToResponseDto(usuario);
    }

    @Override
    public UsuarioResponseDTO crearAlumno(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByCorreo(dto.correo())) {
            throw new BadRequestException("El correo ya está registrado");
        }

        Rol rol = rolRepository.findByNombre("ALUMNO")
                .orElseThrow(() -> new ResourceNotFoundException("Rol ALUMNO no encontrado"));
                
        NivelSuscripcion sub = null;
        if (dto.nivelSuscripcionId() != null) {
            sub = suscripcionRepository.findById(dto.nivelSuscripcionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de suscripción no encontrado"));
        }

        Usuario usuario = Usuario.builder()
                .nombres(dto.nombres())
                .apellidos(dto.apellidos())
                .correo(dto.correo())
                .passwordHash(passwordEncoder.encode(requirePassword(dto.password())))
                .passwordPlain(dto.password())
                .telefono(dto.telefono())
                .rol(rol)
                .nivelSuscripcion(sub)
                .estado(true)
                .build();

        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("ALUMNOS", "CREAR", "Creado alumno: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public UsuarioResponseDTO crearDocente(DocenteRequestDTO dto) {
        if (usuarioRepository.existsByCorreo(dto.correo())) {
            throw new BadRequestException("El correo ya está registrado");
        }

        Rol rol = rolRepository.findByNombre("DOCENTE")
                .orElseThrow(() -> new ResourceNotFoundException("Rol DOCENTE no encontrado"));

        Usuario usuario = Usuario.builder()
                .nombres(dto.nombres())
                .apellidos(dto.apellidos())
                .correo(dto.correo())
                .passwordHash(passwordEncoder.encode(requirePassword(dto.password())))
                .passwordPlain(dto.password())
                .telefono(dto.telefono())
                .rol(rol)
                .nivelSuscripcion(null)
                .estado(true)
                .build();

        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("DOCENTES", "CREAR", "Creado docente: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public UsuarioResponseDTO editarAlumno(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (!"ALUMNO".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Alumno y no puede ser editado");
        }

        if (!usuario.getCorreo().equalsIgnoreCase(dto.correo()) && usuarioRepository.existsByCorreo(dto.correo())) {
            throw new BadRequestException("El correo ya está registrado por otro usuario");
        }

        usuario.setNombres(dto.nombres());
        usuario.setApellidos(dto.apellidos());
        usuario.setCorreo(dto.correo());
        usuario.setTelefono(dto.telefono());

        if (dto.password() != null && !dto.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(requirePassword(dto.password())));
            usuario.setPasswordPlain(dto.password());
        }

        if (dto.nivelSuscripcionId() != null) {
            NivelSuscripcion sub = suscripcionRepository.findById(dto.nivelSuscripcionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de suscripción no encontrado"));
            usuario.setNivelSuscripcion(sub);
        } else {
            usuario.setNivelSuscripcion(null);
        }

        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("ALUMNOS", "EDITAR", "Editado alumno: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public UsuarioResponseDTO editarDocente(Long id, DocenteRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (!"DOCENTE".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Docente y no puede ser editado");
        }

        if (!usuario.getCorreo().equalsIgnoreCase(dto.correo()) && usuarioRepository.existsByCorreo(dto.correo())) {
            throw new BadRequestException("El correo ya está registrado por otro usuario");
        }

        usuario.setNombres(dto.nombres());
        usuario.setApellidos(dto.apellidos());
        usuario.setCorreo(dto.correo());
        usuario.setTelefono(dto.telefono());

        if (dto.password() != null && !dto.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(requirePassword(dto.password())));
            usuario.setPasswordPlain(dto.password());
        }

        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("DOCENTES", "EDITAR", "Editado docente: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        usuario.setEstado(estado);
        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("ALUMNOS", estado ? "ACTIVAR" : "DESACTIVAR", 
                (estado ? "Activado" : "Desactivado") + " alumno: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
    }

    @Override
    public void cambiarEstadoDocente(Long id, Boolean estado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        if (!"DOCENTE".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Docente");
        }
        usuario.setEstado(estado);
        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("DOCENTES", estado ? "ACTIVAR" : "DESACTIVAR",
                (estado ? "Activado" : "Desactivado") + " docente: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
    }

    @Override
    @Transactional
    public void eliminarAlumno(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado con id: " + id));
        if (!"ALUMNO".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Alumno");
        }
        String nombreAlumno = usuario.getNombres() + " " + usuario.getApellidos();
        // Eliminar certificados primero (tienen ON DELETE RESTRICT)
        certificadoRepository.eliminarPorUsuarioId(id);
        usuarioRepository.deleteById(id);
        auditoriaService.registrarEvento("ALUMNOS", "ELIMINAR", "Eliminado alumno: " + nombreAlumno + " (ID: " + id + ")");
    }

    @Override
    @Transactional
    public void eliminarDocente(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado con id: " + id));
        if (!"DOCENTE".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Docente");
        }
        String nombreDocente = usuario.getNombres() + " " + usuario.getApellidos();
        // Eliminar certificados primero (tienen ON DELETE RESTRICT)
        certificadoRepository.eliminarPorUsuarioId(id);
        usuarioRepository.deleteById(id);
        auditoriaService.registrarEvento("DOCENTES", "ELIMINAR", "Eliminado docente: " + nombreDocente + " (ID: " + id + ")");
    }

    private String requirePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new BadRequestException("La contraseña es obligatoria");
        }
        if (password.length() < 8) {
            throw new BadRequestException("La contraseña debe tener al menos 8 caracteres");
        }
        return password;
    }

    private UsuarioResponseDTO convertToResponseDto(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNombres(),
                u.getApellidos(),
                u.getCorreo(),
                u.getTelefono(),
                u.getNivelSuscripcion() != null ? u.getNivelSuscripcion().getNombre() : "NINGUNO",
                u.getEstado(),
                u.getFechaRegistro(),
                u.getPasswordPlain()
        );
    }
}
