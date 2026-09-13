import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { TareaService } from '../../../../core/services/tarea.service';
import { EntregaTareaService } from '../../../../core/services/entrega-tarea.service';
import { ArchivoProtegidoService } from '../../../../core/services/archivo-protegido.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlumnoTareaItem } from '../../../../core/models/tarea.model';
import { environment } from '../../../../../environments/environment';
import { formatBytes, getFileExtension } from '../../../../core/utils';

@Component({
  selector: 'app-mis-tareas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-tareas.component.html'
})
export class MisTareasComponent implements OnInit, OnDestroy {
  private tareaService = inject(TareaService);
  private entregaTareaService = inject(EntregaTareaService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  tareas: AlumnoTareaItem[] = [];
  isLoading = true;
  searchQuery = '';
  selectedFilter: 'TODAS' | 'PENDIENTE' | 'ENTREGADO' | 'APROBADO' | 'DESAPROBADO' = 'TODAS';
  selectedCursoId: number | 'TODOS' = 'TODOS';
  cursosDisponibles: { id: number; nombre: string; count: number }[] = [];
  vistaModo: 'cards' | 'list' = 'cards';

  // Buscador de Curso (autocomplete con máximo 2 coincidencias a la vez)
  cursoSearchTerm = '';
  showCursoDropdown = false;

  get cursosFiltradosCoincidencias(): { id: number | 'TODOS'; nombre: string; count: number }[] {
    const term = this.cursoSearchTerm.trim().toLowerCase();
    const todosItem = { id: 'TODOS' as const, nombre: 'Todos mis Cursos', count: this.totalTareas };
    
    if (!term) {
      return [todosItem, ...this.cursosDisponibles].slice(0, 2);
    }
    
    const results: { id: number | 'TODOS'; nombre: string; count: number }[] = [];
    if ('todos mis cursos'.includes(term) || 'todos'.includes(term)) {
      results.push(todosItem);
    }
    for (const c of this.cursosDisponibles) {
      if (results.length >= 2) break;
      if (c.nombre.toLowerCase().includes(term)) {
        results.push(c);
      }
    }
    return results.slice(0, 2);
  }

  onCursoSearchInput(term: string): void {
    this.cursoSearchTerm = term;
    this.showCursoDropdown = true;
    if (!term.trim()) {
      this.setCurso('TODOS');
    }
  }

  seleccionarCurso(curso: { id: number | 'TODOS'; nombre: string }): void {
    this.setCurso(curso.id);
    this.cursoSearchTerm = curso.id === 'TODOS' ? '' : curso.nombre;
    this.showCursoDropdown = false;
  }

  limpiarCursoSearch(): void {
    this.cursoSearchTerm = '';
    this.setCurso('TODOS');
    this.showCursoDropdown = false;
  }

  onBlurCurso(): void {
    setTimeout(() => {
      this.showCursoDropdown = false;
    }, 200);
  }

  // Paginación (máximo 10 items)
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.tareasFiltradas.length / this.pageSize) || 1;
  }

  get tareasPaginadas(): AlumnoTareaItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.tareasFiltradas.slice(start, start + this.pageSize);
  }

  get pagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }

  setFilter(filtro: 'TODAS' | 'PENDIENTE' | 'ENTREGADO' | 'APROBADO' | 'DESAPROBADO'): void {
    this.selectedFilter = filtro;
    this.currentPage = 1;
  }

  setCurso(cursoId: number | 'TODOS'): void {
    this.selectedCursoId = cursoId;
    this.currentPage = 1;
    if (cursoId === 'TODOS') {
      this.cursoSearchTerm = '';
    } else {
      const match = this.cursosDisponibles.find(c => c.id === cursoId);
      if (match) this.cursoSearchTerm = match.nombre;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cursoId === 'TODOS' ? { cursoId: null } : { cursoId },
      queryParamsHandling: 'merge'
    });
  }

  onCursoSelectChange(value: any): void {
    const cursoId = value === 'TODOS' ? 'TODOS' : Number(value);
    this.setCurso(cursoId);
  }

  // Modal para entregar tarea desde vista listado
  showEntregaModalTarea: AlumnoTareaItem | null = null;

  // Subida de archivos inline
  uploadingTareaId: number | null = null;
  uploadProgress = 0;
  selectedFiles: { [tareaId: number]: File } = {};
  selectedFileNames: { [tareaId: number]: string } = {};
  comentariosEntrega: { [tareaId: number]: string } = {};

  // Contadores
  totalTareas = 0;
  totalPendientes = 0;
  totalEnRevision = 0;
  totalAprobadas = 0;
  totalDesaprobadas = 0;

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['cursoId']) {
        const cId = Number(params['cursoId']);
        if (!isNaN(cId)) {
          this.selectedCursoId = cId;
        }
      } else {
        this.selectedCursoId = 'TODOS';
      }
    });
    this.cargarTareas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTareas(): void {
    this.isLoading = true;
    this.tareaService.listarTodasMisTareas().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.tareas = data;
        this.calcularContadores();
        this.extraerCursosDisponibles();
        if (this.selectedCursoId !== 'TODOS') {
          const match = this.cursosDisponibles.find(c => c.id === this.selectedCursoId);
          if (match) this.cursoSearchTerm = match.nombre;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar tareas del alumno:', err);
        this.toastService.error('No se pudieron cargar tus tareas');
        this.isLoading = false;
      }
    });
  }

  private extraerCursosDisponibles(): void {
    const mapCursos = new Map<number, { id: number; nombre: string; count: number }>();
    this.tareas.forEach(t => {
      if (t.cursoId && t.cursoNombre) {
        if (!mapCursos.has(t.cursoId)) {
          mapCursos.set(t.cursoId, { id: t.cursoId, nombre: t.cursoNombre, count: 1 });
        } else {
          mapCursos.get(t.cursoId)!.count++;
        }
      }
    });
    this.cursosDisponibles = Array.from(mapCursos.values());
  }

  private calcularContadores(): void {
    this.totalTareas = this.tareas.length;
    this.totalPendientes = this.tareas.filter(t => t.estadoEntrega === 'PENDIENTE').length;
    this.totalEnRevision = this.tareas.filter(t => t.estadoEntrega === 'ENTREGADO').length;
    this.totalAprobadas = this.tareas.filter(t => t.estadoEntrega === 'APROBADO').length;
    this.totalDesaprobadas = this.tareas.filter(t => t.estadoEntrega === 'DESAPROBADO').length;
  }

  parsearDescripcion(rawDesc?: string): { instrucciones: string; recursos: { tipo: 'link' | 'archivo' | 'imagen'; titulo: string; url: string }[] } {
    if (!rawDesc || !rawDesc.trim()) {
      return { instrucciones: '', recursos: [] };
    }

    try {
      if (rawDesc.trim().startsWith('{') && rawDesc.includes('"recursos"')) {
        const parsed = JSON.parse(rawDesc);
        return {
          instrucciones: parsed.instrucciones || '',
          recursos: parsed.recursos || []
        };
      }
    } catch {}

    return { instrucciones: rawDesc, recursos: [] };
  }

  abrirRecurso(recurso: { tipo: string; titulo: string; url: string }): void {
    if (!recurso.url) return;
    if (recurso.url.startsWith('http://') || recurso.url.startsWith('https://')) {
      window.open(recurso.url, '_blank');
    } else {
      const fullUrl = `${environment.apiUrl}${recurso.url.startsWith('/') ? '' : '/'}${recurso.url}`;
      this.archivoProtegidoService.descargar(fullUrl, recurso.titulo);
    }
  }

  get tareasFiltradas(): AlumnoTareaItem[] {
    let result = this.tareas;

    // Filtro por curso
    if (this.selectedCursoId !== 'TODOS') {
      result = result.filter(t => t.cursoId === this.selectedCursoId);
    }

    // Filtro por tab de estado
    if (this.selectedFilter !== 'TODAS') {
      result = result.filter(t => t.estadoEntrega === this.selectedFilter);
    }

    // Filtro por buscador
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(t => 
        (t.titulo && t.titulo.toLowerCase().includes(q)) ||
        (t.cursoNombre && t.cursoNombre.toLowerCase().includes(q)) ||
        (t.moduloNombre && t.moduloNombre.toLowerCase().includes(q))
      );
    }

    return result;
  }

  onFileSelected(tareaId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 100 * 1024 * 1024) {
        this.toastService.error('El archivo no puede superar los 100MB');
        input.value = '';
        return;
      }
      this.selectedFiles[tareaId] = file;
      this.selectedFileNames[tareaId] = file.name;
    }
  }

  subirEntrega(tareaId: number): void {
    const file = this.selectedFiles[tareaId];
    if (!file) {
      this.toastService.warning('Debes seleccionar un archivo para entregar');
      return;
    }

    const comentario = this.comentariosEntrega[tareaId] || '';
    this.uploadingTareaId = tareaId;
    this.uploadProgress = 0;

    this.entregaTareaService.entregarTareaConProgreso(tareaId, file, comentario).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadingTareaId = null;
          this.uploadProgress = 0;
          delete this.selectedFiles[tareaId];
          delete this.selectedFileNames[tareaId];
          delete this.comentariosEntrega[tareaId];
          this.toastService.success('¡Tarea entregada exitosamente!');
          this.cargarTareas();
        }
      },
      error: (err) => {
        this.uploadingTareaId = null;
        this.uploadProgress = 0;
        const msg = err?.error?.message || 'Error al subir la entrega de la tarea';
        this.toastService.error(msg);
      }
    });
  }

  descargarArchivoEntrega(entregaId?: number, nombreTarea?: string, tipoArchivo?: string): void {
    if (!entregaId) return;
    const url = `${environment.apiUrl}/entregas-tareas/${entregaId}/download`;
    const extension = getFileExtension(tipoArchivo || '');
    const filename = `Mi_Entrega_${(nombreTarea || 'Tarea').replace(/\s+/g, '_')}.${extension}`;
    this.archivoProtegidoService.descargar(url, filename).subscribe({
      error: (err) => {
        console.error('Error al descargar archivo de entrega:', err);
        this.toastService.error('No se pudo descargar el archivo de la entrega');
      }
    });
  }

  formatBytes(bytes?: number): string {
    return formatBytes(bytes || 0);
  }

  abrirModalEntrega(tarea: AlumnoTareaItem): void {
    this.showEntregaModalTarea = tarea;
  }

  cerrarModalEntrega(): void {
    this.showEntregaModalTarea = null;
  }
}
