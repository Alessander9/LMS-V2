export interface LoginResponse {
  token: string;
  refreshToken?: string;
  nombres: string;
  apellidos: string;
  rol: string;
  isExpUser?: boolean;
  expDurationSeconds?: number;
}
