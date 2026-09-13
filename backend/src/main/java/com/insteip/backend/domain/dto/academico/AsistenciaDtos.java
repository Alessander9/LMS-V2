package com.insteip.backend.domain.dto.academico;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

public class AsistenciaDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CrearSesionClaseRequest {
        private Long cursoId;
        private Long seccionGradoId;
        private LocalDate fecha;
        private LocalTime horaInicio;
        private LocalTime horaFin;
        private String tema;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SesionClaseResponse {
        private Long id;
        private Long cursoId;
        private String cursoNombre;
        private Long seccionGradoId;
        private String gradoOCiclo;
        private String seccion;
        private Long docenteId;
        private String docenteNombre;
        private LocalDate fecha;
        private LocalTime horaInicio;
        private LocalTime horaFin;
        private String tema;
        private String qrSesionToken;
        private String estado;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MarcacionQrRequest {
        private String qrToken; // Token del carnet del estudiante o token de la sesión
        private Long sesionId;  // Opcional si se escanea QR de sesión
        private String metodo;  // QR_SCAN, QR_SESION, MANUAL
        private String estado;  // PRESENTE, TARDANZA, FALTA_JUSTIFICADA, FALTA_INJUSTIFICADA
        private String observaciones;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MarcacionResponse {
        private Long asistenciaId;
        private Long sesionId;
        private Long estudianteId;
        private String estudianteNombre;
        private String dni;
        private String estado;
        private String metodoMarcacion;
        private LocalDateTime fechaHoraMarcacion;
        private String mensaje;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AsistenciaItemResponse {
        private Long asistenciaId;
        private Long estudianteId;
        private String codigoEstudiante;
        private String estudianteNombres;
        private String estudianteApellidos;
        private String dni;
        private String estado;
        private String metodoMarcacion;
        private LocalDateTime fechaHoraMarcacion;
        private String observaciones;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumenAsistenciaEstudiante {
        private Long estudianteId;
        private String estudianteNombre;
        private long totalClases;
        private long asistencias;
        private long tardanzas;
        private long faltas;
        private long justificaciones;
        private double porcentajeAsistencia;
        private List<AsistenciaItemResponse> historial;
    }
}
