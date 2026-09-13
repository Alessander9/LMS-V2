package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.EvaluacionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluacionConfigRepository extends JpaRepository<EvaluacionConfig, Long> {
    List<EvaluacionConfig> findByCursoIdAndPeriodoAcademicoIdAndActivoTrueOrderByOrdenAsc(Long cursoId, Long periodoAcademicoId);
    List<EvaluacionConfig> findByCursoIdAndActivoTrueOrderByOrdenAsc(Long cursoId);
}
