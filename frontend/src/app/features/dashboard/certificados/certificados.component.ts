import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { AlumnoDashboardService, AlumnoCertificado } from '../../../core/services/';
import { CertificadoResponse, CertificadoService } from '../../../core/services/';
import { AuthService } from '../../../core/services/';
import { ReportesService } from '../../../core/services/';
import { ArchivoProtegidoService } from '../../../core/services/';

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  templateUrl: './certificados.component.html',
  styleUrls: ['./certificados.component.css']
})
export class CertificadosComponent implements OnInit {
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private authService = inject(AuthService);
  private reportesService = inject(ReportesService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private sanitizer = inject(DomSanitizer);

  certificados: Array<AlumnoCertificado | CertificadoResponse> = [];
  filteredCertificados: Array<AlumnoCertificado | CertificadoResponse> = [];
  adminTotalElements = 0;
  isLoading = true;
  isAdmin = false;
  selectedCertificado: AlumnoCertificado | CertificadoResponse | null = null;
  showModal = false;
  previewPdfUrl: string | null = null;
  isPreviewLoading = false;
  searchTerm = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  readonly pageSizeOptions = [5, 10, 20];

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.loadCertificados();
  }

  private loadCertificados(): void {
    if (this.isAdmin) {
      this.certificadoService.listarCertificados(this.currentPage - 1, this.pageSize, this.searchTerm, `fechaEmision,${this.dateSortOrder}`).subscribe({
        next: (data) => {
          this.certificados = data.content ?? [];
          this.filteredCertificados = this.certificados;
          this.adminTotalElements = data.totalElements ?? this.certificados.length;
          this.totalPages = Math.max(1, Math.ceil(this.adminTotalElements / this.pageSize));
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          console.error('Error fetching certificates:', err);
          this.isLoading = false;
        }
      });
      return;
    }

    this.studentService.getCertificados().subscribe({
      next: (data) => {
        this.certificados = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Error fetching certificates:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    if (this.isAdmin) {
      this.loadCertificados();
    } else {
      this.applyFilters();
    }
  }

  onPageSizeChange(value: string): void {
    this.pageSize = Number(value);
    this.currentPage = 1;
    if (this.isAdmin) {
      this.loadCertificados();
    } else {
      this.applyFilters();
    }
  }

  onDateSortChange(value: string): void {
    this.dateSortOrder = value === 'asc' ? 'asc' : 'desc';
    this.currentPage = 1;
    if (this.isAdmin) {
      this.loadCertificados();
    } else {
      this.applyFilters();
    }
  }

  get pagedCertificados(): Array<AlumnoCertificado | CertificadoResponse> {
    if (this.isAdmin) {
      return this.filteredCertificados;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCertificados.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.isAdmin ? this.adminTotalElements : this.filteredCertificados.length;
  }

  get hasResults(): boolean {
    return this.filteredCertificados.length > 0;
  }

  get pageStart(): number {
    if (!this.hasResults) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.isAdmin) this.loadCertificados();
      else this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.isAdmin) this.loadCertificados();
      else this.applyFilters();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.isAdmin) this.loadCertificados();
      else this.applyFilters();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    if (this.isAdmin) {
      this.loadCertificados();
    } else {
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    if (this.isAdmin) {
      return;
    }

    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCertificados = this.certificados.filter((cert) => {
      if (!term) return true;

      const alumno = `${this.getAlumnoNombre(cert)} ${this.getAlumnoCorreo(cert)}`.toLowerCase();
      const curso = this.getCursoNombre(cert).toLowerCase();
      const codigo = cert.codigo.toLowerCase();
      const registro = 'numeroRegistro' in cert && cert.numeroRegistro
        ? cert.numeroRegistro.toLowerCase()
        : '';
      const fecha = `${cert.fechaEmision ?? ''}`.toLowerCase();

      return [alumno, curso, codigo, registro, fecha].some((field) => field.includes(term));
    });

    this.filteredCertificados.sort((a, b) => {
      const dateA = new Date(a.fechaEmision ?? '').getTime();
      const dateB = new Date(b.fechaEmision ?? '').getTime();
      const normalizedA = Number.isNaN(dateA) ? 0 : dateA;
      const normalizedB = Number.isNaN(dateB) ? 0 : dateB;
      return this.dateSortOrder === 'asc'
        ? normalizedA - normalizedB
        : normalizedB - normalizedA;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredCertificados.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  getAlumnoNombre(cert: AlumnoCertificado | CertificadoResponse): string {
    return (cert as CertificadoResponse).alumnoNombre || 'N/D';
  }

  getAlumnoCorreo(cert: AlumnoCertificado | CertificadoResponse): string {
    return (cert as CertificadoResponse).alumnoCorreo || 'N/D';
  }

  getCursoNombre(cert: AlumnoCertificado | CertificadoResponse): string {
    return (cert as CertificadoResponse).cursoNombre || (cert as AlumnoCertificado).cursoNombre || 'N/D';
  }

  exportarCSV(): void {
    this.reportesService.exportarCertificados().subscribe({
      error: (err) => {
        console.error('Error al exportar certificados:', err);
      }
    });
  }

  openVerModal(cert: AlumnoCertificado | CertificadoResponse): void {
    this.selectedCertificado = cert;
    this.showModal = true;
    this.previewPdfUrl = null;
    this.isPreviewLoading = true;

    this.archivoProtegidoService.obtenerBlob(cert.archivoPdf).subscribe({
      next: (blob) => {
        this.previewPdfUrl = URL.createObjectURL(blob);
        this.isPreviewLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la vista previa del certificado:', err);
        this.isPreviewLoading = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCertificado = null;
    if (this.previewPdfUrl) {
      URL.revokeObjectURL(this.previewPdfUrl);
      this.previewPdfUrl = null;
    }
    this.isPreviewLoading = false;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  descargarCertificado(cert: AlumnoCertificado | CertificadoResponse): void {
    this.archivoProtegidoService.descargar(cert.archivoPdf, `certificado-${cert.codigo}.pdf`).subscribe({
      error: (err) => console.error('Error al descargar certificado:', err)
    });
  }
}
