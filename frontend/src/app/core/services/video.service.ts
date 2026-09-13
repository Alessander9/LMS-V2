import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoRequest, VideoResponse } from '../models/video.model';
import { PageResponse } from '../models/alumno.model';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl + '';

  listarVideosPorModulo(
    moduloId: number,
    page = 0,
    size = 10,
    search = '',
    sort = 'fechaCreacion,desc'
  ): Observable<PageResponse<VideoResponse>> {
    return this.http.get<PageResponse<VideoResponse>>(`${this.baseApiUrl}/modulos/${moduloId}/videos`, {
      params: {
        page: String(page),
        size: String(size),
        ...(search.trim() ? { search: search.trim() } : {}),
        sort
      }
    });
  }

  crearVideo(video: VideoRequest): Observable<VideoResponse> {
    return this.http.post<VideoResponse>(`${this.baseApiUrl}/videos`, video);
  }

  editarVideo(id: number, video: VideoRequest): Observable<VideoResponse> {
    return this.http.put<VideoResponse>(`${this.baseApiUrl}/videos/${id}`, video);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseApiUrl}/videos/${id}/estado`, { estado });
  }

  eliminarVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/videos/${id}`);
  }

  actualizarDuracion(id: number, duracionSegundos: number): Observable<void> {
    return this.http.post<void>(`${this.baseApiUrl}/videos/${id}/duracion`, { duracionSegundos }, {
      headers: { 'X-Skip-Error-Notification': 'true' }
    });
  }
}
