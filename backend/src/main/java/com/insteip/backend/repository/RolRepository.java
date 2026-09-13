package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RolRepository extends JpaRepository<Rol, Long> {
    java.util.Optional<Rol> findByNombre(String nombre);
}
