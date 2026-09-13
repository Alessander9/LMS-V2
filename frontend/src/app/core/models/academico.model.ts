export interface PeriodoAcademico {
  id: number;
  nombre: string;
  tipoPeriodo: string; // 'BIMESTRE' | 'TRIMESTRE' | 'SEMESTRE' | 'ANUAL'
  tipoInstitucion: string; // 'COLEGIO_PRIMARIA' | 'COLEGIO_SECUNDARIA' | 'INSTITUTO'
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface SeccionGrado {
  id: number;
  nivel: string; // 'PRIMARIA' | 'SECUNDARIA' | 'SUPERIOR'
  gradoOCiclo: string;
  seccion: string;
  turno: string;
  tutorDocenteId?: number;
  capacidadMaxima?: number;
  activo?: boolean;
}

export interface EstudianteResponse {
  id: number;
  usuarioId: number;
  codigoEstudiante: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  nombreApoderado?: string;
  telefonoApoderado?: string;
  parentescoApoderado?: string;
  qrToken: string;
  gradoOSeccionActual?: string;
  nivelActual?: string;
  estadoUsuario?: boolean;
}

export interface RegistroEstudianteRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  password?: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  nombreApoderado?: string;
  telefonoApoderado?: string;
  parentescoApoderado?: string;
  seccionGradoId?: number;
  periodoAcademicoId?: number;
}

export interface CarnetEstudianteQrResponse {
  estudianteId: number;
  codigoEstudiante: string;
  nombresCompletos: string;
  dni: string;
  gradoOSeccion: string;
  nivel: string;
  qrToken: string;
  fechaEmision: string;
}

export interface MatriculaAcademicaResponse {
  id: number;
  estudianteId: number;
  codigoEstudiante: string;
  estudianteNombres: string;
  estudianteApellidos: string;
  dni: string;
  seccionGradoId: number;
  gradoOCiclo: string;
  seccion: string;
  nivel: string;
  periodoAcademicoId: number;
  periodoNombre: string;
  estado: string;
  fechaMatricula: string;
  observaciones?: string;
}

export interface SesionClaseResponse {
  id: number;
  cursoId: number;
  cursoNombre: string;
  seccionGradoId: number;
  gradoOCiclo: string;
  seccion: string;
  docenteId: number;
  docenteNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tema?: string;
  qrSesionToken: string;
  estado: string;
}

export interface MarcacionQrRequest {
  qrToken: string;
  sesionId?: number;
  metodo?: string; // 'QR_SCAN' | 'QR_SESION' | 'MANUAL'
  estado?: string; // 'PRESENTE' | 'TARDANZA' | 'FALTA_JUSTIFICADA' | 'FALTA_INJUSTIFICADA'
  observaciones?: string;
}

export interface MarcacionResponse {
  asistenciaId: number;
  sesionId: number;
  estudianteId: number;
  estudianteNombre: string;
  dni: string;
  estado: string;
  metodoMarcacion: string;
  fechaHoraMarcacion: string;
  mensaje: string;
}

export interface AsistenciaItemResponse {
  asistenciaId: number;
  estudianteId: number;
  codigoEstudiante: string;
  estudianteNombres: string;
  estudianteApellidos: string;
  dni: string;
  estado: string;
  metodoMarcacion: string;
  fechaHoraMarcacion: string;
  observaciones?: string;
}

export interface ResumenAsistenciaEstudiante {
  estudianteId: number;
  estudianteNombre: string;
  totalClases: number;
  asistencias: number;
  tardanzas: number;
  faltas: number;
  justificaciones: number;
  porcentajeAsistencia: number;
  historial: AsistenciaItemResponse[];
}

export interface EvaluacionConfigResponse {
  id: number;
  cursoId: number;
  cursoNombre: string;
  periodoAcademicoId: number;
  periodoNombre: string;
  nombre: string;
  tipoEscala: 'LITERAL' | 'VIGESIMAL';
  pesoPorcentual: number;
  orden: number;
  activo: boolean;
}

export interface EvaluacionConfigRequest {
  cursoId: number;
  periodoAcademicoId: number;
  nombre: string;
  tipoEscala: 'LITERAL' | 'VIGESIMAL';
  pesoPorcentual: number;
  orden?: number;
}

export interface CalificacionItemResponse {
  calificacionId: number;
  evaluacionId: number;
  evaluacionNombre: string;
  tipoEscala: 'LITERAL' | 'VIGESIMAL';
  pesoPorcentual: number;
  valorNumerico?: number;
  valorLiteral?: string; // 'AD' | 'A' | 'B' | 'C'
  docenteNombre: string;
  fechaRegistro: string;
  observacion?: string;
}

export interface RegistroCalificacionRequest {
  matriculaAcademicaId: number;
  evaluacionId: number;
  valorNumerico?: number;
  valorLiteral?: string;
  observacion?: string;
}

export interface ModificarCalificacionRequest {
  nuevoValorNumerico?: number;
  nuevoValorLiteral?: string;
  motivoJustificacion: string;
}

export interface HistorialCambioResponse {
  id: number;
  calificacionId: number;
  notaAnteriorNum?: number;
  notaAnteriorLit?: string;
  notaNuevaNum?: number;
  notaNuevaLit?: string;
  modificadoPorNombre: string;
  fechaModificacion: string;
  motivoJustificacion: string;
}

export interface BoletaNotasEstudianteResponse {
  estudianteId: number;
  codigoEstudiante: string;
  estudianteNombre: string;
  dni: string;
  nivel: string;
  gradoOSeccion: string;
  periodoNombre: string;
  tipoInstitucion: string;
  tipoEscala: 'LITERAL' | 'VIGESIMAL';
  calificaciones: CalificacionItemResponse[];
  promedioFinalNumerico?: number;
  promedioFinalLiteral?: string;
  estadoAprobacion: string;
  conclusionDescriptiva: string;
}
