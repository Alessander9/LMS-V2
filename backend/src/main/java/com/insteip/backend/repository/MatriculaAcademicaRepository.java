package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.MatriculaAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaAcademicaRepository extends JpaRepository<MatriculaAcademica, Long> {
    List<MatriculaAcademica> findBySeccionGradoIdAndPeriodoAcademicoId(Long seccionGradoId, Long periodoAcademicoId);
    List<MatriculaAcademica> findByEstudianteId(Long estudianteId);
    Optional<MatriculaAcademica> findByEstudianteIdAndPeriodoAcademicoId(Long estudianteId, Long periodoAcademicoId);

    @Query("SELECT m FROM MatriculaAcademica m JOIN FETCH m.estudiante e JOIN FETCH e.usuario u " +
           "WHERE m.seccionGrado.id = :seccionId AND m.periodoAcademico.id = :periodoId AND m.estado = 'ACTIVA' " +
           "ORDER BY u.apellidos ASC, u.nombres ASC")
    List<MatriculaAcademica> listarMatriculadosActivos(@Param("seccionId") Long seccionId, @Param("periodoId") Long periodoId);
}
