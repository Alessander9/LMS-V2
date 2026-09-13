package com.insteip.backend.domain.dto.academico;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class MatriculaAcademicaDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatriculaRequest {
        private Long estudianteId;
        private Long seccionGradoId;
        private Long periodoAcademicoId;
        private String observaciones;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatriculaResponse {
        private Long id;
        private Long estudianteId;
        private String codigoEstudiante;
        private String estudianteNombres;
        private String estudianteApellidos;
        private String dni;
        private Long seccionGradoId;
        private String gradoOCiclo;
        private String seccion;
        private String nivel;
        private Long periodoAcademicoId;
        private String periodoNombre;
        private String estado;
        private LocalDateTime fechaMatricula;
        private String observaciones;
    }
}
