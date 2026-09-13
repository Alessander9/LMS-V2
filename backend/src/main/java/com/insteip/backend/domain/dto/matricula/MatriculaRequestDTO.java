package com.insteip.backend.domain.dto.matricula;

import java.util.List;

public record MatriculaRequestDTO(
    Long usuarioId,
    Long cursoId,
    Boolean accesoTotal,
    List<Long> modulosHabilitadosIds
) {
    public MatriculaRequestDTO(Long usuarioId, Long cursoId) {
        this(usuarioId, cursoId, true, null);
    }
}
