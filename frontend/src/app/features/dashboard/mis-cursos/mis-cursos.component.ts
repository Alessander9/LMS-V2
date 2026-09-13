import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { AlumnoDashboardService, AlumnoCurso, AlumnoPlayCourse, AlumnoPlayModulo, AlumnoPlayVideo } from '../../../core/services/';
import { FormsModule } from '@angular/forms';
import { matchesQuery, paginate, sortByDate, totalPages, SortOrder } from '../../../core/utils/';

import { MatriculaService } from '../../../core/services/';
import { ToastService } from '../../../core/services/';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './mis-cursos.component.html',
  styleUrls: ['./mis-cursos.component.css']
})
export class MisCursosComponent implements OnInit {
  private studentService = inject(AlumnoDashboardService);
  private matriculaService = inject(MatriculaService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  cursos: AlumnoCurso[] = [];
  isLoading = true;
  searchTerm = '';
  showVerCursoModal = false;
  selectedCursoPlay: AlumnoPlayCourse | null = null;
  expandedModuloId: number | null = null;
  isLoadingCursoDetalle = false;
  dateSortOrder: SortOrder = 'desc';
  currentPage = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.studentService.getEnrolledCursos().subscribe({
      next: (data) => {
        this.cursos = (data || []).filter(c => !c.nombre?.toLowerCase().includes('excel'));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching enrolled courses:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredCursos(): AlumnoCurso[] {
    const matches = this.cursos.filter(curso =>
      matchesQuery([
        curso.nombre,
        curso.descripcion,
        curso.nivelSuscripcion,
        curso.fechaMatricula
      ], this.searchTerm)
    );
    return sortByDate(matches, curso => curso.fechaMatricula, this.dateSortOrder);
  }

  get totalPages(): number {
    return totalPages(this.filteredCursos.length, this.pageSize);
  }

  get pagedCursos(): AlumnoCurso[] {
    return paginate(this.filteredCursos, this.currentPage, this.pageSize);
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

  continueCourse(courseId: number): void {
    this.router.navigate(['/dashboard/cursos-play', courseId]);
  }

  verCurso(cursoId: number): void {
    this.isLoadingCursoDetalle = true;
    this.showVerCursoModal = true;
    this.expandedModuloId = null;
    this.studentService.getPlayCourse(cursoId).subscribe({
      next: (data) => {
        if (data && data.modulos) {
          data.modulos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
          data.modulos.forEach(mod => {
            if (mod.videos) {
              mod.videos.sort((a, b) => {
                if (a.orden !== b.orden) {
                  return (a.orden || 0) - (b.orden || 0);
                }
                return a.titulo.localeCompare(b.titulo, undefined, { numeric: true, sensitivity: 'base' });
              });
            }
          });
        }
        this.selectedCursoPlay = data;
        this.isLoadingCursoDetalle = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle del curso:', err);
        this.isLoadingCursoDetalle = false;
        this.showVerCursoModal = false;
      }
    });
  }

  cerrarModal(): void {
    this.showVerCursoModal = false;
    this.selectedCursoPlay = null;
    this.expandedModuloId = null;
  }

  toggleModuloAccordion(moduloId: number): void {
    if (this.expandedModuloId === moduloId) {
      this.expandedModuloId = null;
    } else {
      this.expandedModuloId = moduloId;
    }
  }

  irAlCurso(cursoId: number, videoId?: number): void {
    this.router.navigate(['/dashboard/cursos-play', cursoId], {
      queryParams: videoId ? { videoId } : {}
    });
    this.cerrarModal();
  }

  descargarMiFicha(curso: { id: number; nombre: string }, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const cleanName = curso.nombre.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `ficha-matricula-${cleanName}.pdf`;
    this.toastService.info('Generando tu Ficha Consolidada de Matrícula...');
    
    this.matriculaService.descargarMiFichaPorCurso(curso.id).subscribe({
      next: (blob) => {
        this.matriculaService.guardarArchivoPdf(blob, filename);
        this.toastService.success('Ficha de matrícula descargada con éxito.');
      },
      error: (err) => {
        console.error('Error al descargar ficha de matrícula:', err);
        this.toastService.error('Error al descargar la ficha: ' + (err.error?.message || err.message || 'Error en el servidor'));
      }
    });
  }

  protected readonly Object = Object;
  protected readonly Math = Math;
}
