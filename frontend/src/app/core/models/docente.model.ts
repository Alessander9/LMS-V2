export interface DocenteRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  password?: string;
}

export interface DocenteResponse {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  nivelSuscripcion: string;
  estado: boolean;
  fechaRegistro: string;
}
