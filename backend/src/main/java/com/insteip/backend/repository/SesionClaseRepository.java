package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.SesionClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SesionClaseRepository extends JpaRepository<SesionClase, Long> {
    List<SesionClase> findByCursoIdAndSeccionGradoIdOrderByFechaDesc(Long cursoId, Long seccionGradoId);
    List<SesionClase> findByDocenteIdAndFecha(Long docenteId, LocalDate fecha);
    Optional<SesionClase> findByQrSesionToken(String qrSesionToken);
}
