package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Mensaje;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    List<Mensaje> findByConversacionIdOrderByFechaEnvioAsc(Long conversacionId);

    // Conteo de mensajes no leídos para el usuario destinatario
    long countByDestinatarioIdAndLeidoFalse(Long destinatarioId);

    // Conteo total de no leídos en una conversación específica
    long countByConversacionIdAndDestinatarioIdAndLeidoFalse(Long conversacionId, Long destinatarioId);

    // Bandeja de Recibidos
    @Query("SELECT m FROM Mensaje m WHERE m.destinatario.id = :usuarioId ORDER BY m.fechaEnvio DESC")
    Page<Mensaje> findBandejaRecibidos(@Param("usuarioId") Long usuarioId, Pageable pageable);

    // Bandeja de Enviados
    @Query("SELECT m FROM Mensaje m WHERE m.remitente.id = :usuarioId ORDER BY m.fechaEnvio DESC")
    Page<Mensaje> findBandejaEnviados(@Param("usuarioId") Long usuarioId, Pageable pageable);

    // Bandeja de No Leídos
    @Query("SELECT m FROM Mensaje m WHERE m.destinatario.id = :usuarioId AND m.leido = false ORDER BY m.fechaEnvio DESC")
    Page<Mensaje> findBandejaNoLeidos(@Param("usuarioId") Long usuarioId, Pageable pageable);

    // Bandeja de Destacados
    @Query("SELECT m FROM Mensaje m WHERE (m.destinatario.id = :usuarioId AND m.destacadoDestinatario = true) " +
           "OR (m.remitente.id = :usuarioId AND m.destacadoRemitente = true) ORDER BY m.fechaEnvio DESC")
    Page<Mensaje> findBandejaDestacados(@Param("usuarioId") Long usuarioId, Pageable pageable);

    // Contadores para resumen de buzón
    long countByDestinatarioId(Long destinatarioId);
    long countByRemitenteId(Long remitenteId);

    @Query("SELECT COUNT(m) FROM Mensaje m WHERE (m.destinatario.id = :usuarioId AND m.destacadoDestinatario = true) " +
           "OR (m.remitente.id = :usuarioId AND m.destacadoRemitente = true)")
    long countDestacadosByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Marcar todos los mensajes de una conversación como leídos para el destinatario
    @Modifying
    @Query("UPDATE Mensaje m SET m.leido = true, m.fechaLeido = CURRENT_TIMESTAMP " +
           "WHERE m.conversacion.id = :conversacionId AND m.destinatario.id = :usuarioId AND m.leido = false")
    int marcarComoLeidosEnConversacion(@Param("conversacionId") Long conversacionId, @Param("usuarioId") Long usuarioId);
}
