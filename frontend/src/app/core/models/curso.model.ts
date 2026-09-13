export interface CursoRequest {
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelesSuscripcionIds: number[];
  docenteId?: number;
}

export interface CursoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelesSuscripcion: string[];
  estado: boolean;
  docenteId?: number;
  docenteNombre?: string;
  fechaCreacion: string;
}
