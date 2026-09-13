package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.MatriculaModuloAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaModuloAccesoRepository extends JpaRepository<MatriculaModuloAcceso, Long> {

    List<MatriculaModuloAcceso> findByMatriculaId(Long matriculaId);

    Optional<MatriculaModuloAcceso> findByMatriculaIdAndModuloId(Long matriculaId, Long moduloId);

    boolean existsByMatriculaId(Long matriculaId);

    boolean existsByMatriculaIdAndModuloIdAndHabilitadoTrue(Long matriculaId, Long moduloId);

    void deleteByMatriculaId(Long matriculaId);
}
