import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicoService } from '../../../core/services/academico.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  PeriodoAcademico,
  SeccionGrado,
  EvaluacionConfigResponse,
  MatriculaAcademicaResponse,
  HistorialCambioResponse,
  BoletaNotasEstudianteResponse,
  CalificacionItemResponse
} from '../../../core/models/academico.model';

interface FilaCalificacionEstudiante {
  matriculaId: number;
  estudianteId: number;
  codigo: string;
  nombresCompletos: string;
  dni: string;
  notas: { [evaluacionId: number]: { calificacionId?: number; valorNum?: number; valorLit?: string } };
  promedioNum?: number;
  promedioLit?: string;
  estadoAprobacion?: string;
}

@Component({
  selector: 'app-gestion-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-notas.component.html',
  styleUrls: ['./gestion-notas.component.css']
})
export class GestionNotasComponent implements OnInit {
  private academicoService = inject(AcademicoService);
  private toast = inject(ToastService);

  periodos: PeriodoAcademico[] = [];
  secciones: SeccionGrado[] = [];
  evaluaciones: EvaluacionConfigResponse[] = [];
  matriculados: MatriculaAcademicaResponse[] = [];

  periodoSeleccionadoId: number | null = null;
  seccionSeleccionadaId: number | null = null;
  filtroBusqueda: string = '';

  tipoInstitucion: 'COLEGIO_PRIMARIA' | 'COLEGIO_SECUNDARIA' | 'INSTITUTO' = 'COLEGIO_SECUNDARIA';
  tipoEscala: 'LITERAL' | 'VIGESIMAL' = 'LITERAL';

  filasTabla: FilaCalificacionEstudiante[] = [];

  // Modal Modificación de Nota & Auditoría
  modalModificarAbierto: boolean = false;
  calificacionSeleccionadaId: number | null = null;
  nombreAlumnoModificar: string = '';
  evaluacionModificarNombre: string = '';
  notaActualNum: number | null = null;
  notaActualLit: string = '';
  nuevaNotaNum: number | null = null;
  nuevaNotaLit: string = 'A';
  motivoJustificacion: string = '';

  // Modal Historial de Cambios
  modalHistorialAbierto: boolean = false;
  historialCambios: HistorialCambioResponse[] = [];

  // Modal Boleta Oficial
  modalBoletaAbierto: boolean = false;
  boletaSeleccionada: BoletaNotasEstudianteResponse | null = null;

  // Modal Nueva Evaluación
  modalNuevaEvalAbierto: boolean = false;
  nuevoNombreEval: string = '';
  nuevoPesoEval: number = 25;

  cargando: boolean = false;

  readonly opcionesLiterales = ['AD', 'A', 'B', 'C'];

  ngOnInit(): void {
    this.cargarFiltros();
  }

  cargarFiltros(): void {
    this.cargando = true;
    this.academicoService.listarPeriodos().subscribe({
      next: (periodos) => {
        this.periodos = periodos;
        if (periodos.length > 0) {
          this.periodoSeleccionadoId = periodos[0].id;
          this.tipoInstitucion = periodos[0].tipoInstitucion as any || 'COLEGIO_SECUNDARIA';
          this.determinarEscala();
        }

        this.academicoService.listarSecciones().subscribe({
          next: (secciones) => {
            this.secciones = secciones;
            if (secciones.length > 0) {
              this.seccionSeleccionadaId = secciones[0].id;
              this.cargarPlanilla();
            } else {
              this.cargando = false;
            }
          },
          error: () => { this.cargando = false; }
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  determinarEscala(): void {
    if (this.tipoInstitucion === 'INSTITUTO') {
      this.tipoEscala = 'VIGESIMAL';
    } else {
      this.tipoEscala = 'LITERAL';
    }
  }

  onCambioPeriodo(): void {
    const p = this.periodos.find(x => x.id === Number(this.periodoSeleccionadoId));
    if (p) {
      this.tipoInstitucion = p.tipoInstitucion as any || 'COLEGIO_SECUNDARIA';
      this.determinarEscala();
    }
    this.cargarPlanilla();
  }

  onCambioSeccion(): void {
    this.cargarPlanilla();
  }

  cargarPlanilla(): void {
    if (!this.periodoSeleccionadoId || !this.seccionSeleccionadaId) return;

    this.cargando = true;
    const cursoId = 1; // Curso activo

    // 1. Listar configuraciones de evaluación
    this.academicoService.listarEvaluaciones(cursoId, this.periodoSeleccionadoId).subscribe({
      next: (evals) => {
        this.evaluaciones = evals;

        // 2. Listar matriculados
        this.academicoService.listarMatriculasPorSeccionYPeriodo(this.seccionSeleccionadaId!, this.periodoSeleccionadoId!).subscribe({
          next: (matriculas) => {
            this.matriculados = matriculas;
            this.construirFilasPlanilla();
            this.cargando = false;
          },
          error: () => { this.cargando = false; }
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  construirFilasPlanilla(): void {
    this.filasTabla = this.matriculados.map(m => {
      const fila: FilaCalificacionEstudiante = {
        matriculaId: m.id,
        estudianteId: m.estudianteId,
        codigo: m.codigoEstudiante,
        nombresCompletos: `${m.estudianteApellidos}, ${m.estudianteNombres}`,
        dni: m.dni,
        notas: {}
      };

      // Inicializar notas con valores por defecto o consultar boleta
      this.evaluaciones.forEach(ev => {
        fila.notas[ev.id] = {
          calificacionId: undefined,
          valorNum: this.tipoEscala === 'VIGESIMAL' ? 15.00 : undefined,
          valorLit: this.tipoEscala === 'LITERAL' ? 'A' : undefined
        };
      });

      this.recalcularPromedioFila(fila);
      return fila;
    });
  }

  guardarNotaDirecta(fila: FilaCalificacionEstudiante, evaluacionId: number): void {
    const notaObj = fila.notas[evaluacionId];
    if (!notaObj) return;

    this.academicoService.registrarCalificacion({
      matriculaAcademicaId: fila.matriculaId,
      evaluacionId: evaluacionId,
      valorNumerico: this.tipoEscala === 'VIGESIMAL' ? Number(notaObj.valorNum) : undefined,
      valorLiteral: this.tipoEscala === 'LITERAL' ? notaObj.valorLit : undefined,
      observacion: 'Registro desde planilla interactiva'
    }).subscribe({
      next: (res) => {
        notaObj.calificacionId = res.calificacionId;
        this.recalcularPromedioFila(fila);
        this.toast.success(`Calificación guardada para ${fila.nombresCompletos}`);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al guardar la calificación.');
      }
    });
  }

  recalcularPromedioFila(fila: FilaCalificacionEstudiante): void {
    if (this.tipoEscala === 'VIGESIMAL') {
      let sumaPonderada = 0;
      let sumaPesos = 0;

      this.evaluaciones.forEach(ev => {
        const n = fila.notas[ev.id]?.valorNum;
        if (n !== undefined && n !== null && !isNaN(n)) {
          const peso = Number(ev.pesoPorcentual) || 1;
          sumaPonderada += Number(n) * peso;
          sumaPesos += peso;
        }
      });

      if (sumaPesos > 0) {
        fila.promedioNum = Math.round((sumaPonderada / sumaPesos) * 100) / 100;
        fila.estadoAprobacion = fila.promedioNum >= 13.00 ? 'APROBADO' : 'DESAPROBADO';
      } else {
        fila.promedioNum = undefined;
        fila.estadoAprobacion = 'SIN NOTAS';
      }
    } else {
      // Escala Literal AD, A, B, C
      const conteo: { [key: string]: number } = { AD: 0, A: 0, B: 0, C: 0 };
      let total = 0;

      this.evaluaciones.forEach(ev => {
        const lit = fila.notas[ev.id]?.valorLit;
        if (lit && conteo[lit] !== undefined) {
          conteo[lit]++;
          total++;
        }
      });

      if (total > 0) {
        if (conteo['AD'] >= total / 2 && conteo['C'] === 0) {
          fila.promedioLit = 'AD';
          fila.estadoAprobacion = 'LOGRO DESTACADO';
        } else if ((conteo['AD'] + conteo['A']) >= total / 2 && conteo['C'] === 0) {
          fila.promedioLit = 'A';
          fila.estadoAprobacion = 'LOGRO ESPERADO';
        } else if (conteo['C'] >= total / 2) {
          fila.promedioLit = 'C';
          fila.estadoAprobacion = 'EN INICIO';
        } else {
          fila.promedioLit = 'B';
          fila.estadoAprobacion = 'EN PROCESO';
        }
      } else {
        fila.promedioLit = '-';
        fila.estadoAprobacion = 'SIN NOTAS';
      }
    }
  }

  // Modal Modificar Calificación con Auditoría
  abrirModalModificar(fila: FilaCalificacionEstudiante, ev: EvaluacionConfigResponse): void {
    const n = fila.notas[ev.id];
    this.nombreAlumnoModificar = fila.nombresCompletos;
    this.evaluacionModificarNombre = ev.nombre;
    this.calificacionSeleccionadaId = n?.calificacionId || null;

    this.notaActualNum = n?.valorNum || null;
    this.notaActualLit = n?.valorLit || 'A';
    this.nuevaNotaNum = this.notaActualNum;
    this.nuevaNotaLit = this.notaActualLit;
    this.motivoJustificacion = '';

    this.modalModificarAbierto = true;
  }

  confirmarModificacion(): void {
    if (!this.motivoJustificacion.trim()) {
      this.toast.error('El motivo de la modificación es obligatorio para la auditoría institucional.');
      return;
    }

    if (!this.calificacionSeleccionadaId) {
      this.toast.error('La calificación debe guardarse inicialmente antes de auditar una modificación.');
      return;
    }

    this.academicoService.modificarCalificacion(this.calificacionSeleccionadaId, {
      nuevoValorNumerico: this.tipoEscala === 'VIGESIMAL' ? Number(this.nuevaNotaNum) : undefined,
      nuevoValorLiteral: this.tipoEscala === 'LITERAL' ? this.nuevaNotaLit : undefined,
      motivoJustificacion: this.motivoJustificacion.trim()
    }).subscribe({
      next: (res) => {
        this.toast.success('Calificación modificada y registrada en auditoría con éxito.');
        this.modalModificarAbierto = false;
        this.cargarPlanilla();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al modificar la calificación.');
      }
    });
  }

  // Ver Historial de Auditoría
  verHistorial(calificacionId: number): void {
    this.academicoService.obtenerHistorialModificaciones(calificacionId).subscribe({
      next: (res) => {
        this.historialCambios = res;
        this.modalHistorialAbierto = true;
      },
      error: () => {
        this.toast.error('No se pudo cargar el historial de cambios.');
      }
    });
  }

  // Ver Boleta Oficial
  verBoletaOficial(matriculaId: number): void {
    this.academicoService.generarBoletaNotas(matriculaId).subscribe({
      next: (res) => {
        this.boletaSeleccionada = res;
        this.modalBoletaAbierto = true;
      },
      error: () => {
        this.toast.error('No se pudo generar la boleta de notas.');
      }
    });
  }

  imprimirBoleta(): void {
    window.print();
  }

  crearEvaluacion(): void {
    if (!this.nuevoNombreEval.trim()) {
      this.toast.error('Ingrese el nombre de la evaluación.');
      return;
    }

    this.academicoService.crearEvaluacionConfig({
      cursoId: 1,
      periodoAcademicoId: this.periodoSeleccionadoId!,
      nombre: this.nuevoNombreEval.trim(),
      tipoEscala: this.tipoEscala,
      pesoPorcentual: this.nuevoPesoEval
    }).subscribe({
      next: () => {
        this.toast.success('Nueva columna de evaluación agregada.');
        this.modalNuevaEvalAbierto = false;
        this.nuevoNombreEval = '';
        this.cargarPlanilla();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al crear la evaluación.');
      }
    });
  }

  get filasFiltradas(): FilaCalificacionEstudiante[] {
    if (!this.filtroBusqueda.trim()) return this.filasTabla;
    const q = this.filtroBusqueda.toLowerCase();
    return this.filasTabla.filter(f =>
      f.nombresCompletos.toLowerCase().includes(q) ||
      f.dni.includes(q) ||
      f.codigo.toLowerCase().includes(q)
    );
  }
}
