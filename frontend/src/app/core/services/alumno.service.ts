import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlumnoRequest, AlumnoResponse, PageResponse } from '../models/alumno.model';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/usuarios';

  listarAlumnos(
    page = 0,
    size = 10,
    search = '',
    sort = 'fechaRegistro,desc',
    includeInactive = true
  ): Observable<PageResponse<AlumnoResponse>> {
    return this.http.get<PageResponse<AlumnoResponse> | AlumnoResponse[]>(this.apiUrl, {
      params: {
        includeInactive: String(includeInactive),
        page: String(page),
        size: String(size),
        ...(search.trim() ? { search: search.trim() } : {}),
        sort
      }
    }).pipe(
      map((res: any) => Array.isArray(res)
        ? { content: res, totalElements: res.length, totalPages: 1, number: page, size }
        : res)
    );
  }

  obtenerAlumno(id: number): Observable<AlumnoResponse> {
    return this.http.get<AlumnoResponse>(`${this.apiUrl}/${id}`);
  }

  crearAlumno(alumno: AlumnoRequest): Observable<AlumnoResponse> {
    return this.http.post<AlumnoResponse>(this.apiUrl, alumno);
  }

  editarAlumno(id: number, alumno: AlumnoRequest): Observable<AlumnoResponse> {
    return this.http.put<AlumnoResponse>(`${this.apiUrl}/${id}`, alumno);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  eliminarAlumno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
