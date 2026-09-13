import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AlumnoMetrics {
  cursosInscritos: number;
  cursosCompletados: number;
  certificados: number;
}

export interface AlumnoCurso {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelSuscripcion: string;
  avancePorcentaje: number;
  completado: boolean;
  fechaMatricula: string;
  fechaExpiracion?: string;
  diasRestantes?: number;
  alertaExpiracion?: 'OK' | 'PROXIMO_30_DIAS' | 'URGENTE_7_DIAS' | 'EXPIRADO';
}

export interface AlumnoCertificado {
  id: number;
  codigo: string;
  cursoNombre: string;
  fechaEmision: string;
  archivoPdf: string;
  urlValidacion: string;
}

export interface AlumnoPlayMaterial {
  id: number;
  nombre: string;
  archivoUrl: string;
  tipoArchivo: string;
  pesoBytes: number;
}

export interface AlumnoPlayVideo {
  id: number;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  youtubeId: string;
  duracionSegundos: number;
  orden: number;
  ultimoSegundo: number;
  porcentajeVisto: number;
  completado: boolean;
}

export interface AlumnoPlayModulo {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
  videos: AlumnoPlayVideo[];
  materiales: AlumnoPlayMaterial[];
  bloqueado?: boolean;
  mensajeBloqueo?: string;
}

export interface AlumnoPlayCourse {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelSuscripcion: string;
  modulos: AlumnoPlayModulo[];
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoDashboardService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl;

  getMetrics(): Observable<AlumnoMetrics> {
    return this.http.get<AlumnoMetrics>(`${this.baseApiUrl}/alumno/dashboard`);
  }

  getEnrolledCursos(): Observable<AlumnoCurso[]> {
    return this.http.get<AlumnoCurso[]>(`${this.baseApiUrl}/alumno/cursos`);
  }

  getCertificados(): Observable<AlumnoCertificado[]> {
    return this.http.get<AlumnoCertificado[]>(`${this.baseApiUrl}/alumno/certificados`);
  }

  getPlayCourse(cursoId: number): Observable<AlumnoPlayCourse> {
    return this.http.get<AlumnoPlayCourse>(`${this.baseApiUrl}/alumno/cursos/${cursoId}/play`);
  }

  guardarProgreso(videoId: number, ultimoSegundo: number, duracionSegundos?: number): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/avance`, { videoId, ultimoSegundo, duracionSegundos });
  }

  obtenerProgreso(videoId: number): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/avance/video/${videoId}`);
  }
}
