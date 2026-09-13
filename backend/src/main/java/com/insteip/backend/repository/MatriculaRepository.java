package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    java.util.Optional<Matricula> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<Matricula> findByUsuarioId(Long usuarioId);
    java.util.List<Matricula> findByCursoId(Long cursoId);
    java.util.List<Matricula> findByCursoIdAndEstadoTrue(Long cursoId);
    boolean existsByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<Matricula> findByUsuarioIdAndEstadoTrue(Long usuarioId);
    boolean existsByUsuarioIdAndCursoIdAndEstadoTrue(Long usuarioId, Long cursoId);

    /** Encuentra todas las matrículas activas cuya fecha de expiración ya pasó */
    java.util.List<Matricula> findByEstadoTrueAndFechaExpiracionBefore(LocalDateTime fecha);
}

