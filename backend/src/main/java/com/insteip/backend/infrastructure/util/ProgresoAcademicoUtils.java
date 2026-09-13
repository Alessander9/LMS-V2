package com.insteip.backend.infrastructure.util;

import com.insteip.backend.domain.entity.AvanceVideo;
import com.insteip.backend.domain.entity.Video;

public final class ProgresoAcademicoUtils {

    private ProgresoAcademicoUtils() {}

    public static int resolveDuracionVideo(Video video) {
        if (video == null || video.getDuracionSegundos() == null || video.getDuracionSegundos() <= 0) {
            return 600;
        }
        return video.getDuracionSegundos();
    }

    public static boolean isVideoCompletado(Video video, AvanceVideo avance) {
        if (avance == null) return false;

        int duration = resolveDuracionVideo(video);
        int watched = avance.getUltimoSegundo() != null ? avance.getUltimoSegundo() : 0;
        double percent = avance.getPorcentajeVisto() != null ? avance.getPorcentajeVisto().doubleValue() : 0.0;

        return Boolean.TRUE.equals(avance.getCompletado())
                || watched >= Math.max(duration - 1, 1)
                || percent >= 99.5;
    }
}
