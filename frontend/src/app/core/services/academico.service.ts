import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PeriodoAcademico,
  SeccionGrado,
  EstudianteResponse,
  RegistroEstudianteRequest,
  CarnetEstudianteQrResponse,
  MatriculaAcademicaResponse,
  SesionClaseResponse,
  MarcacionQrRequest,
  MarcacionResponse,
  AsistenciaItemResponse,
  ResumenAsistenciaEstudiante,
  EvaluacionConfigResponse,
  EvaluacionConfigRequest,
  CalificacionItemResponse,
  RegistroCalificacionRequest,
  ModificarCalificacionRequest,
  HistorialCambioResponse,
  BoletaNotasEstudianteResponse
} from '../models/academico.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicoService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // Periodos & Secciones
  listarPeriodos(tipoInstitucion?: string): Observable<PeriodoAcademico[]> {
    return this.http.get<PeriodoAcademico[]>(`${this.base}/periodos-academicos`, {
      params: tipoInstitucion ? { tipoInstitucion } : {}
    });
  }

  listarSecciones(nivel?: string): Observable<SeccionGrado[]> {
    return this.http.get<SeccionGrado[]>(`${this.base}/secciones-grados`, {
      params: nivel ? { nivel } : {}
    });
  }

  // Estudiantes
  registrarEstudiante(req: RegistroEstudianteRequest): Observable<EstudianteResponse> {
    return this.http.post<EstudianteResponse>(`${this.base}/estudiantes`, req);
  }

  listarEstudiantes(search?: string): Observable<EstudianteResponse[]> {
    return this.http.get<EstudianteResponse[]>(`${this.base}/estudiantes`, {
      params: search ? { search } : {}
    });
  }

  obtenerEstudiante(id: number): Observable<EstudianteResponse> {
    return this.http.get<EstudianteResponse>(`${this.base}/estudiantes/${id}`);
  }

  obtenerCarnetQr(id: number): Observable<CarnetEstudianteQrResponse> {
    return this.http.get<CarnetEstudianteQrResponse>(`${this.base}/estudiantes/${id}/carnet-qr`);
  }

  listarEstudiantesPorSeccion(seccionId: number, periodoId: number): Observable<EstudianteResponse[]> {
    return this.http.get<EstudianteResponse[]>(`${this.base}/estudiantes/seccion/${seccionId}/periodo/${periodoId}`);
  }

  // Matrículas
  matricularEstudiante(req: { estudianteId: number; seccionGradoId: number; periodoAcademicoId: number; observaciones?: string }): Observable<MatriculaAcademicaResponse> {
    return this.http.post<MatriculaAcademicaResponse>(`${this.base}/matriculas-academicas`, req);
  }

  listarMatriculasPorSeccionYPeriodo(seccionId: number, periodoId: number): Observable<MatriculaAcademicaResponse[]> {
    return this.http.get<MatriculaAcademicaResponse[]>(`${this.base}/matriculas-academicas/seccion/${seccionId}/periodo/${periodoId}`);
  }

  listarMatriculasPorEstudiante(estudianteId: number): Observable<MatriculaAcademicaResponse[]> {
    return this.http.get<MatriculaAcademicaResponse[]>(`${this.base}/matriculas-academicas/estudiante/${estudianteId}`);
  }

  // Asistencias QR
  crearSesion(req: { cursoId: number; seccionGradoId: number; fecha: string; horaInicio: string; horaFin: string; tema?: string }): Observable<SesionClaseResponse> {
    return this.http.post<SesionClaseResponse>(`${this.base}/asistencias/sesiones`, req);
  }

  obtenerSesion(sesionId: number): Observable<SesionClaseResponse> {
    return this.http.get<SesionClaseResponse>(`${this.base}/asistencias/sesiones/${sesionId}`);
  }

  listarSesiones(cursoId: number, seccionId: number): Observable<SesionClaseResponse[]> {
    return this.http.get<SesionClaseResponse[]>(`${this.base}/asistencias/sesiones/curso/${cursoId}/seccion/${seccionId}`);
  }

  marcarAsistenciaQr(req: MarcacionQrRequest): Observable<MarcacionResponse> {
    return this.http.post<MarcacionResponse>(`${this.base}/asistencias/qr/marcar`, req);
  }

  listarAsistenciaSesion(sesionId: number): Observable<AsistenciaItemResponse[]> {
    return this.http.get<AsistenciaItemResponse[]>(`${this.base}/asistencias/sesiones/${sesionId}/listado`);
  }

  obtenerResumenAsistenciaEstudiante(estudianteId: number): Observable<ResumenAsistenciaEstudiante> {
    return this.http.get<ResumenAsistenciaEstudiante>(`${this.base}/asistencias/estudiante/${estudianteId}/resumen`);
  }

  // Calificaciones & Auditoría
  crearEvaluacionConfig(req: EvaluacionConfigRequest): Observable<EvaluacionConfigResponse> {
    return this.http.post<EvaluacionConfigResponse>(`${this.base}/calificaciones/config`, req);
  }

  listarEvaluaciones(cursoId: number, periodoId: number): Observable<EvaluacionConfigResponse[]> {
    return this.http.get<EvaluacionConfigResponse[]>(`${this.base}/calificaciones/config/curso/${cursoId}/periodo/${periodoId}`);
  }

  registrarCalificacion(req: RegistroCalificacionRequest): Observable<CalificacionItemResponse> {
    return this.http.post<CalificacionItemResponse>(`${this.base}/calificaciones`, req);
  }

  modificarCalificacion(calificacionId: number, req: ModificarCalificacionRequest): Observable<CalificacionItemResponse> {
    return this.http.put<CalificacionItemResponse>(`${this.base}/calificaciones/${calificacionId}`, req);
  }

  obtenerHistorialModificaciones(calificacionId: number): Observable<HistorialCambioResponse[]> {
    return this.http.get<HistorialCambioResponse[]>(`${this.base}/calificaciones/${calificacionId}/historial`);
  }

  generarBoletaNotas(matriculaAcademicaId: number): Observable<BoletaNotasEstudianteResponse> {
    return this.http.get<BoletaNotasEstudianteResponse>(`${this.base}/calificaciones/boleta/${matriculaAcademicaId}`);
  }
}
