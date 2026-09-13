export interface AnuncioModalItem {
  id: number;
  titulo: string;
  mensaje?: string;
  imagenUrl?: string;
  botonTexto?: string;
  botonUrl?: string;
  audiencia: 'TODOS' | 'SOLO_ESTUDIANTES' | 'SOLO_DOCENTES' | 'DOCENTES_Y_ESTUDIANTES';
  activo: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  creadoPor?: string;
  fechaCreacion: string;
}

export interface AnuncioModalRequest {
  titulo: string;
  mensaje?: string;
  imagenUrl?: string;
  botonTexto?: string;
  botonUrl?: string;
  audiencia: 'TODOS' | 'SOLO_ESTUDIANTES' | 'SOLO_DOCENTES' | 'DOCENTES_Y_ESTUDIANTES';
  activo?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
}
