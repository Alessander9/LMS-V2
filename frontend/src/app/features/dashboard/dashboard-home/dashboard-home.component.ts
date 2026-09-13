import { environment } from '../../../../environments/environment';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlumnoService, DocenteDashboardService, DocenteCurso } from '../../../core/services/';
import { CursoService } from '../../../core/services/';
import { AuthService } from '../../../core/services/';
import { AlumnoDashboardService } from '../../../core/services/';
import { CertificadoService } from '../../../core/services/';
import { AuditoriaService } from '../../../core/services/';
import { PagoService } from '../../../core/services/';
import { UserProfile } from '../../../core/models/';
import { AlumnoResponse } from '../../../core/models/';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  private authService = inject(AuthService);
  private alumnoService = inject(AlumnoService);
  private cursoService = inject(CursoService);
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private auditoriaService = inject(AuditoriaService);
  private pagoService = inject(PagoService);
  private docenteDashboardService = inject(DocenteDashboardService);
  private http = inject(HttpClient);

  profile: UserProfile | null = null;
  isLoading = true;

  // Admin stats
  totalAlumnos = 0;
  totalCursos = 0;
  totalCertificados = 0;
  systemStatus: any = null;
  recentLogins: any[] = [];
  pendingPayments: any[] = [];
  coursesList: any[] = [];
  recentEvents: any[] = [];
  planStats: any[] = [];

  // Student stats
  studentCursosInscritos = 0;
  studentCursosCompletados = 0;
  studentCertificados = 0;
  studentCursos: any[] = [];

  // Docente stats
  docenteCursos: DocenteCurso[] = [];
  docenteTotalAlumnos = 0;
  docenteTotalCursos = 0;
  docenteCursosActivos = 0;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profile = user;
        if (user.rol === 'ADMINISTRADOR') {
          this.loadAdminStats();
        } else if (user.rol === 'DOCENTE') {
          this.loadDocenteStats();
        } else {
          this.loadStudentStats();
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.isLoading = false;
      }
    });
  }

  loadAdminStats(): void {
    this.isLoading = true;

    // Load Alumnos
    this.alumnoService.listarAlumnos(0, 1, '', 'fechaRegistro,desc', true).subscribe({
      next: (alumnos) => {
        const total = alumnos.totalElements ?? alumnos.content?.length ?? 0;
        this.totalAlumnos = total;
        this.alumnoService.listarAlumnos(0, Math.max(total, 1), '', 'fechaRegistro,desc', true).subscribe({
          next: (fullAlumnos) => {
            const alumnosList = fullAlumnos.content ?? [];
            const counts = { BASICO: 0, INTERMEDIO: 0, PREMIUM: 0 };
            alumnosList.forEach((alumno: AlumnoResponse) => {
              const sub = alumno.nivelSuscripcion || 'BASICO';
              if (sub in counts) {
                counts[sub as keyof typeof counts]++;
              } else {
                (counts as any)[sub] = ((counts as any)[sub] || 0) + 1;
              }
            });

            this.planStats = [
              { 
                name: 'BASICO', 
                count: counts.BASICO, 
                percentage: total > 0 ? Math.round((counts.BASICO / total) * 100) : 0,
                cssClass: 'bg-slate-50 text-slate-700 border border-slate-200', 
                barClass: 'bg-slate-400',
                icon: 'person' 
              },
              { 
                name: 'INTERMEDIO', 
                count: counts.INTERMEDIO, 
                percentage: total > 0 ? Math.round((counts.INTERMEDIO / total) * 100) : 0,
                cssClass: 'bg-blue-50 text-blue-700 border border-blue-200', 
                barClass: 'bg-blue-500',
                icon: 'school' 
              },
              { 
                name: 'PREMIUM', 
                count: counts.PREMIUM, 
                percentage: total > 0 ? Math.round((counts.PREMIUM / total) * 100) : 0,
                cssClass: 'bg-amber-50 text-amber-800 border border-amber-200', 
                barClass: 'bg-amber-500',
                icon: 'workspace_premium' 
              }
            ];
          }
        });
      }
    });

    // Load Cursos
    this.cursoService.listarCursos(0, 1, '', 'fechaCreacion,desc').subscribe({
      next: (cursos) => {
        const total = cursos.totalElements ?? cursos.content?.length ?? 0;
        this.totalCursos = total;
        this.cursoService.listarCursos(0, Math.max(total, 1), '', 'fechaCreacion,desc').subscribe({
          next: (fullCursos) => {
            const cursosList = fullCursos.content ?? [];
            this.coursesList = cursosList.slice(0, 5); // top 5 courses to display
          }
        });
      }
    });

    // Load Certificados
    this.certificadoService.listarCertificados(0, 1).subscribe({
      next: (certs) => {
        this.totalCertificados = certs.totalElements ?? certs.content?.length ?? 0;
      }
    });

    // Load System status
    this.http.get<any>(environment.apiUrl + '/sistema/status').subscribe({
      next: (status) => {
        this.systemStatus = status;
      }
    });

    // Load Pending Payments
    this.pagoService.listarPagosPendientes().subscribe({
      next: (pagos) => {
        this.pendingPayments = pagos || [];
      }
    });

    // Load System events
    this.auditoriaService.getEventosSistema().subscribe({
      next: (events) => {
        this.recentEvents = (events || []).slice(0, 5);
      }
    });

    // Load Login audits
    this.auditoriaService.getLoginAuditoria().subscribe({
      next: (logins) => {
        this.recentLogins = (logins || []).slice(0, 5);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading audits:', err);
        this.isLoading = false;
      }
    });
  }

  aprobarPago(id: number): void {
    if (confirm('¿Confirmas la verificación del depósito y la activación de la suscripción del alumno?')) {
      this.pagoService.aprobarPago(id).subscribe({
        next: (res) => {
          alert(res.mensaje || 'Pago verificado y suscripción actualizada con éxito.');
          this.loadAdminStats();
        },
        error: (err) => {
          console.error('Error approving payment:', err);
          alert(err.error?.error || 'No se pudo aprobar el pago.');
        }
      });
    }
  }

  loadDocenteStats(): void {
    this.isLoading = true;

    this.docenteDashboardService.getCursosAsignados().subscribe({
      next: (cursos) => {
        this.docenteCursos = cursos || [];
        this.docenteTotalCursos = this.docenteCursos.length;
        this.docenteCursosActivos = this.docenteCursos.filter(c => c.estado).length;

        // Sumar total de alumnos de todos los cursos
        let totalAlumnos = 0;
        let cursosProcesados = 0;
        if (this.docenteCursos.length === 0) {
          this.isLoading = false;
          return;
        }
        this.docenteCursos.forEach(curso => {
          this.docenteDashboardService.getAlumnosCurso(curso.id).subscribe({
            next: (alumnos) => {
              totalAlumnos += (alumnos || []).length;
              cursosProcesados++;
              if (cursosProcesados >= this.docenteCursos.length) {
                this.docenteTotalAlumnos = totalAlumnos;
                this.isLoading = false;
              }
            },
            error: () => {
              cursosProcesados++;
              if (cursosProcesados >= this.docenteCursos.length) {
                this.docenteTotalAlumnos = totalAlumnos;
                this.isLoading = false;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading docente stats:', err);
        this.isLoading = false;
      }
    });
  }

  loadStudentStats(): void {
    this.isLoading = true;
    this.studentService.getMetrics().subscribe({
      next: (metrics) => {
        this.studentCursosInscritos = metrics.cursosInscritos;
        this.studentCursosCompletados = metrics.cursosCompletados;
        this.studentCertificados = metrics.certificados;
        
        // Fetch enrolled courses for display on home dashboard
        this.studentService.getEnrolledCursos().subscribe({
          next: (cursos) => {
            this.studentCursos = (cursos || []).filter(c => !c.nombre?.toLowerCase().includes('excel')).slice(0, 3); // top 3 courses
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading enrolled courses:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading student metrics:', err);
        this.isLoading = false;
      }
    });
  }
}
