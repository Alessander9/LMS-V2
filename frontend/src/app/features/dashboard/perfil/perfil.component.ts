import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AlumnoDashboardService, ToastService } from '../../../core/services/';
import { UserProfile } from '../../../core/models/';
import { AlumnoCurso } from '../../../core/services/';
import { FormsModule } from '@angular/forms';
import { matchesQuery, paginate, sortByDate, totalPages, SortOrder } from '../../../core/utils/';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(AlumnoDashboardService);
  private toastService = inject(ToastService);

  profile: UserProfile | null = null;
  isLoading = true;
  metrics: any = null;
  recentCursos: AlumnoCurso[] = [];
  cursosSearch = '';
  cursosSortOrder: SortOrder = 'desc';
  cursosPage = 1;
  cursosPageSize = 3;

  // Change Password fields
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  isSavingPassword = false;
  passwordError = '';
  
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmNewPassword = true;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        

        if (data.rol === 'ALUMNO') {
          this.loadStudentMetrics();
          this.loadRecentCursos();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.isLoading = false;
      }
    });
  }

  loadStudentMetrics(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (metricsData) => {
        this.metrics = metricsData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading student metrics:', err);
        this.isLoading = false;
      }
    });
  }

  loadRecentCursos(): void {
    this.dashboardService.getEnrolledCursos().subscribe({
      next: (cursos) => {
        this.recentCursos = cursos || [];
      },
      error: (err) => {
        console.error('Error loading enrolled courses:', err);
      }
    });
  }

  get filteredRecentCursos(): AlumnoCurso[] {
    const matches = this.recentCursos.filter(curso =>
      matchesQuery([curso.nombre, curso.descripcion, curso.nivelSuscripcion, curso.fechaMatricula], this.cursosSearch)
    );
    return sortByDate(matches, curso => curso.fechaMatricula, this.cursosSortOrder);
  }

  get totalRecentPages(): number {
    return totalPages(this.filteredRecentCursos.length, this.cursosPageSize);
  }

  get pagedRecentCursos(): AlumnoCurso[] {
    return paginate(this.filteredRecentCursos, this.cursosPage, this.cursosPageSize);
  }

  onCursosSearchChange(): void {
    this.cursosPage = 1;
  }

  toggleCursosSort(): void {
    this.cursosSortOrder = this.cursosSortOrder === 'desc' ? 'asc' : 'desc';
    this.cursosPage = 1;
  }

  previousCursosPage(): void {
    if (this.cursosPage > 1) this.cursosPage--;
  }

  nextCursosPage(): void {
    if (this.cursosPage < this.totalRecentPages) this.cursosPage++;
  }

  onChangePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError = 'Por favor complete todos los campos';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'La nueva contraseña y la confirmación no coinciden';
      return;
    }

    this.passwordError = '';
    this.isSavingPassword = true;

    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.isSavingPassword = false;
        this.toastService.success(res.mensaje || 'Contraseña cambiada exitosamente.');
        this.currentPassword = this.newPassword;
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordError = err.error?.message || 'Error al cambiar la contraseña. Verifique sus datos.';
        this.toastService.error(this.passwordError, 'Fallo de Cambio de Contraseña');
      }
    });
  }
}
