export interface ConfiguracionResponse {
  id: number;
  nombreInstitucion: string;
  logoUrl: string;
  correo: string;
  telefono: string;
  direccion: string;
  qrYape: string;
  qrPlin: string;
  paypalUrl: string;
  colorPrincipal: string;
  colorSecundario: string;
}

export interface ConfiguracionRequest {
  nombreInstitucion: string;
  logoUrl: string;
  correo: string;
  telefono: string;
  direccion: string;
  qrYape: string;
  qrPlin: string;
  paypalUrl: string;
  colorPrincipal: string;
  colorSecundario: string;
}
