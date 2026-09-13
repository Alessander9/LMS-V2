import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagoPendienteResponse {
  id: number;
  monto: number;
  metodoPago: string;
  numeroOperacion: string;
  observaciones: string;
  fechaPago: string;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    correo: string;
  };
  nivelSuscripcion: {
    id: number;
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/pagos';

  listarPagosPendientes(): Observable<PagoPendienteResponse[]> {
    return this.http.get<PagoPendienteResponse[]>(`${this.apiUrl}/pendientes`);
  }

  aprobarPago(id: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/${id}/aprobar`, {});
  }
}
