package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VideoRepository extends JpaRepository<Video, Long> {

    java.util.List<Video> findByModuloIdOrderByOrdenAsc(Long moduloId);

    @org.springframework.data.jpa.repository.Query("""
            SELECT v FROM Video v
            WHERE v.modulo.id = :moduloId
              AND (
                  :search IS NULL OR :search = '' OR
                  LOWER(v.titulo) LIKE LOWER(CONCAT('%', :search, '%')) OR
                  LOWER(v.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY v.orden ASC
            """)
    Page<Video> searchByModuloId(
            @org.springframework.data.repository.query.Param("moduloId") Long moduloId,
            @org.springframework.data.repository.query.Param("search") String search,
            Pageable pageable);
}
