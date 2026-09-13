package com.insteip.backend.service.interfaces;

public interface MatriculaPdfService {

    /**
     * Genera la Ficha Consolidada de Matrícula en PDF con vigencia de 365 días.
     * @param matriculaId ID de la matrícula
     * @param correoSolicitante Correo del usuario autenticado que solicita la descarga (para validar permisos)
     * @return Arreglo de bytes con el contenido del PDF
     */
    byte[] generarPdfMatricula(Long matriculaId, String correoSolicitante);

    /**
     * Genera la Ficha de Matrícula buscando por curso y correo del alumno autenticado.
     * @param cursoId ID del curso
     * @param correoAlumno Correo del alumno
     * @return Arreglo de bytes con el contenido del PDF
     */
    byte[] generarMiPdfMatriculaPorCurso(Long cursoId, String correoAlumno);
}
