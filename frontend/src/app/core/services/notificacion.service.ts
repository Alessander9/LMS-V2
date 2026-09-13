import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, filter, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificacionResumen, ComunicadoRequest } from '../models/notificacion.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  private resumenSubject = new BehaviorSubject<NotificacionResumen>({
    totalNoLeidas: 0,
    notificaciones: []
  });

  public resumen$ = this.resumenSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.iniciarPolling();
  }

  private iniciarPolling(): void {
    // Consulta inicial si está autenticado
    if (this.authService.isLoggedIn()) {
      this.cargarNotificaciones().subscribe({ error: () => {} });
    }

    // Polling ligero cada 45 segundos solo si está autenticado con catchError para no romper el stream
    interval(45000).pipe(
      filter(() => this.authService.isLoggedIn()),
      switchMap(() => this.cargarNotificaciones().pipe(catchError(() => of(null))))
    ).subscribe();
  }

  cargarNotificaciones(limite: number = 20): Observable<NotificacionResumen> {
    if (!this.authService.isLoggedIn()) {
      return of({ totalNoLeidas: 0, notificaciones: [] });
    }

    return this.http.get<NotificacionResumen>(`${this.apiUrl}/mis-notificaciones?limite=${limite}`).pipe(
      tap(resumen => this.resumenSubject.next(resumen))
    );
  }

  marcarComoLeida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/leer`, {}).pipe(
      tap(() => {
        // Actualización optimista local
        const actual = this.resumenSubject.value;
        const notificacionesActualizadas = actual.notificaciones.map(n => {
          if (n.id === id) {
            return { ...n, leido: true };
          }
          return n;
        });
        const nuevasNoLeidas = Math.max(0, actual.totalNoLeidas - 1);
        this.resumenSubject.next({
          totalNoLeidas: nuevasNoLeidas,
          notificaciones: notificacionesActualizadas
        });
      })
    );
  }

  marcarTodasComoLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/leer-todas`, {}).pipe(
      tap(() => {
        const actual = this.resumenSubject.value;
        const notificacionesActualizadas = actual.notificaciones.map(n => ({ ...n, leido: true }));
        this.resumenSubject.next({
          totalNoLeidas: 0,
          notificaciones: notificacionesActualizadas
        });
      })
    );
  }

  enviarComunicado(comunicado: ComunicadoRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/comunicado`, comunicado);
  }
}
