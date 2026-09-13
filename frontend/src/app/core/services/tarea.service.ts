import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TareaRequest, TareaResponse, AlumnoTareaItem } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tareas`;

  listarPorModulo(moduloId: number): Observable<TareaResponse[]> {
    return this.http.get<TareaResponse[]>(`${this.apiUrl}/modulo/${moduloId}`);
  }

  listarTareasPorCursoParaAlumno(cursoId: number): Observable<AlumnoTareaItem[]> {
    return this.http.get<AlumnoTareaItem[]>(`${this.apiUrl}/curso/${cursoId}/alumno`);
  }

  listarTodasMisTareas(): Observable<AlumnoTareaItem[]> {
    return this.http.get<AlumnoTareaItem[]>(`${this.apiUrl}/alumno/todas`);
  }

  obtenerPorId(id: number): Observable<TareaResponse> {
    return this.http.get<TareaResponse>(`${this.apiUrl}/${id}`);
  }

  crear(request: TareaRequest): Observable<TareaResponse> {
    return this.http.post<TareaResponse>(this.apiUrl, request);
  }

  actualizar(id: number, request: TareaRequest): Observable<TareaResponse> {
    return this.http.put<TareaResponse>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
