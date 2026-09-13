import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntregaTareaResponse, CalificarEntregaRequest } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class EntregaTareaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/entregas-tareas`;

  entregarTarea(tareaId: number, archivo: File, comentario?: string): Observable<EntregaTareaResponse> {
    const formData = new FormData();
    formData.append('tareaId', tareaId.toString());
    formData.append('archivo', archivo);
    if (comentario && comentario.trim()) {
      formData.append('comentario', comentario.trim());
    }
    return this.http.post<EntregaTareaResponse>(this.apiUrl, formData);
  }

  entregarTareaConProgreso(tareaId: number, archivo: File, comentario?: string): Observable<HttpEvent<EntregaTareaResponse>> {
    const formData = new FormData();
    formData.append('tareaId', tareaId.toString());
    formData.append('archivo', archivo);
    if (comentario && comentario.trim()) {
      formData.append('comentario', comentario.trim());
    }
    return this.http.post<EntregaTareaResponse>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  obtenerMiEntrega(tareaId: number): Observable<EntregaTareaResponse> {
    return this.http.get<EntregaTareaResponse>(`${this.apiUrl}/tarea/${tareaId}/mi-entrega`);
  }

  listarEntregasPorTarea(tareaId: number): Observable<EntregaTareaResponse[]> {
    return this.http.get<EntregaTareaResponse[]>(`${this.apiUrl}/tarea/${tareaId}/todas`);
  }

  calificarEntrega(entregaId: number, request: CalificarEntregaRequest): Observable<EntregaTareaResponse> {
    return this.http.put<EntregaTareaResponse>(`${this.apiUrl}/${entregaId}/calificar`, request);
  }

  descargarArchivo(entregaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${entregaId}/download`, {
      responseType: 'blob'
    });
  }
}
