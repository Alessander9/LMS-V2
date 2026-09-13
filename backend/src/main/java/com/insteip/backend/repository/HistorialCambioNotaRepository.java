package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.HistorialCambioNota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialCambioNotaRepository extends JpaRepository<HistorialCambioNota, Long> {
    List<HistorialCambioNota> findByCalificacionIdOrderByFechaModificacionDesc(Long calificacionId);

    @Query("SELECT h FROM HistorialCambioNota h JOIN FETCH h.modificadoPor u " +
           "WHERE h.calificacion.id = :calificacionId ORDER BY h.fechaModificacion DESC")
    List<HistorialCambioNota> listarHistorialPorCalificacion(@Param("calificacionId") Long calificacionId);
}
