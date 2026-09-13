package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.AvanceCurso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AvanceCursoRepository extends JpaRepository<AvanceCurso, Long> {

    java.util.Optional<AvanceCurso> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<AvanceCurso> findByUsuarioId(Long usuarioId);
    java.util.List<AvanceCurso> findByCursoId(Long cursoId);
}
