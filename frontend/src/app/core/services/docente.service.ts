import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocenteRequest, DocenteResponse } from '../models/docente.model';
import { PageResponse } from '../models/alumno.model';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/usuarios/docentes';

  listarDocentes(page = 0, size = 20, search = '', sort = 'fechaRegistro,desc'): Observable<PageResponse<DocenteResponse>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', sort);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<PageResponse<DocenteResponse>>(this.apiUrl, { params });
  }

  crearDocente(docente: DocenteRequest): Observable<DocenteResponse> {
    return this.http.post<DocenteResponse>(this.apiUrl, docente);
  }

  editarDocente(id: number, docente: DocenteRequest): Observable<DocenteResponse> {
    return this.http.put<DocenteResponse>(`${this.apiUrl}/${id}`, docente);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  eliminarDocente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
