import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoSistemaResponse, LoginAuditoriaResponse } from '../models/auditoria.model';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/auditoria';

  getLoginAuditoria(): Observable<LoginAuditoriaResponse[]> {
    return this.http.get<LoginAuditoriaResponse[]>(`${this.apiUrl}/login`);
  }

  getEventosSistema(): Observable<EventoSistemaResponse[]> {
    return this.http.get<EventoSistemaResponse[]>(`${this.apiUrl}/eventos`);
  }
}
