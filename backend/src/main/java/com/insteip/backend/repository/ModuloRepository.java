package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ModuloRepository extends JpaRepository<Modulo, Long> {

    java.util.List<Modulo> findByCursoIdOrderByOrdenAsc(Long cursoId);
}
