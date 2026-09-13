import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/alumno.model';

export interface DocenteOption {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/usuarios';

  listarDocentes(page = 0, size = 50, search = '', sort = 'fechaRegistro,desc'): Observable<PageResponse<DocenteOption>> {
    let params = new HttpParams();
    params = params.set('page', String(page));
    params = params.set('size', String(size));
    params = params.set('sort', sort);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<PageResponse<DocenteOption> | DocenteOption[]>(`${this.apiUrl}/docentes`, { params }).pipe(
      map((res: any) => Array.isArray(res)
        ? { content: res, totalElements: res.length, totalPages: 1, number: page, size }
        : res)
    );
  }
}
