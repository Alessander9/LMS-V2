package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "estudiantes_perfil", indexes = {
    @Index(name = "idx_estudiantes_codigo", columnList = "codigo_estudiante"),
    @Index(name = "idx_estudiantes_dni", columnList = "dni"),
    @Index(name = "idx_estudiantes_qr", columnList = "qr_token")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstudiantePerfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "codigo_estudiante", nullable = false, unique = true, length = 50)
    private String codigoEstudiante;

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(length = 20)
    private String genero;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(name = "nombre_apoderado", length = 200)
    private String nombreApoderado;

    @Column(name = "telefono_apoderado", length = 30)
    private String telefonoApoderado;

    @Column(name = "parentesco_apoderado", length = 50)
    private String parentescoApoderado;

    @Column(name = "qr_token", nullable = false, unique = true, length = 200)
    private String qrToken;

    @Column(name = "fecha_creacion", updatable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
