import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CursoService, AlumnoService, MatriculaService, ModuloService, VideoService, ToastService } from '../../core/services';
import { CursoResponse, AlumnoResponse, AlumnoRequest, ModuloRequest, VideoRequest } from '../../core/models';
import { firstValueFrom } from 'rxjs';

interface ParsedStudent {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  dni?: string;
  password?: string;
  valid: boolean;
  error?: string;
  existingId?: number;
}

interface OperationLog {
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface QuickModuleDraft {
  nombre: string;
  descripcion: string;
  orden: number;
  lecciones: {
    titulo: string;
    urlVideo: string;
    duracionMinutos: number;
    descripcion: string;
  }[];
}

@Component({
  selector: 'app-master-ops',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './master-ops.component.html',
  styleUrls: ['./master-ops.component.css']
})
export class MasterOpsComponent implements OnInit {
  private cursoService = inject(CursoService);
  private alumnoService = inject(AlumnoService);
  private matriculaService = inject(MatriculaService);
  private moduloService = inject(ModuloService);
  private videoService = inject(VideoService);
  private toastService = inject(ToastService);

  // Tabs
  activeTab: 'matriculas' | 'usuarios' | 'contenido' | 'inspector' = 'matriculas';

  // Shared Data
  cursos: CursoResponse[] = [];
  alumnosRegistrados: AlumnoResponse[] = [];
  isLoadingCursos = false;
  isLoadingAlumnos = false;

  // TAB 1: Smart Multi-Enrollment
  selectedCursoIds: number[] = [];
  searchCursoTerm = '';
  rawStudentText = '';
  parsedStudents: ParsedStudent[] = [];
  autoCreateMissingStudents = true;
  defaultPassword = 'Plataforma LMS2025*';
  defaultSubscriptionLevel = 1; // 1: Basico, 2: Intermedio, 3: Premium

  // Execution State
  isExecuting = false;
  executionProgress = 0;
  totalOperations = 0;
  completedOperations = 0;
  logs: OperationLog[] = [];

  // TAB 2: Bulk User Creator
  bulkUserRole: 'ALUMNO' | 'DOCENTE' = 'ALUMNO';
  rawUsersText = '';
  parsedUsers: ParsedStudent[] = [];
  createdUsersReport: { correo: string; nombre: string; pass: string; rol: string }[] = [];

  // TAB 3: Fast Curriculum Builder
  contentCursoId: number | null = null;
  curriculumMode: 'visual' | 'outline' = 'visual';
  outlineText = `Módulo 1: Fundamentos y Teoría General
- Introducción al curso y objetivos | https://www.youtube.com/watch?v=dQw4w9WgXcQ | 15
- Conceptos clave y metodología | https://www.youtube.com/watch?v=dQw4w9WgXcQ | 25
Módulo 2: Aplicación Práctica y Protocolos
- Demostración paso a paso | https://www.youtube.com/watch?v=dQw4w9WgXcQ | 30
- Caso de estudio y evaluación | https://www.youtube.com/watch?v=dQw4w9WgXcQ | 20`;
  modulesDraft: QuickModuleDraft[] = [
    {
      nombre: 'Módulo 1: Fundamentos',
      descripcion: 'Introducción y conceptos básicos',
      orden: 1,
      lecciones: [
        { titulo: 'Lección 1: Bienvenida', urlVideo: '', duracionMinutos: 10, descripcion: 'Introducción' },
        { titulo: 'Lección 2: Primeros pasos', urlVideo: '', duracionMinutos: 20, descripcion: 'Conceptos clave' }
      ]
    }
  ];

  // TAB 4: Quick Inspector
  inspectorSearch = '';
  inspectedStudent: AlumnoResponse | null = null;
  studentEnrollments: any[] = [];
  isInspecting = false;

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarAlumnosCache();
  }

  cargarCursos(): void {
    this.isLoadingCursos = true;
    this.cursoService.listarCursos(0, 100, '', 'nombre,asc').subscribe({
      next: (data) => {
        this.cursos = data.content ?? [];
        if (this.cursos.length > 0 && !this.contentCursoId) {
          this.contentCursoId = this.cursos[0].id;
        }
        this.isLoadingCursos = false;
      },
      error: () => {
        this.addLog('error', 'Error al cargar lista de cursos');
        this.isLoadingCursos = false;
      }
    });
  }

  cargarAlumnosCache(): void {
    this.isLoadingAlumnos = true;
    this.alumnoService.listarAlumnos(0, 500, '', 'fechaRegistro,desc', true).subscribe({
      next: (data) => {
        this.alumnosRegistrados = data.content ?? [];
        this.isLoadingAlumnos = false;
      },
      error: () => {
        this.isLoadingAlumnos = false;
      }
    });
  }

  // -------------------------------------------------------------
  // TAB 1: Smart Matriculación
  // -------------------------------------------------------------
  get filteredCursos(): CursoResponse[] {
    if (!this.searchCursoTerm.trim()) return this.cursos;
    const term = this.searchCursoTerm.toLowerCase();
    return this.cursos.filter(c => c.nombre.toLowerCase().includes(term));
  }

  toggleCursoSelection(id: number): void {
    const idx = this.selectedCursoIds.indexOf(id);
    if (idx > -1) {
      this.selectedCursoIds.splice(idx, 1);
    } else {
      this.selectedCursoIds.push(id);
    }
  }

  selectAllCursos(): void {
    if (this.selectedCursoIds.length === this.filteredCursos.length) {
      this.selectedCursoIds = [];
    } else {
      this.selectedCursoIds = this.filteredCursos.map(c => c.id);
    }
  }

  isCursoSelected(id: number): boolean {
    return this.selectedCursoIds.includes(id);
  }

  onSmartPasteInput(text: string): void {
    this.rawStudentText = text;
    this.parsedStudents = this.parseUniversalText(text);
  }

  onBulkUsersInput(text: string): void {
    this.rawUsersText = text;
    this.parsedUsers = this.parseUniversalText(text);
  }

  parseUniversalText(text: string): ParsedStudent[] {
    if (!text || !text.trim()) {
      return [];
    }

    // Detectar si el texto usa formato con etiquetas (NOMBRE:, CORREO:, CLAVE:, etc.)
    const hasLabeledFormat = /(?:nombre|nombres|alumno|estudiante|correo|email|mail|clave|password|contrase[nñ]a|pass|tel|telefono|cel|celular|dni|cedula)\s*:/i.test(text);

    if (hasLabeledFormat) {
      return this.parseLabeledBlocks(text);
    } else {
      return this.parseTabularLines(text);
    }
  }

  private parseLabeledBlocks(text: string): ParsedStudent[] {
    const rawLines = text.split(/\r?\n/);
    const results: ParsedStudent[] = [];

    let current: {
      nombres?: string;
      apellidos?: string;
      correo?: string;
      telefono?: string;
      dni?: string;
      password?: string;
    } = {};

    const pushCurrentIfValid = () => {
      if (current.nombres || current.correo) {
        let n = current.nombres || '';
        let a = current.apellidos || '';
        if (n && !a) {
          this.splitFullName(n, (nombres, apellidos) => {
            n = nombres;
            a = apellidos;
          });
        }
        const correo = current.correo || (n ? `${n.toLowerCase().replace(/\s+/g, '')}@Plataforma LMS.com` : '');
        const existing = this.alumnosRegistrados.find(al => 
          (correo && al.correo.toLowerCase() === correo.toLowerCase()) ||
          (current.telefono && al.telefono === current.telefono)
        );
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
        const isValid = Boolean(n && a && isValidEmail);

        results.push({
          nombres: n || 'Sin nombre',
          apellidos: a || 'Sin apellido',
          correo: correo,
          telefono: current.telefono || '',
          dni: current.dni || '',
          password: current.password || this.defaultPassword,
          valid: isValid,
          error: !isValid ? (!isValidEmail ? 'Correo electrónico no válido' : 'Faltan nombres o apellidos') : undefined,
          existingId: existing ? existing.id : undefined
        });
      }
      current = {};
    };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();

      // Separador entre bloques (línea vacía o guiones)
      if (!line || line.startsWith('---') || line.startsWith('===')) {
        pushCurrentIfValid();
        continue;
      }

      // Si una misma línea tiene múltiples etiquetas separadas por |, ; o coma
      const subSegments = line.split(/[|;]/).map(s => s.trim()).filter(s => s.length > 0);

      for (const seg of subSegments) {
        const colonIdx = seg.indexOf(':');
        if (colonIdx > -1) {
          const key = seg.substring(0, colonIdx).trim().toLowerCase();
          const val = seg.substring(colonIdx + 1).trim();

          if (/^(nombre|nombres|alumno|estudiante)$/i.test(key)) {
            // Si ya teníamos un nombre cargado, significa que inició un nuevo alumno
            if (current.nombres) {
              pushCurrentIfValid();
            }
            current.nombres = val;
          } else if (/^(apellido|apellidos)$/i.test(key)) {
            current.apellidos = val;
          } else if (/^(correo|email|mail|usuario|user)$/i.test(key)) {
            if (current.correo && !current.nombres) {
              pushCurrentIfValid();
            }
            current.correo = val;
          } else if (/^(clave|password|contrase[nñ]a|pass)$/i.test(key)) {
            current.password = val;
          } else if (/^(telefono|tel|celular|cel|whatsapp|ws)$/i.test(key)) {
            current.telefono = val;
          } else if (/^(dni|documento|cedula)$/i.test(key)) {
            current.dni = val;
          }
        } else {
          // Si no tiene dos puntos pero es un correo
          if (seg.includes('@')) {
            if (current.correo) pushCurrentIfValid();
            current.correo = seg;
          }
        }
      }
    }

    // Agregar el último bloque si quedó pendiente
    pushCurrentIfValid();

    return results;
  }

  private parseTabularLines(text: string): ParsedStudent[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const results: ParsedStudent[] = [];

    for (const line of lines) {
      // Omitir cabeceras estándar
      if (/^(nombres?|apellidos?|alumnos?|correos?|emails?|tel[ée]fonos?|dnis?|passwords?)(\t|,|;)/i.test(line)) {
        continue;
      }

      let separator = '\t';
      if (line.includes('\t')) separator = '\t';
      else if (line.includes(';')) separator = ';';
      else if (line.includes(',')) separator = ',';
      else if (line.includes('|')) separator = '|';

      const parts = line.split(separator).map(p => p.trim());

      let nombres = '';
      let apellidos = '';
      let correo = '';
      let telefono = '';
      let dni = '';
      let pass = this.defaultPassword;

      if (parts.length === 1) {
        if (parts[0].includes('@')) {
          correo = parts[0];
          nombres = correo.split('@')[0];
          apellidos = 'Alumno';
        }
      } else if (parts.length === 2) {
        if (parts[0].includes('@')) {
          correo = parts[0];
          this.splitFullName(parts[1], (n, a) => { nombres = n; apellidos = a; });
        } else {
          correo = parts[1];
          this.splitFullName(parts[0], (n, a) => { nombres = n; apellidos = a; });
        }
      } else if (parts.length >= 3) {
        const emailIdx = parts.findIndex(p => p.includes('@'));
        if (emailIdx > -1) {
          correo = parts[emailIdx];
          const nonEmailParts = parts.filter((_, idx) => idx !== emailIdx);
          
          if (nonEmailParts.length === 1) {
            this.splitFullName(nonEmailParts[0], (n, a) => { nombres = n; apellidos = a; });
          } else if (nonEmailParts.length >= 2) {
            nombres = nonEmailParts[0];
            apellidos = nonEmailParts[1];
            if (nonEmailParts.length >= 3) telefono = nonEmailParts[2];
            if (nonEmailParts.length >= 4) pass = nonEmailParts[3];
          }
        } else {
          nombres = parts[0];
          apellidos = parts[1];
          telefono = parts[2] || '';
          correo = `${nombres.toLowerCase().replace(/\s+/g, '')}.${apellidos.toLowerCase().replace(/\s+/g, '')}@Plataforma LMS.com`;
        }
      }

      const existing = this.alumnosRegistrados.find(a => 
        (correo && a.correo.toLowerCase() === correo.toLowerCase()) ||
        (telefono && a.telefono === telefono)
      );

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
      const isValid = Boolean(nombres && apellidos && isValidEmail);

      results.push({
        nombres: nombres || 'Sin nombre',
        apellidos: apellidos || 'Sin apellido',
        correo: correo || '',
        telefono: telefono || '',
        dni: dni || '',
        password: pass,
        valid: isValid,
        error: !isValid ? (!isValidEmail ? 'Correo electrónico no válido' : 'Faltan nombres o apellidos') : undefined,
        existingId: existing ? existing.id : undefined
      });
    }

    return results;
  }

  private splitFullName(fullName: string, callback: (nombres: string, apellidos: string) => void): void {
    const tokens = fullName.trim().split(/\s+/);
    if (tokens.length <= 1) {
      callback(tokens[0] || 'Alumno', 'General');
    } else if (tokens.length === 2) {
      callback(tokens[0], tokens[1]);
    } else if (tokens.length === 3) {
      callback(tokens[0], `${tokens[1]} ${tokens[2]}`);
    } else {
      callback(`${tokens[0]} ${tokens[1]}`, tokens.slice(2).join(' '));
    }
  }

  removeParsedStudent(index: number): void {
    this.parsedStudents.splice(index, 1);
  }

  clearMatriculaForm(): void {
    this.rawStudentText = '';
    this.parsedStudents = [];
    this.selectedCursoIds = [];
  }

  async ejecutarMatriculaMasiva(): Promise<void> {
    if (this.selectedCursoIds.length === 0) {
      this.toastService.warning('Por favor selecciona al menos 1 curso para matricular.');
      return;
    }

    const validStudents = this.parsedStudents.filter(s => s.valid);
    if (validStudents.length === 0) {
      this.toastService.warning('No hay alumnos válidos para procesar.');
      return;
    }

    this.isExecuting = true;
    this.logs = [];
    this.totalOperations = validStudents.length * this.selectedCursoIds.length;
    this.completedOperations = 0;
    this.executionProgress = 0;

    this.addLog('info', `Iniciando proceso: ${validStudents.length} alumnos en ${this.selectedCursoIds.length} cursos (${this.totalOperations} matrículas totales)...`);

    for (const student of validStudents) {
      let usuarioId = student.existingId;

      if (!usuarioId) {
        if (this.autoCreateMissingStudents) {
          try {
            this.addLog('info', `Creando usuario nuevo: ${student.correo}...`);
            const createReq: AlumnoRequest = {
              nombres: student.nombres,
              apellidos: student.apellidos,
              correo: student.correo,
              telefono: student.telefono || '999999999',
              nivelSuscripcionId: this.defaultSubscriptionLevel,
              password: student.password || this.defaultPassword
            };
            const nuevo = await firstValueFrom(this.alumnoService.crearAlumno(createReq));
            usuarioId = nuevo.id;
            student.existingId = nuevo.id;
            this.alumnosRegistrados.push(nuevo);
            this.addLog('success', `Usuario creado con éxito: ${student.nombres} ${student.apellidos} (ID: ${nuevo.id})`);
          } catch (err: any) {
            const msg = err.error?.message || err.message || 'Error desconocido al crear usuario';
            this.addLog('error', `Error al crear usuario ${student.correo}: ${msg}`);
            this.completedOperations += this.selectedCursoIds.length;
            this.updateProgress();
            continue;
          }
        } else {
          this.addLog('warning', `Alumno ${student.correo} no existe y la autocreación está desactivada. Se omite.`);
          this.completedOperations += this.selectedCursoIds.length;
          this.updateProgress();
          continue;
        }
      }

      for (const cursoId of this.selectedCursoIds) {
        const cursoNombre = this.cursos.find(c => c.id === cursoId)?.nombre || `Curso #${cursoId}`;
        try {
          await firstValueFrom(this.matriculaService.matricularAlumno({ usuarioId: usuarioId!, cursoId }));
          this.addLog('success', `✓ Matriculado: ${student.nombres} ${student.apellidos} en "${cursoNombre}"`);
        } catch (err: any) {
          const msg = err.error?.message || 'Error al matricular';
          if (msg.toLowerCase().includes('ya está matriculado') || msg.toLowerCase().includes('duplicate') || err.status === 409) {
            this.addLog('warning', `⚠ ${student.correo} ya estaba matriculado en "${cursoNombre}"`);
          } else {
            this.addLog('error', `✗ Fallo al matricular ${student.correo} en "${cursoNombre}": ${msg}`);
          }
        }
        this.completedOperations++;
        this.updateProgress();
      }
    }

    this.isExecuting = false;
    this.addLog('info', `Proceso completado. ${this.completedOperations} operaciones procesadas.`);
    this.toastService.success('Operación masiva de matriculación finalizada con éxito.');
  }

  async ejecutarCreacionUsuarios(): Promise<void> {
    const validUsers = this.parsedUsers.filter(u => u.valid);
    if (validUsers.length === 0) {
      this.toastService.warning('No hay usuarios válidos para crear.');
      return;
    }

    this.isExecuting = true;
    this.logs = [];
    this.createdUsersReport = [];
    this.totalOperations = validUsers.length;
    this.completedOperations = 0;
    this.executionProgress = 0;

    this.addLog('info', `Creando ${validUsers.length} usuarios con rol ${this.bulkUserRole}...`);

    for (const user of validUsers) {
      try {
        const pass = user.password || this.defaultPassword;
        const req: AlumnoRequest = {
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          telefono: user.telefono || '999999999',
          nivelSuscripcionId: this.defaultSubscriptionLevel,
          password: pass
        };

        const res = await firstValueFrom(this.alumnoService.crearAlumno(req));
        this.createdUsersReport.push({
          correo: res.correo,
          nombre: `${res.nombres} ${res.apellidos}`,
          pass: pass,
          rol: this.bulkUserRole
        });
        this.addLog('success', `✓ Creado: ${res.nombres} ${res.apellidos} (${res.correo})`);
      } catch (err: any) {
        const msg = err.error?.message || err.message || 'Error al crear';
        this.addLog('error', `✗ Error al crear ${user.correo}: ${msg}`);
      }
      this.completedOperations++;
      this.updateProgress();
    }

    this.isExecuting = false;
    this.toastService.success(`Se crearon ${this.createdUsersReport.length} usuarios.`);
  }

  copyCreatedCredentials(): void {
    if (this.createdUsersReport.length === 0) return;
    const text = this.createdUsersReport
      .map(u => `Nombre: ${u.nombre}\nCorreo: ${u.correo}\nContraseña: ${u.pass}\nRol: ${u.rol}\n-------------------`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.success('Credenciales copiadas al portapapeles.');
    });
  }

  // -------------------------------------------------------------
  // TAB 3: Fast Curriculum Builder
  // -------------------------------------------------------------
  addModuleDraft(): void {
    const nextOrder = this.modulesDraft.length + 1;
    this.modulesDraft.push({
      nombre: `Módulo ${nextOrder}: Nuevo Módulo`,
      descripcion: 'Descripción del módulo',
      orden: nextOrder,
      lecciones: [
        { titulo: 'Lección 1', urlVideo: '', duracionMinutos: 15, descripcion: '' }
      ]
    });
  }

  removeModuleDraft(index: number): void {
    this.modulesDraft.splice(index, 1);
  }

  addLessonDraft(moduleIndex: number): void {
    const m = this.modulesDraft[moduleIndex];
    const nextNum = m.lecciones.length + 1;
    m.lecciones.push({
      titulo: `Lección ${nextNum}: Nueva Lección`,
      urlVideo: '',
      duracionMinutos: 15,
      descripcion: ''
    });
  }

  removeLessonDraft(moduleIndex: number, lessonIndex: number): void {
    this.modulesDraft[moduleIndex].lecciones.splice(lessonIndex, 1);
  }

  parseOutlineText(): void {
    if (!this.outlineText.trim()) return;
    const lines = this.outlineText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const modules: QuickModuleDraft[] = [];
    let currentModule: QuickModuleDraft | null = null;

    for (const line of lines) {
      if (line.startsWith('Módulo') || line.startsWith('Modulo') || line.startsWith('#') || !line.startsWith('-')) {
        const modTitle = line.replace(/^#+\s*/, '').trim();
        currentModule = {
          nombre: modTitle,
          descripcion: 'Contenido estructurado',
          orden: modules.length + 1,
          lecciones: []
        };
        modules.push(currentModule);
      } else if (line.startsWith('-') || line.startsWith('*')) {
        const clean = line.replace(/^[-*]\s*/, '').trim();
        const parts = clean.split('|').map(p => p.trim());
        const titulo = parts[0] || 'Nueva Lección';
        const urlVideo = parts[1] || '';
        const duracion = parseInt(parts[2], 10) || 15;

        if (!currentModule) {
          currentModule = {
            nombre: 'Módulo 1: General',
            descripcion: 'Módulo inicial',
            orden: 1,
            lecciones: []
          };
          modules.push(currentModule);
        }

        currentModule.lecciones.push({
          titulo,
          urlVideo,
          duracionMinutos: duracion,
          descripcion: 'Lección en video'
        });
      }
    }

    this.modulesDraft = modules;
    this.curriculumMode = 'visual';
    this.toastService.info('Estructura importada desde texto a modo visual.');
  }

  async publicarCurriculum(): Promise<void> {
    if (!this.contentCursoId) {
      this.toastService.warning('Selecciona un curso destino.');
      return;
    }

    if (this.modulesDraft.length === 0) {
      this.toastService.warning('Agrega al menos un módulo.');
      return;
    }

    const curso = this.cursos.find(c => c.id === this.contentCursoId);
    this.isExecuting = true;
    this.logs = [];
    
    let totalItems = this.modulesDraft.length;
    this.modulesDraft.forEach(m => totalItems += m.lecciones.length);
    this.totalOperations = totalItems;
    this.completedOperations = 0;
    this.executionProgress = 0;

    this.addLog('info', `Iniciando creación de contenido para curso "${curso?.nombre}" (${this.modulesDraft.length} módulos)...`);

    for (let mIdx = 0; mIdx < this.modulesDraft.length; mIdx++) {
      const draft = this.modulesDraft[mIdx];
      try {
        const modReq: ModuloRequest = {
          cursoId: this.contentCursoId,
          nombre: draft.nombre,
          descripcion: draft.descripcion || 'Módulo del curso',
          orden: draft.orden || (mIdx + 1)
        };
        const nuevoModulo = await firstValueFrom(this.moduloService.crearModulo(modReq));
        this.addLog('success', `✓ Módulo creado: "${draft.nombre}" (ID: ${nuevoModulo.id})`);
        this.completedOperations++;
        this.updateProgress();

        for (let lIdx = 0; lIdx < draft.lecciones.length; lIdx++) {
          const lDraft = draft.lecciones[lIdx];
          try {
            const vidReq: VideoRequest = {
              moduloId: nuevoModulo.id,
              titulo: lDraft.titulo,
              descripcion: lDraft.descripcion || 'Video de la lección',
              youtubeUrl: lDraft.urlVideo || 'https://www.youtube.com/watch?v=placeholder',
              orden: lIdx + 1,
              duracionSegundos: (lDraft.duracionMinutos || 10) * 60
            };
            await firstValueFrom(this.videoService.crearVideo(vidReq));
            this.addLog('success', `  ↳ Lección creada: "${lDraft.titulo}"`);
          } catch (vErr: any) {
            this.addLog('error', `  ✗ Error al crear lección "${lDraft.titulo}": ${vErr.message || 'Fallo'}`);
          }
          this.completedOperations++;
          this.updateProgress();
        }

      } catch (mErr: any) {
        this.addLog('error', `✗ Error al crear módulo "${draft.nombre}": ${mErr.message || 'Fallo'}`);
        this.completedOperations += (1 + draft.lecciones.length);
        this.updateProgress();
      }
    }

    this.isExecuting = false;
    this.toastService.success('¡Estructura de curso y lecciones publicadas exitosamente!');
  }

  // -------------------------------------------------------------
  // TAB 4: Inspector Rápido
  // -------------------------------------------------------------
  inspeccionarAlumno(): void {
    if (!this.inspectorSearch.trim()) return;
    const term = this.inspectorSearch.trim().toLowerCase();
    const found = this.alumnosRegistrados.find(a => 
      a.correo.toLowerCase() === term || 
      a.telefono === term || 
      `${a.nombres} ${a.apellidos}`.toLowerCase().includes(term)
    );

    if (!found) {
      this.toastService.warning('No se encontró ningún alumno con ese correo/teléfono en el registro local.');
      this.inspectedStudent = null;
      this.studentEnrollments = [];
      return;
    }

    this.inspectedStudent = found;
    this.isInspecting = true;
    this.studentEnrollments = [];

    this.matriculaService.listarPorUsuario(found.id).subscribe({
      next: (mats) => {
        this.studentEnrollments = mats.map(m => ({
          cursoId: m.cursoId,
          cursoNombre: m.cursoNombre,
          matriculaId: m.id,
          fecha: m.fechaMatricula,
          estado: m.estado
        }));
        this.isInspecting = false;
      },
      error: () => {
        this.studentEnrollments = [];
        this.isInspecting = false;
      }
    });
  }

  desmatricularRapido(matriculaId: number, cursoNombre: string): void {
    if (!confirm(`¿Desmatricular a ${this.inspectedStudent?.nombres} del curso "${cursoNombre}"?`)) return;
    this.matriculaService.eliminarMatricula(matriculaId).subscribe({
      next: () => {
        this.toastService.success(`Desmatriculado de "${cursoNombre}".`);
        this.inspeccionarAlumno();
      },
      error: (err) => {
        this.toastService.error('Error al desmatricular: ' + (err.error?.message || 'Error'));
      }
    });
  }

  // Helpers
  private updateProgress(): void {
    if (this.totalOperations > 0) {
      this.executionProgress = Math.round((this.completedOperations / this.totalOperations) * 100);
    }
  }

  private addLog(type: 'success' | 'warning' | 'error' | 'info', message: string): void {
    const now = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp: now, type, message });
  }

  clearLogs(): void {
    this.logs = [];
  }
}
