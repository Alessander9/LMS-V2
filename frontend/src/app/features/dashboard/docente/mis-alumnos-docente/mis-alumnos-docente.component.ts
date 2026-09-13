import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../../../../core/components/skeleton-loader/skeleton-loader.component';
import { DocenteDashboardService, DocenteEstudianteProgress } from '../../../../core/services/';
import { CursoService } from '../../../../core/services/';
import { CursoResponse, ModuloAccesoItem } from '../../../../core/models/';
import { FormsModule } from '@angular/forms';
import { matchesQuery, paginate, sortByDate, totalPages, SortOrder } from '../../../../core/utils/';

import { MatriculaService } from '../../../../core/services/';
import { ToastService } from '../../../../core/services/';

@Component({
  selector: 'app-mis-alumnos-docente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './mis-alumnos-docente.component.html',
  styleUrls: ['./mis-alumnos-docente.component.css']
})
export class MisAlumnosDocenteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private docenteService = inject(DocenteDashboardService);
  private cursoService = inject(CursoService);
  private matriculaService = inject(MatriculaService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  cursoId = 0;
  curso: CursoResponse | null = null;
  estudiantes: DocenteEstudianteProgress[] = [];
  isLoading = true;
  searchTerm = '';
  dateSortOrder: SortOrder = 'desc';
  currentPage = 1;
  pageSize = 10;

  // Modal Control de Acceso Modular
  showModulosModal = false;
  selectedEstudiante: DocenteEstudianteProgress | null = null;
  modulosAcceso: ModuloAccesoItem[] = [];
  loadingModulos = false;
  isSavingModulos = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.cursoId = +idParam;
        this.loadCurso();
        this.loadEstudiantes();
      }
    });
  }

  loadCurso(): void {
    this.cursoService.obtenerCurso(this.cursoId).subscribe({
      next: (data) => {
        this.curso = data;
      },
      error: (err) => {
        console.error('Error fetching course detail:', err);
      }
    });
  }

  loadEstudiantes(): void {
    this.docenteService.getAlumnosCurso(this.cursoId).subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredEstudiantes(): DocenteEstudianteProgress[] {
    const matches = this.estudiantes.filter(estudiante =>
      matchesQuery([
        estudiante.nombres,
        estudiante.apellidos,
        estudiante.correo,
        estudiante.fechaActualizacion
      ], this.searchTerm)
    );
    return sortByDate(matches, estudiante => estudiante.fechaActualizacion, this.dateSortOrder);
  }

  get totalPages(): number {
    return totalPages(this.filteredEstudiantes.length, this.pageSize);
  }

  get pagedEstudiantes(): DocenteEstudianteProgress[] {
    return paginate(this.filteredEstudiantes, this.currentPage, this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  toggleDateSort(): void {
    this.dateSortOrder = this.dateSortOrder === 'desc' ? 'asc' : 'desc';
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // --- Modal de Acceso a Módulos por Cuotas ---
  abrirModalModulos(estudiante: DocenteEstudianteProgress): void {
    if (!estudiante.matriculaId) {
      this.toastService.warning('Este estudiante no cuenta con ID de matrícula asociado.');
      return;
    }
    this.selectedEstudiante = estudiante;
    this.showModulosModal = true;
    this.loadingModulos = true;
    this.modulosAcceso = [];

    this.matriculaService.obtenerModulosAcceso(estudiante.matriculaId).subscribe({
      next: (data) => {
        this.modulosAcceso = data || [];
        this.loadingModulos = false;
      },
      error: (err) => {
        this.loadingModulos = false;
        this.toastService.error('Error al cargar permisos de módulos: ' + (err.error?.message || err.message));
      }
    });
  }

  cerrarModalModulos(): void {
    this.showModulosModal = false;
    this.selectedEstudiante = null;
    this.modulosAcceso = [];
  }

  toggleModuloAcceso(item: ModuloAccesoItem): void {
    if (!this.selectedEstudiante?.matriculaId) return;
    const nuevoEstado = !item.habilitado;

    this.matriculaService.cambiarAccesoModulo(this.selectedEstudiante.matriculaId, item.moduloId, nuevoEstado).subscribe({
      next: () => {
        item.habilitado = nuevoEstado;
        this.toastService.success(`Módulo ${nuevoEstado ? 'habilitado' : 'bloqueado'} con éxito.`);
      },
      error: (err) => {
        this.toastService.error('Error al actualizar acceso: ' + (err.error?.message || err.message));
      }
    });
  }

  habilitarTodosModulos(habilitar: boolean): void {
    if (!this.selectedEstudiante?.matriculaId) return;
    this.isSavingModulos = true;
    const habilitadosIds = habilitar ? this.modulosAcceso.map(m => m.moduloId) : [];

    this.matriculaService.guardarModulosAccesoMasivo(this.selectedEstudiante.matriculaId, habilitadosIds).subscribe({
      next: () => {
        this.modulosAcceso.forEach(m => m.habilitado = habilitar);
        this.isSavingModulos = false;
        this.toastService.success(`Todos los módulos han sido ${habilitar ? 'habilitados' : 'bloqueados'}.`);
      },
      error: (err) => {
        this.isSavingModulos = false;
        this.toastService.error('Error al actualizar permisos en masa: ' + (err.error?.message || err.message));
      }
    });
  }

  descargarFichaDocente(estudiante: DocenteEstudianteProgress): void {
    if (!estudiante.matriculaId) {
      this.toastService.warning('No se encontró el identificador de matrícula para este estudiante.');
      return;
    }
    const cleanName = `${estudiante.nombres}_${estudiante.apellidos}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `ficha-matricula-${cleanName}.pdf`;
    this.toastService.info('Generando ficha consolidada en PDF...');
    
    this.matriculaService.descargarPdfMatricula(estudiante.matriculaId).subscribe({
      next: (blob) => {
        this.matriculaService.guardarArchivoPdf(blob, filename);
        this.toastService.success('Ficha de matrícula descargada con éxito.');
      },
      error: (err) => {
        console.error('Error al descargar ficha de matrícula:', err);
        this.toastService.error('Error al descargar la ficha: ' + (err.error?.message || err.message || 'Error del servidor'));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/mis-cursos-docente']);
  }
}
