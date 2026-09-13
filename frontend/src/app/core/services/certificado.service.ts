import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResponse } from '../models/alumno.model';

export interface CertificadoResponse {
  id: number;
  usuarioId: number;
  cursoId: number;
  alumnoNombre?: string;
  alumnoCorreo?: string;
  cursoNombre?: string;
  codigo: string;
  archivoPdf: string;
  urlValidacion: string;
  numeroRegistro: string;
  fechaEmision: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/certificados';

  generarCertificado(cursoId: number): Observable<CertificadoResponse> {
    return this.http.post<CertificadoResponse>(`${this.apiUrl}/generar/${cursoId}`, null);
  }

  validarCertificado(codigo: string): Observable<CertificadoResponse> {
    return this.http.get<CertificadoResponse>(`${this.apiUrl}/validar/${codigo}`);
  }

  listarCertificados(
    page = 0,
    size = 5,
    search = '',
    sort = 'fechaEmision,desc'
  ): Observable<PageResponse<CertificadoResponse>> {
    return this.http.get<PageResponse<CertificadoResponse> | CertificadoResponse[]>(this.apiUrl, {
      params: {
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
}
