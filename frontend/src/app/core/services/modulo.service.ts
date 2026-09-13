import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModuloRequest, ModuloResponse } from '../models/modulo.model';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl + '';

  listarModulosPorCurso(cursoId: number): Observable<ModuloResponse[]> {
    return this.http.get<ModuloResponse[]>(`${this.baseApiUrl}/cursos/${cursoId}/modulos`);
  }

  obtenerModulo(id: number): Observable<ModuloResponse> {
    return this.http.get<ModuloResponse>(`${this.baseApiUrl}/modulos/${id}`);
  }

  crearModulo(modulo: ModuloRequest): Observable<ModuloResponse> {
    return this.http.post<ModuloResponse>(`${this.baseApiUrl}/modulos`, modulo);
  }

  editarModulo(id: number, modulo: ModuloRequest): Observable<ModuloResponse> {
    return this.http.put<ModuloResponse>(`${this.baseApiUrl}/modulos/${id}`, modulo);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseApiUrl}/modulos/${id}/estado`, { estado });
  }

  eliminarModulo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/modulos/${id}`);
  }
}
