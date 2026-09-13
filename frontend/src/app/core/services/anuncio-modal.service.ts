import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnuncioModalItem, AnuncioModalRequest } from '../models/anuncio-modal.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioModalService {
  private apiUrl = `${environment.apiUrl}/anuncios-modal`;

  constructor(private http: HttpClient) {}

  obtenerAnuncioActivo(): Observable<AnuncioModalItem | null> {
    return this.http.get<AnuncioModalItem | null>(`${this.apiUrl}/activo`);
  }

  listarTodos(): Observable<AnuncioModalItem[]> {
    return this.http.get<AnuncioModalItem[]>(`${this.apiUrl}/todos`);
  }

  crear(request: AnuncioModalRequest): Observable<AnuncioModalItem> {
    return this.http.post<AnuncioModalItem>(this.apiUrl, request);
  }

  actualizar(id: number, request: AnuncioModalRequest): Observable<AnuncioModalItem> {
    return this.http.put<AnuncioModalItem>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
