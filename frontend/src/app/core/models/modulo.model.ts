export interface ModuloRequest {
  cursoId: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface ModuloResponse {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
  estado: boolean;
  cursoId: number;
  cursoNombre: string;
}
