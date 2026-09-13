import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { UserProfile } from '../models/user-profile.model';
import { TokenRefreshRequest, TokenRefreshResponse } from '../models/token-refresh.model';
import { ChangePasswordRequest } from '../models/change-password-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl + '/auth';

  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public isExpUserSubject = new BehaviorSubject<boolean>(this.checkIsExpUser());
  public expRemainingSeconds$ = new BehaviorSubject<number>(this.calculateRemainingExpSeconds());
  private expTimerInterval: any = null;

  constructor() {
    if (this.isExpUser()) {
      this.initExpTimerFromStorage();
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        if (res && res.token) {
          this.saveToken(res.token);
        }
        if (res && res.refreshToken) {
          this.saveRefreshToken(res.refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }
        if (res && res.rol) {
          this.saveUserRole(res.rol);
        }
        
        if (res?.isExpUser) {
          const duration = res.expDurationSeconds || 1200;
          this.startExpTimer(duration);
        } else {
          this.clearExpState();
        }
      })
    );
  }

  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: TokenRefreshRequest = { refreshToken };
    return this.http.post<TokenRefreshResponse>(`${this.apiUrl}/refresh`, request).pipe(
      tap(res => {
        if (res?.token) {
          this.saveToken(res.token);
        }
        if (res?.refreshToken) {
          this.saveRefreshToken(res.refreshToken);
        }
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
      tap(profile => {
        if (profile?.isExpUser) {
          if (!this.isExpUser()) {
            this.startExpTimer(profile.expDurationSeconds || 1200);
          }
        }
      })
    );
  }

  logout(): void {
    this.stopExpTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    this.clearExpState();
  }

  logoutRemote(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => this.logout())
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
  }

  saveUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // =========================================================================
  //  MÉTODOS EXP Plataforma LMS (Sesión 20 Minutos)
  // =========================================================================

  public isExpUser(): boolean {
    const isExp = localStorage.getItem('isExpUser') === 'true';
    if (!isExp) return false;
    const remaining = this.calculateRemainingExpSeconds();
    if (remaining <= 0) {
      this.clearExpState();
      return false;
    }
    return true;
  }

  private checkIsExpUser(): boolean {
    return this.isExpUser();
  }

  public startExpTimer(durationSeconds: number = 1200): void {
    const now = Date.now();
    const expiresAt = now + (durationSeconds * 1000);
    
    localStorage.setItem('isExpUser', 'true');
    localStorage.setItem('expExpiresAt', expiresAt.toString());
    this.isExpUserSubject.next(true);

    this.initExpTimerFromStorage();
  }

  private initExpTimerFromStorage(): void {
    this.stopExpTimer();
    
    const tick = () => {
      const remaining = this.calculateRemainingExpSeconds();
      this.expRemainingSeconds$.next(remaining);

      if (remaining <= 0) {
        this.stopExpTimer();
        this.handleExpExpired();
      }
    };

    tick();
    this.expTimerInterval = setInterval(tick, 1000);
  }

  private calculateRemainingExpSeconds(): number {
    const expExpiresAtStr = localStorage.getItem('expExpiresAt');
    if (!expExpiresAtStr) return 0;
    
    const expiresAt = parseInt(expExpiresAtStr, 10);
    const now = Date.now();
    const diffSeconds = Math.floor((expiresAt - now) / 1000);
    return Math.max(0, diffSeconds);
  }

  public stopExpTimer(): void {
    if (this.expTimerInterval) {
      clearInterval(this.expTimerInterval);
      this.expTimerInterval = null;
    }
  }

  private clearExpState(): void {
    localStorage.removeItem('isExpUser');
    localStorage.removeItem('expExpiresAt');
    this.isExpUserSubject.next(false);
    this.expRemainingSeconds$.next(0);
    this.stopExpTimer();
  }

  public handleExpExpired(): void {
    this.logout();
    this.router.navigate(['/exp-final']);
  }

  forgotPassword(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { correo });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, request);
  }
}
