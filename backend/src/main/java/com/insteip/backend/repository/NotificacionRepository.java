package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Notificacion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioIdOrderByFijadoDescFechaCreacionDesc(Long usuarioId, Pageable pageable);

    long countByUsuarioIdAndLeidoFalse(Long usuarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leido = true WHERE n.usuario.id = :usuarioId AND n.leido = false")
    int marcarTodasComoLeidasPorUsuario(@Param("usuarioId") Long usuarioId);
}
