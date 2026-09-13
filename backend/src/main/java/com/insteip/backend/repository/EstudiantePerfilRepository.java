package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.EstudiantePerfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstudiantePerfilRepository extends JpaRepository<EstudiantePerfil, Long> {
    Optional<EstudiantePerfil> findByUsuarioId(Long usuarioId);
    Optional<EstudiantePerfil> findByCodigoEstudiante(String codigoEstudiante);
    Optional<EstudiantePerfil> findByDni(String dni);
    Optional<EstudiantePerfil> findByQrToken(String qrToken);

    @Query("SELECT e FROM EstudiantePerfil e JOIN e.usuario u " +
           "WHERE LOWER(u.nombres) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR e.dni LIKE CONCAT('%', :query, '%') " +
           "OR e.codigoEstudiante LIKE CONCAT('%', :query, '%')")
    List<EstudiantePerfil> buscarEstudiantes(@Param("query") String query);
}
