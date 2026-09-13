package com.insteip.backend.infrastructure.security;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Modulo;
import com.insteip.backend.domain.entity.Video;
import com.insteip.backend.domain.entity.Material;
import com.insteip.backend.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("cursoSecurity")
@RequiredArgsConstructor
public class CursoSecurityService {

    private final UsuarioRepository usuarioRepository;

    private final CursoRepository cursoRepository;

    private final ModuloRepository moduloRepository;

    private final VideoRepository videoRepository;

    private final MaterialRepository materialRepository;

    public boolean canAccessCurso(Long cursoId) {
        if (cursoId == null) return false;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        
        Usuario user = usuarioRepository.findByCorreo(auth.getName()).orElse(null);
        if (user == null) return false;
        
        String rol = user.getRol().getNombre();
        if ("ADMINISTRADOR".equalsIgnoreCase(rol)) return true;
        if (!"DOCENTE".equalsIgnoreCase(rol)) return false;
        
        Curso curso = cursoRepository.findById(cursoId).orElse(null);
        return curso != null && curso.getDocente() != null && curso.getDocente().getId().equals(user.getId());
    }

    public boolean canAccessModulo(Long moduloId) {
        if (moduloId == null) return false;
        Modulo modulo = moduloRepository.findById(moduloId).orElse(null);
        if (modulo == null) return false;
        return canAccessCurso(modulo.getCurso().getId());
    }

    public boolean canAccessVideo(Long videoId) {
        if (videoId == null) return false;
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) return false;
        return canAccessModulo(video.getModulo().getId());
    }

    public boolean canAccessMaterial(Long materialId) {
        if (materialId == null) return false;
        Material material = materialRepository.findById(materialId).orElse(null);
        if (material == null) return false;
        return canAccessModulo(material.getModulo().getId());
    }
}
