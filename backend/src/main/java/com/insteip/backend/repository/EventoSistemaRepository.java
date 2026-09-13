package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.EventoSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventoSistemaRepository extends JpaRepository<EventoSistema, Long> {
    List<EventoSistema> findAllByOrderByFechaDesc();
    List<EventoSistema> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
