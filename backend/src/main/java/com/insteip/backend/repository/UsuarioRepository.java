package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u WHERE LOWER(u.correo) = LOWER(:correo)")
    java.util.Optional<Usuario> findByCorreo(@org.springframework.data.repository.query.Param("correo") String correo);

    java.util.List<Usuario> findByRolNombre(String rolNombre);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE LOWER(u.correo) = LOWER(:correo)")
    boolean existsByCorreo(@org.springframework.data.repository.query.Param("correo") String correo);

    java.util.Optional<Usuario> findByPasswordResetToken(String passwordResetToken);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u WHERE u.rol.nombre = 'ALUMNO' AND " +
            "(:includeInactive = true OR u.estado = true) AND " +
            "(LOWER(u.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.correo) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Usuario> findAlumnosPagedAndSearched(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("includeInactive") boolean includeInactive,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u WHERE u.rol.nombre = 'DOCENTE' AND " +
            "(LOWER(u.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.correo) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Usuario> findDocentesPagedAndSearched(
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Usuario> findByRolNombre(String rolNombre, org.springframework.data.domain.Pageable pageable);

    java.util.List<Usuario> findByRolNombreInAndEstadoTrue(java.util.List<String> rolNombres);

    java.util.List<Usuario> findByEstadoTrue();
}
