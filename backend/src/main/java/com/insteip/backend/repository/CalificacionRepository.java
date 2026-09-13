package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByMatriculaAcademicaId(Long matriculaAcademicaId);
    Optional<Calificacion> findByMatriculaAcademicaIdAndEvaluacionId(Long matriculaAcademicaId, Long evaluacionId);
    List<Calificacion> findByEvaluacionId(Long evaluacionId);

    @Query("SELECT c FROM Calificacion c JOIN FETCH c.evaluacion e " +
           "WHERE c.matriculaAcademica.id = :matriculaId ORDER BY e.orden ASC")
    List<Calificacion> listarCalificacionesPorMatricula(@Param("matriculaId") Long matriculaId);
}
