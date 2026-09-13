package com.insteip.backend.infrastructure.config;

import com.insteip.backend.repository.AvanceCursoRepository;
import com.insteip.backend.repository.AvanceVideoRepository;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.VideoRepository;
import com.insteip.backend.service.impl.DocenteDashboardServiceImpl;
import com.insteip.backend.service.interfaces.DocenteDashboardService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServiceConfig {

    @Bean
    public DocenteDashboardService docenteDashboardService(
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository,
            MatriculaRepository matriculaRepository,
            AvanceCursoRepository avanceCursoRepository,
            AvanceVideoRepository avanceVideoRepository,
            ModuloRepository moduloRepository,
            VideoRepository videoRepository
    ) {
        return new DocenteDashboardServiceImpl(
                usuarioRepository,
                cursoRepository,
                matriculaRepository,
                avanceCursoRepository,
                avanceVideoRepository,
                moduloRepository,
                videoRepository
        );
    }
}
