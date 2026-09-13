import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BuzonResumen,
  CarpetaBuzon,
  ConversacionItem,
  DestinatarioItem,
  MensajeItem,
  MensajeRequest,
  RespuestaMensajeRequest
} from '../models/mensajeria.model';

@Injectable({
  providedIn: 'root'
})
export class MensajeriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mensajeria`;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private resumenSubject = new BehaviorSubject<BuzonResumen>({
    totalRecibidos: 0,
    totalNoLeidos: 0,
    totalEnviados: 0,
    totalDestacados: 0
  });
  resumen$ = this.resumenSubject.asObservable();

  enviarMensaje(request: MensajeRequest): Observable<MensajeItem> {
    return this.http.post<MensajeItem>(`${this.apiUrl}/enviar`, request).pipe(
      tap(() => this.actualizarResumen().subscribe())
    );
  }

  responderMensaje(conversacionId: number, request: RespuestaMensajeRequest): Observable<MensajeItem> {
    return this.http.post<MensajeItem>(`${this.apiUrl}/conversaciones/${conversacionId}/responder`, request).pipe(
      tap(() => this.actualizarResumen().subscribe())
    );
  }

  listarConversaciones(cursoId?: number, page = 0, size = 30): Observable<{ content: ConversacionItem[]; totalElements: number }> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (cursoId) {
      params = params.set('cursoId', cursoId.toString());
    }
    return this.http.get<{ content: ConversacionItem[]; totalElements: number }>(`${this.apiUrl}/conversaciones`, { params }).pipe(
      catchError(() => of({ content: [], totalElements: 0 }))
    );
  }

  obtenerConversacion(conversacionId: number): Observable<ConversacionItem> {
    return this.http.get<ConversacionItem>(`${this.apiUrl}/conversaciones/${conversacionId}`).pipe(
      tap(() => this.actualizarResumen().subscribe())
    );
  }

  obtenerBandeja(carpeta: CarpetaBuzon = 'RECIBIDOS', page = 0, size = 30): Observable<{ content: MensajeItem[]; totalElements: number }> {
    const params = new HttpParams().set('carpeta', carpeta).set('page', page.toString()).set('size', size.toString());
    return this.http.get<{ content: MensajeItem[]; totalElements: number }>(`${this.apiUrl}/bandeja`, { params }).pipe(
      catchError(() => of({ content: [], totalElements: 0 }))
    );
  }

  marcarComoLeido(mensajeId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mensajes/${mensajeId}/leer`, {}).pipe(
      tap(() => this.actualizarResumen().subscribe())
    );
  }

  marcarConversacionComoLeida(conversacionId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/conversaciones/${conversacionId}/leer-todas`, {}).pipe(
      tap(() => this.actualizarResumen().subscribe())
    );
  }

  toggleDestacado(mensajeId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mensajes/${mensajeId}/destacar`, {}).pipe(
      tap(() => this.actualizarResumen().subscribe())
    );
  }

  obtenerDestinatarios(): Observable<DestinatarioItem[]> {
    return this.http.get<DestinatarioItem[]>(`${this.apiUrl}/destinatarios`).pipe(
      catchError(() => of([]))
    );
  }

  actualizarResumen(): Observable<BuzonResumen> {
    return this.http.get<BuzonResumen>(`${this.apiUrl}/resumen`).pipe(
      tap(resumen => {
        this.resumenSubject.next(resumen);
        this.unreadCountSubject.next(resumen.totalNoLeidos);
      }),
      catchError(() => {
        const fallback: BuzonResumen = { totalRecibidos: 0, totalNoLeidos: 0, totalEnviados: 0, totalDestacados: 0 };
        this.resumenSubject.next(fallback);
        this.unreadCountSubject.next(0);
        return of(fallback);
      })
    );
  }
}
