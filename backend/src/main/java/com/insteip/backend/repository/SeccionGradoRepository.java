package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.SeccionGrado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeccionGradoRepository extends JpaRepository<SeccionGrado, Long> {
    List<SeccionGrado> findByActivoTrue();
    List<SeccionGrado> findByNivelAndActivoTrue(String nivel);
    List<SeccionGrado> findByTutorDocenteId(Long docenteId);
}
