package com.insteip.backend.domain.dto.academico;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

public class EstudianteDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegistroEstudianteRequest {
        private String nombres;
        private String apellidos;
        private String correo;
        private String password;
        private String telefono;
        private String dni;
        private LocalDate fechaNacimiento;
        private String genero;
        private String direccion;
        private String nombreApoderado;
        private String telefonoApoderado;
        private String parentescoApoderado;
        private Long seccionGradoId;
        private Long periodoAcademicoId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EstudianteResponse {
        private Long id;
        private Long usuarioId;
        private String codigoEstudiante;
        private String nombres;
        private String apellidos;
        private String correo;
        private String telefono;
        private String dni;
        private LocalDate fechaNacimiento;
        private String genero;
        private String direccion;
        private String nombreApoderado;
        private String telefonoApoderado;
        private String parentescoApoderado;
        private String qrToken;
        private String gradoOSeccionActual;
        private String nivelActual;
        private Boolean estadoUsuario;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CarnetEstudianteQrResponse {
        private Long estudianteId;
        private String codigoEstudiante;
        private String nombresCompletos;
        private String dni;
        private String gradoOSeccion;
        private String nivel;
        private String qrToken;
        private String fechaEmision;
    }
}
