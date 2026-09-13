export interface UserProfile {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  nivelSuscripcion?: string;
  isExpUser?: boolean;
  expDurationSeconds?: number;
}
