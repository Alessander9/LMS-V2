package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MaterialRepository extends JpaRepository<Material, Long> {

    java.util.List<Material> findByModuloId(Long moduloId);

    @org.springframework.data.jpa.repository.Query("""
            SELECT m FROM Material m
            WHERE m.modulo.id = :moduloId
              AND (
                  :search IS NULL OR :search = '' OR
                  LOWER(m.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Material> searchByModuloId(
            @org.springframework.data.repository.query.Param("moduloId") Long moduloId,
            @org.springframework.data.repository.query.Param("search") String search,
            Pageable pageable);
}
