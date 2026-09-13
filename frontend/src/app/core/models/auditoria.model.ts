export interface LoginAuditoriaResponse {
  id: number;
  usuarioId: number | null;
  correo: string | null;
  ip: string | null;
  userAgent: string | null;
  exitoso: boolean;
  motivo: string | null;
  fecha: string;
}

export interface EventoSistemaResponse {
  id: number;
  usuarioId: number | null;
  modulo: string;
  accion: string;
  descripcion: string | null;
  fecha: string;
}
