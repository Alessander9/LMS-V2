export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}
