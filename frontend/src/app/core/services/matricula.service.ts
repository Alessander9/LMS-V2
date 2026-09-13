import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatriculaRequest, MatriculaResponse, ModuloAccesoItem } from '../models/matricula.model';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/matriculas';

  matricularAlumno(request: MatriculaRequest): Observable<MatriculaResponse> {
    return this.http.post<MatriculaResponse>(this.apiUrl, request);
  }

  listarMatriculados(cursoId: number): Observable<MatriculaResponse[]> {
    return this.http.get<MatriculaResponse[]>(`${this.apiUrl}/curso/${cursoId}`);
  }

  listarPorUsuario(usuarioId: number): Observable<MatriculaResponse[]> {
    return this.http.get<MatriculaResponse[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  eliminarMatricula(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene la lista de módulos y su estado de acceso para una matrícula
   */
  obtenerModulosAcceso(matriculaId: number): Observable<ModuloAccesoItem[]> {
    return this.http.get<ModuloAccesoItem[]>(`${this.apiUrl}/${matriculaId}/modulos-acceso`);
  }

  /**
   * Habilita o bloquea el acceso de un módulo individual para una matrícula
   */
  cambiarAccesoModulo(matriculaId: number, moduloId: number, habilitado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${matriculaId}/modulos/${moduloId}/acceso`, { habilitado });
  }

  /**
   * Actualiza en masa los módulos habilitados para una matrícula
   */
  guardarModulosAccesoMasivo(matriculaId: number, modulosHabilitadosIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${matriculaId}/modulos-acceso`, modulosHabilitadosIds);
  }

  /**
   * Descarga la Ficha Consolidada de Matrícula en PDF por ID de matrícula
   */
  descargarPdfMatricula(matriculaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${matriculaId}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga la Ficha Consolidada de Matrícula en PDF para el alumno autenticado por ID de curso
   */
  descargarMiFichaPorCurso(cursoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/curso/${cursoId}/mi-ficha`, {
      responseType: 'blob'
    });
  }

  /**
   * Utilidad para disparar la descarga en el navegador a partir del Blob
   */
  guardarArchivoPdf(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
