import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../../../../core/components/skeleton-loader/skeleton-loader.component';
import { DocenteDashboardService, DocenteCurso } from '../../../../core/services/';
import { FormsModule } from '@angular/forms';
import { matchesQuery, paginate, sortByDate, totalPages, SortOrder } from '../../../../core/utils/';

@Component({
  selector: 'app-mis-cursos-docente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './mis-cursos-docente.component.html',
  styleUrls: ['./mis-cursos-docente.component.css']
})
export class MisCursosDocenteComponent implements OnInit {
  private docenteService = inject(DocenteDashboardService);
  private router = inject(Router);

  cursos: DocenteCurso[] = [];
  isLoading = true;
  searchTerm = '';
  dateSortOrder: SortOrder = 'desc';
  currentPage = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.docenteService.getCursosAsignados().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching assigned courses:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredCursos(): DocenteCurso[] {
    const matches = this.cursos.filter(curso =>
      matchesQuery([
        curso.nombre,
        curso.descripcion,
        curso.docenteNombre,
        curso.fechaCreacion
      ], this.searchTerm)
    );
    return sortByDate(matches, curso => curso.fechaCreacion, this.dateSortOrder);
  }

  get totalPages(): number {
    return totalPages(this.filteredCursos.length, this.pageSize);
  }

  get pagedCursos(): DocenteCurso[] {
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

  manageContent(courseId: number): void {
    this.router.navigate(['/dashboard/cursos', courseId]);
  }

  viewStudents(courseId: number): void {
    this.router.navigate(['/dashboard/mis-alumnos-docente', courseId]);
  }
}
