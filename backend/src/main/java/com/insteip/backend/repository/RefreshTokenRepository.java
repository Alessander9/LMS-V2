package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.RefreshToken;
import com.insteip.backend.domain.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUsuario(Usuario usuario);
}
