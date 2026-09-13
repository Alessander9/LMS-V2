package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.avance.AvanceProgressRequest;
import com.insteip.backend.domain.dto.avance.AvanceProgressResponse;

public interface AvanceService {
    AvanceProgressResponse guardarProgreso(Long usuarioId, AvanceProgressRequest request);
    AvanceProgressResponse obtenerProgreso(Long usuarioId, Long videoId);
}
