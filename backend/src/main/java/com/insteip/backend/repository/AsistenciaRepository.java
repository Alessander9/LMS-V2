package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findBySesionId(Long sesionId);
    Optional<Asistencia> findBySesionIdAndEstudianteId(Long sesionId, Long estudianteId);
    List<Asistencia> findByEstudianteIdOrderByFechaHoraMarcacionDesc(Long estudianteId);

    @Query("SELECT COUNT(a) FROM Asistencia a WHERE a.estudiante.id = :estudianteId AND a.estado = :estado")
    long contarPorEstudianteYEstado(@Param("estudianteId") Long estudianteId, @Param("estado") String estado);

    @Query("SELECT a FROM Asistencia a JOIN FETCH a.estudiante e JOIN FETCH e.usuario u WHERE a.sesion.id = :sesionId ORDER BY u.apellidos ASC")
    List<Asistencia> listarPorSesionConEstudiante(@Param("sesionId") Long sesionId);
}
