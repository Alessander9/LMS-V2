import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { DocenteDashboardService, DocenteCurso } from '../../../../core/services/docente-dashboard.service';
import { ModuloService } from '../../../../core/services/modulo.service';
import { TareaService } from '../../../../core/services/tarea.service';
import { EntregaTareaService } from '../../../../core/services/entrega-tarea.service';
import { MaterialService } from '../../../../core/services/material.service';
import { ArchivoProtegidoService } from '../../../../core/services/archivo-protegido.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ModuloResponse } from '../../../../core/models/modulo.model';
import { TareaRequest, TareaResponse, EntregaTareaResponse, CalificarEntregaRequest } from '../../../../core/models/tarea.model';
import { environment } from '../../../../../environments/environment';
import { formatBytes, getFileExtension } from '../../../../core/utils';

export interface TareaRecurso {
  tipo: 'link' | 'archivo' | 'imagen';
  titulo: string;
  url: string;
}

export interface DocenteTareaItemExt extends TareaResponse {
  cursoId?: number;
  cursoNombre?: string;
}

@Component({
  selector: 'app-docente-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './docente-tareas.component.html',
  styleUrls: ['./docente-tareas.component.css']
})
export class DocenteTareasComponent implements OnInit, OnDestroy {
  private docenteDashboardService = inject(DocenteDashboardService);
  private moduloService = inject(ModuloService);
  private tareaService = inject(TareaService);
  private entregaTareaService = inject(EntregaTareaService);
  private materialService = inject(MaterialService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Cursos y módulos
  // Cursos y módulos
  cursos: DocenteCurso[] = [];
  selectedCursoId: number | 'TODOS' = 'TODOS';
  modulos: ModuloResponse[] = [];
  selectedModuloId: number | 'TODOS' = 'TODOS';

  // Buscador de Curso (autocomplete con máximo 2 coincidencias)
  cursoSearchTerm = '';
  showCursoDropdown = false;

  get cursosFiltradosCoincidencias(): { id: number | 'TODOS'; nombre: string; count: number }[] {
    const term = this.cursoSearchTerm.trim().toLowerCase();
    const todosOption = { id: 'TODOS' as const, nombre: 'Todos los Cursos', count: this.totalTareasCount };
    if (!term) {
      return [todosOption, ...this.cursosConConteo].slice(0, 2);
    }
    const matched: { id: number | 'TODOS'; nombre: string; count: number }[] = [];
    if ('todos los cursos'.includes(term) || 'todos'.includes(term)) {
      matched.push(todosOption);
    }
    for (const c of this.cursosConConteo) {
      if (matched.length >= 2) break;
      if (c.nombre.toLowerCase().includes(term)) {
        matched.push(c);
      }
    }
    return matched.slice(0, 2);
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
    this.moduloSearchTerm = '';
    this.showCursoDropdown = false;
  }

  limpiarCursoSearch(): void {
    this.cursoSearchTerm = '';
    this.setCurso('TODOS');
    this.moduloSearchTerm = '';
    this.showCursoDropdown = false;
  }

  onBlurCurso(): void {
    setTimeout(() => {
      this.showCursoDropdown = false;
    }, 200);
  }

  // Buscador de Módulo (autocomplete con máximo 2 coincidencias)
  moduloSearchTerm = '';
  showModuloDropdown = false;

  get modulosFiltradosCoincidencias(): { id: number | 'TODOS'; nombre: string; orden?: number }[] {
    const term = this.moduloSearchTerm.trim().toLowerCase();
    const todosOption = { id: 'TODOS' as const, nombre: 'Todos los Módulos' };
    if (!term) {
      const modOptions = this.modulos.map(m => ({ id: m.id, nombre: `Mód ${m.orden}: ${m.nombre}`, orden: m.orden }));
      return [todosOption, ...modOptions].slice(0, 2);
    }
    const matched: { id: number | 'TODOS'; nombre: string; orden?: number }[] = [];
    if ('todos los modulos'.includes(term) || 'todos'.includes(term)) {
      matched.push(todosOption);
    }
    for (const m of this.modulos) {
      if (matched.length >= 2) break;
      const fullLabel = `Mód ${m.orden}: ${m.nombre}`;
      if (fullLabel.toLowerCase().includes(term) || m.nombre.toLowerCase().includes(term)) {
        matched.push({ id: m.id, nombre: fullLabel, orden: m.orden });
      }
    }
    return matched.slice(0, 2);
  }

  onModuloSearchInput(term: string): void {
    this.moduloSearchTerm = term;
    this.showModuloDropdown = true;
    if (!term.trim()) {
      this.setModulo('TODOS');
    }
  }

  seleccionarModulo(modulo: { id: number | 'TODOS'; nombre: string }): void {
    this.setModulo(modulo.id);
    this.moduloSearchTerm = modulo.id === 'TODOS' ? '' : modulo.nombre;
    this.showModuloDropdown = false;
  }

  limpiarModuloSearch(): void {
    this.moduloSearchTerm = '';
    this.setModulo('TODOS');
    this.showModuloDropdown = false;
  }

  onBlurModulo(): void {
    setTimeout(() => {
      this.showModuloDropdown = false;
    }, 200);
  }

  get selectedCursoNombre(): string {
    if (this.selectedCursoId === 'TODOS') return 'Todos los Cursos';
    const c = this.cursos.find(curso => curso.id === this.selectedCursoId);
    return c ? c.nombre : '';
  }

  // Tareas
  tareas: DocenteTareaItemExt[] = [];
  isLoadingCursos = true;
  isLoadingModulos = false;
  isLoadingTareas = false;

  // Filtro, Búsqueda y Modo de Vista
  filtroEstado: 'TODAS' | 'PENDIENTES' | 'ACTIVAS' | 'VENCIDAS' = 'TODAS';
  searchQuery = '';
  vistaModo: 'cards' | 'list' = 'cards';

  // Paginación (máximo 10 items)
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.tareasFiltradas.length / this.pageSize) || 1;
  }

  get tareasPaginadas(): DocenteTareaItemExt[] {
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

  setFiltroEstado(estado: 'TODAS' | 'PENDIENTES' | 'ACTIVAS' | 'VENCIDAS'): void {
    this.filtroEstado = estado;
    this.currentPage = 1;
  }

  setCurso(cursoId: number | 'TODOS'): void {
    this.selectedCursoId = cursoId;
    this.selectedModuloId = 'TODOS';
    this.moduloSearchTerm = '';
    this.currentPage = 1;
    if (cursoId === 'TODOS') {
      this.cursoSearchTerm = '';
    } else {
      const cObj = this.cursos.find(c => c.id === cursoId);
      if (cObj) this.cursoSearchTerm = cObj.nombre;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cursoId === 'TODOS' ? { cursoId: null } : { cursoId },
      queryParamsHandling: 'merge'
    });
    if (cursoId === 'TODOS') {
      this.modulos = [];
      this.cargarTodasLasTareasDocente();
    } else {
      this.cargarModulosYTareasDelCurso(cursoId);
    }
  }

  setModulo(moduloId: number | 'TODOS'): void {
    this.selectedModuloId = moduloId;
    this.currentPage = 1;
    if (moduloId === 'TODOS') {
      this.moduloSearchTerm = '';
    } else {
      const mObj = this.modulos.find(m => m.id === moduloId);
      if (mObj) this.moduloSearchTerm = `Mód ${mObj.orden}: ${mObj.nombre}`;
    }
    if (this.selectedCursoId !== 'TODOS') {
      if (moduloId === 'TODOS') {
        this.cargarTareasDeTodosLosModulos(this.selectedCursoId);
      } else {
        this.cargarTareasDeUnModulo(moduloId);
      }
    }
  }

  onCursoSelectChange(value: any): void {
    const cursoId = value === 'TODOS' ? 'TODOS' : Number(value);
    this.setCurso(cursoId);
  }

  onModuloSelectChange(value: any): void {
    const moduloId = value === 'TODOS' ? 'TODOS' : Number(value);
    this.setModulo(moduloId);
  }

  // Contadores & Métricas
  totalTareasCount = 0;
  totalEntregasPendientesCount = 0;
  totalActivasCount = 0;
  totalVencidasCount = 0;
  tasaCumplimientoPorcentaje = 0;

  // Cursos disponibles con conteo
  cursosConConteo: { id: number; nombre: string; count: number }[] = [];

  // Modal Crear/Editar Tarea
  showTareaModal = false;
  isEditMode = false;
  editingTareaId: number | null = null;
  modalModuloId: number | null = null;
  
  tareaTitulo = '';
  tareaInstrucciones = '';
  tareaFechaLimite = '';
  tareaPermitirReenvio = true;
  tareaEstado = true;
  recursosAdjuntos: TareaRecurso[] = [];

  // Formulario rápido para agregar recursos a la tarea
  nuevoRecursoTipo: 'link' | 'archivo' | 'imagen' = 'link';
  nuevoRecursoTitulo = '';
  nuevoRecursoUrl = '';
  isUploadingLocalFile = false;

  isSavingTarea = false;

  // Modal Entregas y SpeedGrader
  showEntregasModal = false;
  selectedTareaParaEntregas: DocenteTareaItemExt | null = null;
  entregas: EntregaTareaResponse[] = [];
  isLoadingEntregas = false;
  
  // SpeedGrader / Alumno Activo
  currentEntregaIndex = 0;
  calificacionInput = 20;
  feedbackInput = '';
  estadoCalificacionInput = 'APROBADO';
  isSavingCalificacion = false;

  // Plantillas de Feedback Rápido
  feedbackSnippets = [
    '¡Excelente trabajo! Cumple ampliamente con todos los criterios evaluados.',
    'Buen desarrollo y metodología. Revisa los detalles observados en la conclusión.',
    'Trabajo presentado a tiempo. Profundiza más en los fundamentos prácticos.',
    'El archivo entregado presenta observaciones. Por favor revisa y reenvía tu trabajo.',
    'No cumple con los requisitos mínimos de la práctica. Consulta las pautas de clase.'
  ];

  // Calificaciones rápidas
  quickGrades = [20, 18, 16, 14, 11, 5, 0];

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const qCursoId = params['cursoId'] ? Number(params['cursoId']) : null;
      if (qCursoId && !isNaN(qCursoId)) {
        this.selectedCursoId = qCursoId;
      }
    });
    this.cargarCursosDocente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCursosDocente(): void {
    this.isLoadingCursos = true;
    this.docenteDashboardService.getCursosAsignados().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoadingCursos = false;
        
        if (this.cursos.length > 0) {
          const paramCursoId = Number(this.route.snapshot.queryParams['cursoId']);
          const targetCurso = this.cursos.find(c => c.id === paramCursoId);
          if (targetCurso) {
            this.selectedCursoId = targetCurso.id;
            this.cursoSearchTerm = targetCurso.nombre;
            this.cargarModulosYTareasDelCurso(targetCurso.id);
          } else {
            this.selectedCursoId = this.cursos[0].id;
            this.cursoSearchTerm = this.cursos[0].nombre;
            this.cargarModulosYTareasDelCurso(this.cursos[0].id);
          }
        } else {
          this.tareas = [];
          this.calcularMetricas([]);
        }
      },
      error: () => {
        this.toastService.error('Error al cargar cursos asignados.');
        this.isLoadingCursos = false;
      }
    });
  }

  cargarModulosYTareasDelCurso(cursoId: number): void {
    this.isLoadingModulos = true;
    this.moduloService.listarModulosPorCurso(cursoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (modulosData) => {
        this.modulos = modulosData;
        this.isLoadingModulos = false;
        this.cargarTareasDeTodosLosModulos(cursoId);
      },
      error: () => {
        this.toastService.error('Error al cargar módulos del curso.');
        this.isLoadingModulos = false;
      }
    });
  }

  cargarTareasDeTodosLosModulos(cursoId: number): void {
    const cursoObj = this.cursos.find(c => c.id === cursoId);
    if (!this.modulos || this.modulos.length === 0) {
      this.tareas = [];
      this.calcularMetricas([]);
      return;
    }

    this.isLoadingTareas = true;
    const reqs = this.modulos.map(m => 
      this.tareaService.listarPorModulo(m.id).pipe(
        catchError(() => of([] as TareaResponse[]))
      )
    );

    forkJoin(reqs).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results) => {
        const allTareas: DocenteTareaItemExt[] = [];
        results.forEach((tareasList, index) => {
          const modulo = this.modulos[index];
          tareasList.forEach(t => {
            allTareas.push({
              ...t,
              cursoId: cursoId,
              cursoNombre: cursoObj ? cursoObj.nombre : undefined,
              moduloNombre: modulo.nombre,
              moduloOrden: modulo.orden
            });
          });
        });
        this.tareas = allTareas;
        this.calcularMetricas(allTareas);
        this.isLoadingTareas = false;
      },
      error: () => {
        this.isLoadingTareas = false;
        this.toastService.error('Error al cargar tareas del curso.');
      }
    });
  }

  cargarTareasDeUnModulo(moduloId: number): void {
    this.isLoadingTareas = true;
    const modulo = this.modulos.find(m => m.id === moduloId);
    const cursoObj = this.cursos.find(c => c.id === this.selectedCursoId);

    this.tareaService.listarPorModulo(moduloId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.tareas = data.map(t => ({
          ...t,
          cursoId: (this.selectedCursoId !== 'TODOS' ? this.selectedCursoId : undefined),
          cursoNombre: cursoObj ? cursoObj.nombre : undefined,
          moduloNombre: modulo ? modulo.nombre : t.moduloNombre,
          moduloOrden: modulo ? modulo.orden : t.moduloOrden
        }));
        this.calcularMetricas(this.tareas);
        this.isLoadingTareas = false;
      },
      error: () => {
        this.toastService.error('Error al cargar tareas del módulo.');
        this.isLoadingTareas = false;
      }
    });
  }

  cargarTodasLasTareasDocente(): void {
    if (this.cursos.length === 0) {
      this.tareas = [];
      this.calcularMetricas([]);
      return;
    }

    this.isLoadingTareas = true;
    const cursoReqs = this.cursos.map(c => 
      this.moduloService.listarModulosPorCurso(c.id).pipe(catchError(() => of([] as ModuloResponse[])))
    );

    forkJoin(cursoReqs).pipe(takeUntil(this.destroy$)).subscribe({
      next: (cursosModulos) => {
        const tareasReqs: any[] = [];
        const taskMetas: { cursoId: number; cursoNombre: string; moduloNombre: string; moduloOrden: number }[] = [];

        cursosModulos.forEach((mods, cIndex) => {
          const curso = this.cursos[cIndex];
          mods.forEach(m => {
            tareasReqs.push(
              this.tareaService.listarPorModulo(m.id).pipe(catchError(() => of([] as TareaResponse[])))
            );
            taskMetas.push({
              cursoId: curso.id,
              cursoNombre: curso.nombre,
              moduloNombre: m.nombre,
              moduloOrden: m.orden
            });
          });
        });

        if (tareasReqs.length === 0) {
          this.tareas = [];
          this.calcularMetricas([]);
          this.isLoadingTareas = false;
          return;
        }

        forkJoin(tareasReqs).pipe(takeUntil(this.destroy$)).subscribe({
          next: (results: any[]) => {
            const all: DocenteTareaItemExt[] = [];
            results.forEach((tList, idx) => {
              const meta = taskMetas[idx];
              (tList as TareaResponse[]).forEach(t => {
                all.push({
                  ...t,
                  cursoId: meta.cursoId,
                  cursoNombre: meta.cursoNombre,
                  moduloNombre: meta.moduloNombre,
                  moduloOrden: meta.moduloOrden
                });
              });
            });
            this.tareas = all;
            this.calcularMetricas(all);
            this.isLoadingTareas = false;
          },
          error: () => {
            this.isLoadingTareas = false;
          }
        });
      },
      error: () => {
        this.isLoadingTareas = false;
      }
    });
  }

  calcularMetricas(tareasList: DocenteTareaItemExt[]): void {
    this.totalTareasCount = tareasList.length;
    this.totalEntregasPendientesCount = 0;
    this.totalActivasCount = tareasList.filter(t => t.estado).length;
    
    const now = new Date();
    this.totalVencidasCount = tareasList.filter(t => t.fechaLimite && new Date(t.fechaLimite) < now).length;

    let totalEntregas = 0;
    tareasList.forEach(t => {
      totalEntregas += (t.totalEntregas || 0);
    });

    this.totalEntregasPendientesCount = totalEntregas;
    this.tasaCumplimientoPorcentaje = tareasList.length > 0 ? Math.min(100, Math.round((totalEntregas / (tareasList.length * 15)) * 100)) : 0;

    // Conteo por curso
    const mapCursos = new Map<number, number>();
    this.tareas.forEach(t => {
      if (t.cursoId) {
        mapCursos.set(t.cursoId, (mapCursos.get(t.cursoId) || 0) + 1);
      }
    });
    this.cursosConConteo = this.cursos.map(c => ({
      id: c.id,
      nombre: c.nombre,
      count: mapCursos.get(c.id) || 0
    }));
  }

  // FILTRADO DE TAREAS
  get tareasFiltradas(): DocenteTareaItemExt[] {
    let result = this.tareas;

    // Filtro por estado
    if (this.filtroEstado === 'ACTIVAS') {
      result = result.filter(t => t.estado);
    } else if (this.filtroEstado === 'PENDIENTES') {
      result = result.filter(t => (t.totalEntregas || 0) > 0);
    } else if (this.filtroEstado === 'VENCIDAS') {
      const now = new Date();
      result = result.filter(t => t.fechaLimite && new Date(t.fechaLimite) < now);
    }

    // Filtro de búsqueda
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        (t.titulo && t.titulo.toLowerCase().includes(q)) || 
        (t.descripcion && t.descripcion.toLowerCase().includes(q)) ||
        (t.cursoNombre && t.cursoNombre.toLowerCase().includes(q)) ||
        (t.moduloNombre && t.moduloNombre.toLowerCase().includes(q))
      );
    }

    return result;
  }

  // GESTIÓN DE RECURSOS EN TAREA (Adjuntar Links, Archivos, Imágenes)
  agregarRecursoManual(): void {
    if (!this.nuevoRecursoTitulo.trim() || !this.nuevoRecursoUrl.trim()) {
      this.toastService.warning('Ingresa un título y enlace/URL válido.');
      return;
    }

    this.recursosAdjuntos.push({
      tipo: this.nuevoRecursoTipo,
      titulo: this.nuevoRecursoTitulo.trim(),
      url: this.nuevoRecursoUrl.trim()
    });

    this.nuevoRecursoTitulo = '';
    this.nuevoRecursoUrl = '';
    this.toastService.info('Recurso adjuntado a la tarea.');
  }

  onLocalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const targetModuloId = this.modalModuloId || (this.selectedModuloId !== 'TODOS' ? this.selectedModuloId : (this.modulos[0]?.id || null));
    if (!input.files || input.files.length === 0 || !targetModuloId) {
      if (!targetModuloId) this.toastService.warning('Selecciona un módulo primero.');
      return;
    }

    const file = input.files[0];
    this.isUploadingLocalFile = true;

    this.materialService.subirMaterial(targetModuloId, `[Adjunto Tarea] ${file.name}`, file).subscribe({
      next: (mat) => {
        const isImg = file.type.startsWith('image/');
        this.recursosAdjuntos.push({
          tipo: isImg ? 'imagen' : 'archivo',
          titulo: file.name,
          url: mat.archivoUrl
        });
        this.isUploadingLocalFile = false;
        this.toastService.success(`Archivo "${file.name}" subido y adjuntado.`);
        input.value = '';
      },
      error: () => {
        this.toastService.error('Error al subir el archivo local.');
        this.isUploadingLocalFile = false;
      }
    });
  }

  eliminarRecursoAdjunto(index: number): void {
    this.recursosAdjuntos.splice(index, 1);
  }

  // SERIALIZAR / DESERIALIZAR DESCRIPCIÓN CON RECURSOS
  private serializarDescripcion(instrucciones: string, recursos: TareaRecurso[]): string {
    if (recursos.length === 0) return instrucciones;

    const payload = {
      instrucciones: instrucciones.trim(),
      recursos: recursos
    };
    return JSON.stringify(payload);
  }

  parsearDescripcion(rawDesc?: string): { instrucciones: string; recursos: TareaRecurso[] } {
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

  abrirRecurso(recurso: TareaRecurso): void {
    if (!recurso.url) return;
    if (recurso.url.startsWith('http://') || recurso.url.startsWith('https://')) {
      window.open(recurso.url, '_blank');
    } else {
      const fullUrl = `${environment.apiUrl}${recurso.url.startsWith('/') ? '' : '/'}${recurso.url}`;
      this.archivoProtegidoService.descargar(fullUrl, recurso.titulo);
    }
  }

  formatBytes(bytes?: number): string {
    return formatBytes(bytes || 0);
  }

  // MODAL CREAR / EDITAR TAREA
  abrirModalCrearTarea(): void {
    if (this.modulos.length === 0) {
      this.toastService.warning('Este curso no tiene módulos creados. Crea un módulo primero.');
      return;
    }
    this.isEditMode = false;
    this.editingTareaId = null;
    this.modalModuloId = this.selectedModuloId !== 'TODOS' ? this.selectedModuloId : this.modulos[0].id;
    this.tareaTitulo = '';
    this.tareaInstrucciones = '';
    this.tareaFechaLimite = '';
    this.tareaPermitirReenvio = true;
    this.tareaEstado = true;
    this.recursosAdjuntos = [];
    this.nuevoRecursoTitulo = '';
    this.nuevoRecursoUrl = '';
    this.showTareaModal = true;
  }

  abrirModalEditarTarea(tarea: DocenteTareaItemExt): void {
    this.isEditMode = true;
    this.editingTareaId = tarea.id;
    this.modalModuloId = tarea.moduloId || (this.selectedModuloId !== 'TODOS' ? this.selectedModuloId : (this.modulos[0]?.id || null));
    this.tareaTitulo = tarea.titulo;
    
    const parsed = this.parsearDescripcion(tarea.descripcion);
    this.tareaInstrucciones = parsed.instrucciones;
    this.recursosAdjuntos = parsed.recursos;

    this.tareaFechaLimite = tarea.fechaLimite ? tarea.fechaLimite.substring(0, 16) : '';
    this.tareaPermitirReenvio = tarea.permitirReenvio;
    this.tareaEstado = tarea.estado;
    this.showTareaModal = true;
  }

  cerrarModalTarea(): void {
    this.showTareaModal = false;
  }

  guardarTarea(): void {
    if (!this.tareaTitulo.trim()) {
      this.toastService.warning('El título de la tarea es obligatorio.');
      return;
    }

    if (!this.modalModuloId) {
      this.toastService.warning('Debes seleccionar un módulo para la tarea.');
      return;
    }

    this.isSavingTarea = true;
    const descFinal = this.serializarDescripcion(this.tareaInstrucciones, this.recursosAdjuntos);

    const req: TareaRequest = {
      moduloId: this.modalModuloId,
      titulo: this.tareaTitulo.trim(),
      descripcion: descFinal,
      fechaLimite: this.tareaFechaLimite ? new Date(this.tareaFechaLimite).toISOString() : undefined,
      permitirReenvio: this.tareaPermitirReenvio,
      estado: this.tareaEstado
    };

    if (this.isEditMode && this.editingTareaId) {
      this.tareaService.actualizar(this.editingTareaId, req).subscribe({
        next: () => {
          this.toastService.success('Tarea y recursos actualizados.');
          this.isSavingTarea = false;
          this.cerrarModalTarea();
          this.recargarTareasActuales();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al actualizar tarea.');
          this.isSavingTarea = false;
        }
      });
    } else {
      this.tareaService.crear(req).subscribe({
        next: () => {
          this.toastService.success('¡Tarea y recursos publicados con éxito!');
          this.isSavingTarea = false;
          this.cerrarModalTarea();
          this.recargarTareasActuales();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al crear tarea.');
          this.isSavingTarea = false;
        }
      });
    }
  }

  recargarTareasActuales(): void {
    if (this.selectedCursoId === 'TODOS') {
      this.cargarTodasLasTareasDocente();
    } else if (this.selectedModuloId === 'TODOS') {
      this.cargarTareasDeTodosLosModulos(this.selectedCursoId);
    } else {
      this.cargarTareasDeUnModulo(this.selectedModuloId);
    }
  }

  toggleEstadoTarea(tarea: DocenteTareaItemExt): void {
    const nuevoEstado = !tarea.estado;
    this.tareaService.cambiarEstado(tarea.id, nuevoEstado).subscribe({
      next: () => {
        tarea.estado = nuevoEstado;
        this.calcularMetricas(this.tareas);
        this.toastService.success(`Tarea ${nuevoEstado ? 'activada' : 'pausada'}.`);
      },
      error: () => {
        this.toastService.error('Error al cambiar el estado.');
      }
    });
  }

  eliminarTarea(tarea: DocenteTareaItemExt): void {
    if (!confirm(`¿Eliminar la tarea "${tarea.titulo}"?`)) return;
    this.tareaService.eliminar(tarea.id).subscribe({
      next: () => {
        this.toastService.success('Tarea eliminada.');
        this.recargarTareasActuales();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Error al eliminar.');
      }
    });
  }

  // SPEEDGRADER / REVISIÓN DE ENTREGAS
  abrirModalEntregas(tarea: DocenteTareaItemExt): void {
    this.selectedTareaParaEntregas = tarea;
    this.showEntregasModal = true;
    this.currentEntregaIndex = 0;
    this.cargarEntregas(tarea.id);
  }

  cerrarModalEntregas(): void {
    this.showEntregasModal = false;
    this.selectedTareaParaEntregas = null;
    this.entregas = [];
  }

  cargarEntregas(tareaId: number): void {
    this.isLoadingEntregas = true;
    this.entregaTareaService.listarEntregasPorTarea(tareaId).subscribe({
      next: (data) => {
        this.entregas = data;
        this.isLoadingEntregas = false;
        if (this.entregas.length > 0) {
          this.seleccionarEntrega(0);
        }
      },
      error: () => {
        this.toastService.error('Error al cargar entregas.');
        this.isLoadingEntregas = false;
      }
    });
  }

  get currentEntrega(): EntregaTareaResponse | null {
    if (this.entregas.length === 0 || this.currentEntregaIndex < 0 || this.currentEntregaIndex >= this.entregas.length) {
      return null;
    }
    return this.entregas[this.currentEntregaIndex];
  }

  seleccionarEntrega(index: number): void {
    this.currentEntregaIndex = index;
    const e = this.currentEntrega;
    if (e) {
      this.calificacionInput = e.calificacion ?? 20;
      this.feedbackInput = e.feedbackDocente ?? '';
      this.estadoCalificacionInput = e.estado || (this.calificacionInput >= 13 ? 'APROBADO' : 'DESAPROBADO');
    }
  }

  siguienteEntrega(): void {
    if (this.currentEntregaIndex < this.entregas.length - 1) {
      this.seleccionarEntrega(this.currentEntregaIndex + 1);
    }
  }

  anteriorEntrega(): void {
    if (this.currentEntregaIndex > 0) {
      this.seleccionarEntrega(this.currentEntregaIndex - 1);
    }
  }

  setQuickGrade(grade: number): void {
    this.calificacionInput = grade;
    this.estadoCalificacionInput = grade >= 13 ? 'APROBADO' : 'DESAPROBADO';
  }

  insertFeedbackSnippet(snippet: string): void {
    if (this.feedbackInput.trim()) {
      this.feedbackInput += ' ' + snippet;
    } else {
      this.feedbackInput = snippet;
    }
  }

  guardarCalificacionActual(): void {
    const e = this.currentEntrega;
    if (!e) return;

    if (this.calificacionInput < 0 || this.calificacionInput > 20) {
      this.toastService.warning('La nota debe estar entre 0 y 20.');
      return;
    }

    this.isSavingCalificacion = true;
    const req: CalificarEntregaRequest = {
      calificacion: Number(this.calificacionInput),
      feedbackDocente: this.feedbackInput.trim() || undefined,
      estado: this.estadoCalificacionInput
    };

    this.entregaTareaService.calificarEntrega(e.id, req).subscribe({
      next: (updated) => {
        this.toastService.success(`Calificación guardada para ${e.alumnoNombre}.`);
        e.calificacion = updated.calificacion;
        e.feedbackDocente = updated.feedbackDocente;
        e.estado = updated.estado;
        e.fechaCalificacion = updated.fechaCalificacion;
        this.isSavingCalificacion = false;

        // Auto-avanzar al siguiente alumno si existe
        if (this.currentEntregaIndex < this.entregas.length - 1) {
          this.siguienteEntrega();
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Error al guardar calificación.');
        this.isSavingCalificacion = false;
      }
    });
  }

  descargarArchivoEntrega(e: EntregaTareaResponse): void {
    this.entregaTareaService.descargarArchivo(e.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entrega_${e.alumnoNombre.replace(/\s+/g, '_')}_tarea_${e.tareaId}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastService.error('Error al descargar el archivo.');
      }
    });
  }

  // EXPORTAR ACTA DE NOTAS A CSV
  exportarActaNotasCSV(): void {
    if (this.entregas.length === 0) {
      this.toastService.warning('No hay entregas para exportar en esta tarea.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Alumno,Correo,Fecha Entrega,Nota (0-20),Estado,Feedback Docente\n';

    this.entregas.forEach(e => {
      const row = [
        e.id,
        `"${e.alumnoNombre}"`,
        `"${e.alumnoCorreo}"`,
        `"${e.fechaEntrega}"`,
        e.calificacion ?? 'Sin calificar',
        `"${e.estado}"`,
        `"${(e.feedbackDocente || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `acta_notas_tarea_${this.selectedTareaParaEntregas?.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.success('Acta de notas exportada en CSV.');
  }
}
