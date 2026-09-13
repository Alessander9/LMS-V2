package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.academico.MatriculaAcademicaDtos.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.MatriculaAcademicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaAcademicaServiceImpl implements MatriculaAcademicaService {

    private final MatriculaAcademicaRepository matriculaAcademicaRepository;
    private final EstudiantePerfilRepository estudianteRepository;
    private final SeccionGradoRepository seccionGradoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;

    @Override
    @Transactional
    public MatriculaResponse matricularEstudiante(MatriculaRequest request) {
        EstudiantePerfil estudiante = estudianteRepository.findById(request.getEstudianteId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + request.getEstudianteId()));

        SeccionGrado seccion = seccionGradoRepository.findById(request.getSeccionGradoId())
                .orElseThrow(() -> new ResourceNotFoundException("Sección/Grado no encontrado con ID: " + request.getSeccionGradoId()));

        PeriodoAcademico periodo = periodoAcademicoRepository.findById(request.getPeriodoAcademicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo Académico no encontrado con ID: " + request.getPeriodoAcademicoId()));

        if (matriculaAcademicaRepository.findByEstudianteIdAndPeriodoAcademicoId(estudiante.getId(), periodo.getId()).isPresent()) {
            throw new BadRequestException("El estudiante ya se encuentra matriculado en este periodo académico.");
        }

        MatriculaAcademica matricula = MatriculaAcademica.builder()
                .estudiante(estudiante)
                .seccionGrado(seccion)
                .periodoAcademico(periodo)
                .estado("ACTIVA")
                .observaciones(request.getObservaciones())
                .build();

        matricula = matriculaAcademicaRepository.save(matricula);
        return mapearMatriculaResponse(matricula);
    }

    @Override
    @Transactional(readOnly = true)
    public MatriculaResponse obtenerPorId(Long id) {
        MatriculaAcademica m = matriculaAcademicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula académica no encontrada con ID: " + id));
        return mapearMatriculaResponse(m);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarPorSeccionYPeriodo(Long seccionId, Long periodoId) {
        return matriculaAcademicaRepository.findBySeccionGradoIdAndPeriodoAcademicoId(seccionId, periodoId)
                .stream().map(this::mapearMatriculaResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarPorEstudiante(Long estudianteId) {
        return matriculaAcademicaRepository.findByEstudianteId(estudianteId)
                .stream().map(this::mapearMatriculaResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cambiarEstadoMatricula(Long id, String nuevoEstado) {
        MatriculaAcademica m = matriculaAcademicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula académica no encontrada con ID: " + id));
        m.setEstado(nuevoEstado.toUpperCase());
        matriculaAcademicaRepository.save(m);
    }

    private MatriculaResponse mapearMatriculaResponse(MatriculaAcademica m) {
        return MatriculaResponse.builder()
                .id(m.getId())
                .estudianteId(m.getEstudiante().getId())
                .codigoEstudiante(m.getEstudiante().getCodigoEstudiante())
                .estudianteNombres(m.getEstudiante().getUsuario().getNombres())
                .estudianteApellidos(m.getEstudiante().getUsuario().getApellidos())
                .dni(m.getEstudiante().getDni())
                .seccionGradoId(m.getSeccionGrado().getId())
                .gradoOCiclo(m.getSeccionGrado().getGradoOCiclo())
                .seccion(m.getSeccionGrado().getSeccion())
                .nivel(m.getSeccionGrado().getNivel())
                .periodoAcademicoId(m.getPeriodoAcademico().getId())
                .periodoNombre(m.getPeriodoAcademico().getNombre())
                .estado(m.getEstado())
                .fechaMatricula(m.getFechaMatricula())
                .observaciones(m.getObservaciones())
                .build();
    }
}
