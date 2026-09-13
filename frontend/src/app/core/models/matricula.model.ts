export interface MatriculaRequest {
  usuarioId: number;
  cursoId: number;
  accesoTotal?: boolean;
  modulosHabilitadosIds?: number[];
}

export interface MatriculaResponse {
  id: number;
  usuarioId: number;
  alumnoNombres: string;
  alumnoApellidos: string;
  alumnoCorreo: string;
  alumnoTelefono?: string;
  cursoId: number;
  cursoNombre: string;
  docenteNombre?: string;
  fechaMatricula: string;
  fechaExpiracion?: string;
  diasRestantes?: number;
  alertaExpiracion?: 'OK' | 'PROXIMO_30_DIAS' | 'URGENTE_7_DIAS' | 'EXPIRADO';
  estado: boolean;
}

export interface ModuloAccesoItem {
  moduloId: number;
  nombreModulo: string;
  orden: number;
  habilitado: boolean;
  fechaHabilitacion?: string;
}
