package com.insteip.backend.domain.dto.academico;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CalificacionDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvaluacionConfigRequest {
        private Long cursoId;
        private Long periodoAcademicoId;
        private String nombre;
        private String tipoEscala; // LITERAL (AD, A, B, C) o VIGESIMAL (0 a 20)
        private BigDecimal pesoPorcentual;
        private Integer orden;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvaluacionConfigResponse {
        private Long id;
        private Long cursoId;
        private String cursoNombre;
        private Long periodoAcademicoId;
        private String periodoNombre;
        private String nombre;
        private String tipoEscala;
        private BigDecimal pesoPorcentual;
        private Integer orden;
        private Boolean activo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegistroCalificacionRequest {
        private Long matriculaAcademicaId;
        private Long evaluacionId;
        private BigDecimal valorNumerico; // Para Institutos (0 a 20)
        private String valorLiteral;       // Para Colegios (AD, A, B, C)
        private String observacion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModificarCalificacionRequest {
        private BigDecimal nuevoValorNumerico;
        private String nuevoValorLiteral;
        private String motivoJustificacion; // Obligatorio para trazabilidad
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CalificacionItemResponse {
        private Long calificacionId;
        private Long evaluacionId;
        private String evaluacionNombre;
        private String tipoEscala;
        private BigDecimal pesoPorcentual;
        private BigDecimal valorNumerico;
        private String valorLiteral;
        private String docenteNombre;
        private LocalDateTime fechaRegistro;
        private String observacion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HistorialCambioResponse {
        private Long id;
        private Long calificacionId;
        private BigDecimal notaAnteriorNum;
        private String notaAnteriorLit;
        private BigDecimal notaNuevaNum;
        private String notaNuevaLit;
        private String modificadoPorNombre;
        private LocalDateTime fechaModificacion;
        private String motivoJustificacion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BoletaNotasEstudianteResponse {
        private Long estudianteId;
        private String codigoEstudiante;
        private String estudianteNombre;
        private String dni;
        private String nivel;
        private String gradoOSeccion;
        private String periodoNombre;
        private String tipoInstitucion;
        private String tipoEscala; // LITERAL o VIGESIMAL
        private List<CalificacionItemResponse> calificaciones;
        private BigDecimal promedioFinalNumerico; // Para Institutos (0 a 20)
        private String promedioFinalLiteral;      // Para Colegios (AD, A, B, C)
        private String estadoAprobacion;          // APROBADO, EN_PROCESO, DESAPROBADO
        private String conclusionDescriptiva;
    }
}
