import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/reportes';

  exportarAlumnos(): Observable<void> {
    return this.descargarCsv('alumnos', 'alumnos.csv');
  }

  exportarCursos(): Observable<void> {
    return this.descargarCsv('cursos', 'cursos.csv');
  }

  exportarMatriculas(): Observable<void> {
    return this.descargarCsv('matriculas', 'matriculas.csv');
  }

  exportarCertificados(): Observable<void> {
    return this.descargarCsv('certificados', 'certificados.csv');
  }

  private descargarCsv(reporte: string, fileName: string): Observable<void> {
    return this.http.get(`${this.apiUrl}/${reporte}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap((response: HttpResponse<Blob>) => this.triggerDownload(response.body, fileName)),
      map(() => void 0)
    );
  }

  private triggerDownload(blob: Blob | null, fileName: string): void {
    if (!blob) {
      throw new Error('No se recibió el archivo del reporte.');
    }

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }
}
