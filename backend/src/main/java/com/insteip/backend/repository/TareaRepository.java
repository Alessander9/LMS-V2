package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByModuloIdOrderByFechaCreacionAsc(Long moduloId);

    List<Tarea> findByModuloIdAndEstadoTrueOrderByFechaCreacionAsc(Long moduloId);

    @Query("SELECT t FROM Tarea t WHERE t.modulo.curso.id = :cursoId AND t.estado = true ORDER BY t.modulo.orden ASC, t.fechaCreacion ASC")
    List<Tarea> findByCursoIdAndEstadoTrue(@Param("cursoId") Long cursoId);

    @Query("SELECT t FROM Tarea t WHERE t.modulo.curso.id IN :cursoIds AND t.estado = true ORDER BY t.modulo.curso.id ASC, t.modulo.orden ASC, t.fechaCreacion ASC")
    List<Tarea> findByCursoIdInAndEstadoTrue(@Param("cursoIds") List<Long> cursoIds);
}
