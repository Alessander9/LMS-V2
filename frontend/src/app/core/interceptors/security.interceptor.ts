import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const token = authService.getToken();

  // Solo estas rutas son verdaderamente públicas (no necesitan token)
  const isPublicRequest =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/refresh') ||
    req.url.includes('/api/auth/logout') ||
    req.url.includes('/api/auth/forgot-password') ||
    req.url.includes('/api/auth/reset-password') ||
    req.url.includes('/api/certificados/validar/') ||
    req.url.includes('/api/chatbot/') ||
    req.url.includes('/api/anuncios-modal/activo') ||
    req.url.includes('/actuator/');

  // /api/auth/me y cualquier otra ruta SÍ necesitan el token
  if (token && !isPublicRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  const skipErrorNotification = req.headers.has('X-Skip-Error-Notification');

  return next(req).pipe(
    catchError(error => {
      if (!skipErrorNotification) {
        if (error?.status === 0) {
          toastService.error('No se pudo establecer conexión con el servidor. Verifica tu conexión de red.', 'Error de Conexión');
        } else if (error?.status === 500) {
          toastService.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.', 'Error del Servidor');
        }
      }

      if (error?.status !== 401 || isPublicRequest) {
        return throwError(() => error);
      }

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { expired: 'true' } });
        return throwError(() => error);
      }

      // Si ya hay un refresco de token en proceso, esperar el nuevo token
      if (authService.isRefreshing) {
        return authService.refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(newToken => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          })
        );
      }

      // Si no hay un refresco en curso, iniciamos uno
      authService.isRefreshing = true;
      authService.refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap(tokenResponse => {
          authService.isRefreshing = false;
          const newToken = tokenResponse?.token || '';
          authService.refreshTokenSubject.next(newToken);

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next(retryReq);
        }),
        catchError(refreshError => {
          authService.isRefreshing = false;
          authService.refreshTokenSubject.error(refreshError);
          authService.logout();
          router.navigate(['/login'], { queryParams: { expired: 'true' } });
          return throwError(() => refreshError);
        })
      );
    })
  );
};
