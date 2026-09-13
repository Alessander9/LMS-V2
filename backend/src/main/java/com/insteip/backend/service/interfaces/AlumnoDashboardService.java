package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.certificado.AlumnoCertificadoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoCursoResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoDashboardMetrics;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayCourseResponse;
import java.util.List;

public interface AlumnoDashboardService {
    AlumnoDashboardMetrics getMetrics(String correo);
    List<AlumnoCursoResponse> getEnrolledCursos(String correo);
    List<AlumnoCertificadoResponse> getCertificados(String correo);
    AlumnoPlayCourseResponse getPlayCourse(String correo, Long cursoId);
}
