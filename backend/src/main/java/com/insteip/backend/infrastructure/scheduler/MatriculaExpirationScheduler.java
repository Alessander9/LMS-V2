package com.insteip.backend.infrastructure.scheduler;

import com.insteip.backend.domain.entity.Matricula;
import com.insteip.backend.repository.MatriculaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tarea programada que se ejecuta diariamente a medianoche para desactivar
 * automáticamente las matrículas cuya fecha de expiración (12 meses después
 * de la inscripción) ya haya pasado.
 *
 * Esto complementa la validación en tiempo real que ocurre cuando el alumno
 * intenta acceder al curso. Ambas capas juntas garantizan que ningún alumno
 * acceda a un curso después de vencida su matrícula.
 */
@Service
@RequiredArgsConstructor
public class MatriculaExpirationScheduler {

    private final MatriculaRepository matriculaRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    /**
     * Se ejecuta todos los días a las 00:05 AM (5 minutos después de medianoche
     * para evitar colisión con el BackupScheduler que corre a las 00:00).
     */
    @Scheduled(cron = "0 5 0 * * ?")
    @Transactional
    public void desactivarMatriculasExpiradas() {
        LocalDateTime ahora = LocalDateTime.now();
        List<Matricula> expiradas = matriculaRepository.findByEstadoTrueAndFechaExpiracionBefore(ahora);

        if (expiradas.isEmpty()) {
            System.out.println("[MatriculaExpiration] Sin matrículas expiradas para procesar.");
            return;
        }

        int count = 0;
        for (Matricula matricula : expiradas) {
            matricula.setEstado(false);
            matriculaRepository.save(matricula);
            count++;

            System.out.println("[MatriculaExpiration] Desactivada matrícula ID: " + matricula.getId()
                    + " | Alumno: " + matricula.getUsuario().getNombres() + " " + matricula.getUsuario().getApellidos()
                    + " | Curso: " + matricula.getCurso().getNombre()
                    + " | Expiró: " + matricula.getFechaExpiracion());
        }

        auditoriaService.registrarEvento("MATRICULAS", "EXPIRACION_AUTOMATICA",
                "Se desactivaron " + count + " matrícula(s) expirada(s) en el proceso nocturno.");

        System.out.println("[MatriculaExpiration] Proceso completado: " + count + " matrículas desactivadas.");
    }
}
