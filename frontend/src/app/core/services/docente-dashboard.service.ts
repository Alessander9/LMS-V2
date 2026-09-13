import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocenteCurso {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelesSuscripcion: string[];
  estado: boolean;
  docenteId: number | null;
  docenteNombre: string | null;
  fechaCreacion: string;
}

export interface DocenteEstudianteProgress {
  estudianteId: number;
  nombres: string;
  apellidos: string;
  correo: string;
  porcentajeAvance: number;
  completado: boolean;
  fechaActualizacion: string;
  matriculaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteDashboardService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl;

  getCursosAsignados(): Observable<DocenteCurso[]> {
    return this.http.get<DocenteCurso[]>(`${this.baseApiUrl}/docente/cursos`);
  }

  getAlumnosCurso(cursoId: number): Observable<DocenteEstudianteProgress[]> {
    return this.http.get<DocenteEstudianteProgress[]>(`${this.baseApiUrl}/docente/cursos/${cursoId}/alumnos`);
  }
}
