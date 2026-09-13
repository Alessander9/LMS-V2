package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Conversacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {

    @Query("SELECT c FROM Conversacion c WHERE (c.emisor.id = :usuarioId OR c.destinatario.id = :usuarioId) " +
           "ORDER BY c.fechaUltimoMensaje DESC")
    Page<Conversacion> findMisConversaciones(@Param("usuarioId") Long usuarioId, Pageable pageable);

    @Query("SELECT c FROM Conversacion c WHERE (c.emisor.id = :usuarioId OR c.destinatario.id = :usuarioId) " +
           "AND c.curso.id = :cursoId ORDER BY c.fechaUltimoMensaje DESC")
    Page<Conversacion> findMisConversacionesPorCurso(@Param("usuarioId") Long usuarioId, @Param("cursoId") Long cursoId, Pageable pageable);

    @Query("SELECT c FROM Conversacion c WHERE (c.emisor.id = :usuarioId OR c.destinatario.id = :usuarioId) " +
           "ORDER BY c.fechaUltimoMensaje DESC")
    List<Conversacion> findAllMisConversaciones(@Param("usuarioId") Long usuarioId);
}
