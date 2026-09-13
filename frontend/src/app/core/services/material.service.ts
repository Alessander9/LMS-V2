import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialResponse } from '../models/material.model';
import { PageResponse } from '../models/alumno.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl + '';

  listarMaterialesPorModulo(
    moduloId: number,
    page = 0,
    size = 10,
    search = '',
    sort = 'fechaSubida,desc'
  ): Observable<PageResponse<MaterialResponse>> {
    return this.http.get<PageResponse<MaterialResponse>>(`${this.baseApiUrl}/modulos/${moduloId}/materiales`, {
      params: {
        page: String(page),
        size: String(size),
        ...(search.trim() ? { search: search.trim() } : {}),
        sort
      }
    });
  }

  subirMaterial(moduloId: number, nombre: string, archivo: File): Observable<MaterialResponse> {
    const formData = new FormData();
    formData.append('moduloId', moduloId.toString());
    formData.append('nombre', nombre);
    formData.append('archivo', archivo);
    return this.http.post<MaterialResponse>(`${this.baseApiUrl}/materiales`, formData);
  }

  /** Subir material con seguimiento de progreso (reportProgress) */
  subirMaterialConProgreso(moduloId: number, nombre: string, archivo: File): Observable<HttpEvent<MaterialResponse>> {
    const formData = new FormData();
    formData.append('moduloId', moduloId.toString());
    formData.append('nombre', nombre);
    formData.append('archivo', archivo);
    return this.http.post<MaterialResponse>(`${this.baseApiUrl}/materiales`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  editarMaterial(id: number, nombre: string, archivo?: File): Observable<MaterialResponse> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    if (archivo) {
      formData.append('archivo', archivo);
    }
    return this.http.put<MaterialResponse>(`${this.baseApiUrl}/materiales/${id}`, formData);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseApiUrl}/materiales/${id}/estado`, { estado });
  }

  eliminarMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/materiales/${id}`);
  }
}
