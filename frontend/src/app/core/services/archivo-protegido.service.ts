import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchivoProtegidoService {
  private http = inject(HttpClient);

  descargar(url: string, fileName: string): Observable<void> {
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap((response: HttpResponse<Blob>) => this.triggerDownload(response.body, fileName)),
      map(() => void 0)
    );
  }

  obtenerBlob(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  private triggerDownload(blob: Blob | null, fileName: string): void {
    if (!blob) {
      throw new Error('No se recibió el archivo solicitado.');
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
