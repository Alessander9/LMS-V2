package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.AnuncioModal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AnuncioModalRepository extends JpaRepository<AnuncioModal, Long> {

    List<AnuncioModal> findAllByOrderByFechaCreacionDesc();

    @Query("SELECT a FROM AnuncioModal a WHERE a.activo = true " +
           "AND (a.fechaInicio IS NULL OR a.fechaInicio <= :now) " +
           "AND (a.fechaFin IS NULL OR a.fechaFin >= :now) " +
           "AND (a.audiencia = 'TODOS' OR a.audiencia = :audiencia OR (a.audiencia = 'DOCENTES_Y_ESTUDIANTES' AND :audiencia IN ('SOLO_ESTUDIANTES', 'SOLO_DOCENTES'))) " +
           "ORDER BY a.fechaCreacion DESC")
    List<AnuncioModal> findAnunciosActivosPorAudiencia(@Param("now") LocalDateTime now, @Param("audiencia") String audiencia);
}
