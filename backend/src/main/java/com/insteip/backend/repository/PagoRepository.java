package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PagoRepository extends JpaRepository<Pago, Long> {

    java.util.List<Pago> findByAprobadoFalse();
    java.util.List<Pago> findByUsuarioId(Long usuarioId);
}
