package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CursoRepository extends JpaRepository<Curso, Long> {

    java.util.List<Curso> findByEstadoTrue();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Curso c WHERE " +
            "(LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Curso> findPagedAndSearched(
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Curso c WHERE c.docente.id = :docenteId AND " +
            "(:search IS NULL OR :search = '' OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Curso> findPagedByDocenteIdAndSearch(
            @org.springframework.data.repository.query.Param("docenteId") Long docenteId,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    java.util.List<Curso> findByDocenteId(Long docenteId);
}
