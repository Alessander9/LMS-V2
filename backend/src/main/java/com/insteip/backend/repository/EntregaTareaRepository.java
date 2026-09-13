package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.EntregaTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EntregaTareaRepository extends JpaRepository<EntregaTarea, Long> {

    Optional<EntregaTarea> findByTareaIdAndUsuarioId(Long tareaId, Long usuarioId);

    List<EntregaTarea> findByTareaIdOrderByFechaEntregaDesc(Long tareaId);

    List<EntregaTarea> findByUsuarioId(Long usuarioId);

    @Query("SELECT e FROM EntregaTarea e WHERE e.tarea.modulo.curso.id = :cursoId AND e.usuario.id = :usuarioId")
    List<EntregaTarea> findByCursoIdAndUsuarioId(@Param("cursoId") Long cursoId, @Param("usuarioId") Long usuarioId);
}
