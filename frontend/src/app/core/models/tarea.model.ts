export interface TareaRequest {
  moduloId: number;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  permitirReenvio?: boolean;
  estado?: boolean;
}

export interface TareaResponse {
  id: number;
  moduloId: number;
  moduloNombre: string;
  moduloOrden: number;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  permitirReenvio: boolean;
  estado: boolean;
  fechaCreacion: string;
  totalEntregas: number;
}

export interface EntregaTareaResponse {
  id: number;
  tareaId: number;
  tareaTitulo: string;
  usuarioId: number;
  alumnoNombre: string;
  alumnoCorreo: string;
  archivoUrl: string;
  tipoArchivo: string;
  pesoBytes: number;
  comentarioAlumno?: string;
  calificacion?: number;
  feedbackDocente?: string;
  fechaEntrega: string;
  fechaCalificacion?: string;
  estado: 'ENTREGADO' | 'APROBADO' | 'DESAPROBADO' | 'OBSERVADO' | string;
}

export interface CalificarEntregaRequest {
  calificacion: number;
  feedbackDocente?: string;
  estado?: string;
}

export interface AlumnoTareaItem {
  id: number;
  cursoId?: number;
  cursoNombre?: string;
  moduloId: number;
  moduloNombre: string;
  moduloOrden: number;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  permitirReenvio: boolean;
  vencida: boolean;
  
  entregada: boolean;
  entregaId?: number;
  archivoUrl?: string;
  tipoArchivo?: string;
  pesoBytes?: number;
  comentarioAlumno?: string;
  calificacion?: number;
  feedbackDocente?: string;
  fechaEntrega?: string;
  fechaCalificacion?: string;
  estadoEntrega: 'PENDIENTE' | 'ENTREGADO' | 'APROBADO' | 'DESAPROBADO' | 'OBSERVADO' | string;
}
