export interface MensajeRequest {
  asunto: string;
  contenido: string;
  destinatarioId?: number;
  cursoId?: number;
  tipo?: 'INDIVIDUAL' | 'CURSO_MASIVO' | 'TODOS_ALUMNOS' | 'TODOS_DOCENTES';
  prioridad?: 'NORMAL' | 'IMPORTANTE' | 'URGENTE';
  adjuntoUrl?: string;
  adjuntoNombre?: string;
  adjuntoTamano?: string;
  audioUrl?: string;
}

export interface RespuestaMensajeRequest {
  contenido: string;
  adjuntoUrl?: string;
  adjuntoNombre?: string;
  adjuntoTamano?: string;
  audioUrl?: string;
}

export interface MensajeItem {
  id: number;
  conversacionId: number;
  asunto: string;
  contenido: string;
  prioridad: 'NORMAL' | 'IMPORTANTE' | 'URGENTE';
  remitenteId: number;
  remitenteNombre: string;
  remitenteCorreo: string;
  remitenteRol: string;
  destinatarioId?: number;
  destinatarioNombre?: string;
  destinatarioCorreo?: string;
  destinatarioRol?: string;
  adjuntoUrl?: string;
  adjuntoNombre?: string;
  adjuntoTamano?: string;
  audioUrl?: string;
  leido: boolean;
  fechaLeido?: string;
  destacado: boolean;
  esMio: boolean;
  fechaEnvio: string;
}

export interface ConversacionItem {
  id: number;
  asunto: string;
  cursoId?: number;
  cursoNombre?: string;
  tipo: string;
  prioridad: 'NORMAL' | 'IMPORTANTE' | 'URGENTE';
  emisorId?: number;
  emisorNombre?: string;
  soyEmisor?: boolean;
  contactoId?: number;
  contactoNombre: string;
  contactoCorreo: string;
  contactoRol: string;
  ultimoMensajeRemitenteId?: number;
  tieneMensajesRecibidos?: boolean;
  tieneMensajesEnviados?: boolean;
  tieneDestacados?: boolean;
  ultimoMensaje?: string;
  fechaUltimoMensaje?: string;
  totalMensajes: number;
  noLeidosCount: number;
  mensajes?: MensajeItem[];
  fechaCreacion: string;
}

export interface DestinatarioItem {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
  cursoNombre?: string;
  cursoId?: number;
}

export interface BuzonResumen {
  totalRecibidos: number;
  totalNoLeidos: number;
  totalEnviados: number;
  totalDestacados: number;
}

export type CarpetaBuzon = 'RECIBIDOS' | 'ENVIADOS' | 'NO_LEIDOS' | 'DESTACADOS';
