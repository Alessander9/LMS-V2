package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.AvanceVideo;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AvanceVideoRepository extends JpaRepository<AvanceVideo, Long> {

    java.util.Optional<AvanceVideo> findByUsuarioIdAndVideoId(Long usuarioId, Long videoId);
    java.util.List<AvanceVideo> findByUsuarioId(Long usuarioId);
}
