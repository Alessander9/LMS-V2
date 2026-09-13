import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicoService } from '../../../core/services/academico.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  EstudianteResponse,
  RegistroEstudianteRequest,
  CarnetEstudianteQrResponse,
  PeriodoAcademico,
  SeccionGrado
} from '../../../core/models/academico.model';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.component.html',
  styleUrls: ['./gestion-estudiantes.component.css']
})
export class GestionEstudiantesComponent implements OnInit {
  private academicoService = inject(AcademicoService);
  private toast = inject(ToastService);

  estudiantes: EstudianteResponse[] = [];
  periodos: PeriodoAcademico[] = [];
  secciones: SeccionGrado[] = [];

  filtroTexto: string = '';
  filtroSeccionId: number | null = null;

  // Modal Registro
  modalRegistroAbierto: boolean = false;
  nuevoEstudiante: RegistroEstudianteRequest = {
    nombres: '',
    apellidos: '',
    dni: '',
    correo: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'MASCULINO',
    direccion: '',
    nombreApoderado: '',
    telefonoApoderado: '',
    parentescoApoderado: 'PADRE',
    seccionGradoId: undefined,
    periodoAcademicoId: undefined
  };

  // Modal Carnet Digital QR
  modalCarnetAbierto: boolean = false;
  carnetSeleccionado: CarnetEstudianteQrResponse | null = null;

  cargando: boolean = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.academicoService.listarPeriodos().subscribe({
      next: (periodos) => {
        this.periodos = periodos;
        if (periodos.length > 0) {
          this.nuevoEstudiante.periodoAcademicoId = periodos[0].id;
        }
      }
    });

    this.academicoService.listarSecciones().subscribe({
      next: (secciones) => {
        this.secciones = secciones;
        if (secciones.length > 0) {
          this.nuevoEstudiante.seccionGradoId = secciones[0].id;
        }
      }
    });

    this.academicoService.listarEstudiantes().subscribe({
      next: (estudiantes) => {
        this.estudiantes = estudiantes;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  buscarEstudiantes(): void {
    this.academicoService.listarEstudiantes(this.filtroTexto).subscribe({
      next: (res) => {
        this.estudiantes = res;
      }
    });
  }

  guardarEstudiante(): void {
    if (!this.nuevoEstudiante.nombres.trim() || !this.nuevoEstudiante.apellidos.trim() || !this.nuevoEstudiante.dni.trim()) {
      this.toast.error('Nombres, Apellidos y DNI son campos obligatorios.');
      return;
    }

    this.academicoService.registrarEstudiante(this.nuevoEstudiante).subscribe({
      next: (res) => {
        this.toast.success(`Estudiante ${res.nombres} ${res.apellidos} registrado exitosamente.`);
        this.modalRegistroAbierto = false;
        this.nuevoEstudiante = {
          nombres: '',
          apellidos: '',
          dni: '',
          correo: '',
          telefono: '',
          fechaNacimiento: '',
          genero: 'MASCULINO',
          direccion: '',
          nombreApoderado: '',
          telefonoApoderado: '',
          parentescoApoderado: 'PADRE',
          seccionGradoId: this.secciones.length > 0 ? this.secciones[0].id : undefined,
          periodoAcademicoId: this.periodos.length > 0 ? this.periodos[0].id : undefined
        };
        this.cargarDatos();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al registrar estudiante.');
      }
    });
  }

  verCarnetQr(estudianteId: number): void {
    this.academicoService.obtenerCarnetQr(estudianteId).subscribe({
      next: (res) => {
        this.carnetSeleccionado = res;
        this.modalCarnetAbierto = true;
      },
      error: () => {
        this.toast.error('No se pudo obtener el carnet digital QR.');
      }
    });
  }

  imprimirCarnet(): void {
    window.print();
  }

  get estudiantesFiltrados(): EstudianteResponse[] {
    return this.estudiantes.filter(e => {
      const matchSearch = !this.filtroTexto.trim() ||
        e.nombres.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        e.apellidos.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        e.dni.includes(this.filtroTexto) ||
        e.codigoEstudiante.toLowerCase().includes(this.filtroTexto.toLowerCase());
      return matchSearch;
    });
  }
}
