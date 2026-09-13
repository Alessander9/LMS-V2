package com.insteip.backend.domain.dto.matricula;

import java.time.LocalDateTime;

public record MatriculaResponseDTO(
    Long id,
    Long usuarioId,
    String alumnoNombres,
    String alumnoApellidos,
    String alumnoCorreo,
    String alumnoTelefono,
    Long cursoId,
    String cursoNombre,
    String docenteNombre,
    LocalDateTime fechaMatricula,
    LocalDateTime fechaExpiracion,
    Long diasRestantes,
    String alertaExpiracion, // "OK", "PROXIMO_30_DIAS", "URGENTE_7_DIAS", "EXPIRADO"
    Boolean estado
) {
    // Backward-compatible constructor for existing tests
    public MatriculaResponseDTO(
        Long id,
        Long usuarioId,
        String alumnoNombres,
        String alumnoApellidos,
        String alumnoCorreo,
        Long cursoId,
        String cursoNombre,
        LocalDateTime fechaMatricula,
        LocalDateTime fechaExpiracion,
        Boolean estado
    ) {
        this(
            id,
            usuarioId,
            alumnoNombres,
            alumnoApellidos,
            alumnoCorreo,
            null,
            cursoId,
            cursoNombre,
            null,
            fechaMatricula,
            fechaExpiracion,
            365L,
            "OK",
            estado
        );
    }
}
