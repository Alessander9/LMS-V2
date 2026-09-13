package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    List<PeriodoAcademico> findByActivoTrueOrderByFechaInicioDesc();
    Optional<PeriodoAcademico> findFirstByActivoTrueOrderByFechaInicioDesc();
    List<PeriodoAcademico> findByTipoInstitucion(String tipoInstitucion);
}
