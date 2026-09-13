package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.Certificado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CertificadoRepository extends JpaRepository<Certificado, Long> {

    java.util.Optional<Certificado> findByCodigo(String codigo);
    java.util.Optional<Certificado> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<Certificado> findByUsuarioId(Long usuarioId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Certificado c WHERE c.curso.id = :cursoId")
    void eliminarPorCursoId(@org.springframework.data.repository.query.Param("cursoId") Long cursoId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Certificado c WHERE c.usuario.id = :usuarioId")
    void eliminarPorUsuarioId(@org.springframework.data.repository.query.Param("usuarioId") Long usuarioId);

    @org.springframework.data.jpa.repository.Query(
            value = "SELECT c FROM Certificado c WHERE " +
                    ":search IS NULL OR :search = '' OR " +
                    "LOWER(c.codigo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(c.usuario.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(c.usuario.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(c.curso.nombre) LIKE LOWER(CONCAT('%', :search, '%'))",
            countQuery = "SELECT COUNT(c) FROM Certificado c WHERE " +
                    ":search IS NULL OR :search = '' OR " +
                    "LOWER(c.codigo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(c.usuario.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(c.usuario.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(c.curso.nombre) LIKE LOWER(CONCAT('%', :search, '%'))"
    )
    Page<Certificado> searchCertificadosPaged(@org.springframework.data.repository.query.Param("search") String search, Pageable pageable);
}
