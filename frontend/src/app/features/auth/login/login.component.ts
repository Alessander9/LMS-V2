import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/';
import { ToastService } from '../../../core/services/';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  loginForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  // Recovery state
  showRecoveryModal = false;
  recoveryEmail = '';
  recoveryToken = '';
  recoveryNewPassword = '';
  recoveryStep = 1; // 1 = request token, 2 = reset password
  recoveryMessage = '';
  recoveryError = '';
  isRecoveryLoading = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true') {
        this.toastService.warning(
          'Tu sesión ha expirado. Por favor ingresa tus credenciales nuevamente.',
          'Sesión Expirada'
        );
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { expired: null },
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  openRecoveryModal(): void {
    this.showRecoveryModal = true;
    this.recoveryEmail = '';
    this.recoveryToken = '';
    this.recoveryNewPassword = '';
    this.recoveryStep = 1;
    this.recoveryMessage = '';
    this.recoveryError = '';
    this.isRecoveryLoading = false;
  }

  closeRecoveryModal(): void {
    this.showRecoveryModal = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showRecoveryModal) {
      this.closeRecoveryModal();
    }
  }

  onRequestToken(): void {
    if (!this.recoveryEmail || !this.recoveryEmail.includes('@')) {
      this.recoveryError = 'Por favor ingrese un correo válido';
      return;
    }
    this.isRecoveryLoading = true;
    this.recoveryError = '';
    this.recoveryMessage = '';

    this.authService.forgotPassword(this.recoveryEmail).subscribe({
      next: (res) => {
        this.isRecoveryLoading = false;
        this.recoveryStep = 2;
        this.recoveryMessage = res.mensaje || 'Se ha enviado un código de recuperación a tu correo.';
      },
      error: (err) => {
        this.isRecoveryLoading = false;
        this.recoveryError = err.error?.message || 'Error al solicitar el código de recuperación. Inténtalo de nuevo.';
      }
    });
  }

  onResetPassword(): void {
    if (!this.recoveryToken) {
      this.recoveryError = 'Por favor ingrese el código de recuperación';
      return;
    }
    if (!this.recoveryNewPassword || this.recoveryNewPassword.length < 6) {
      this.recoveryError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    this.isRecoveryLoading = true;
    this.recoveryError = '';
    this.recoveryMessage = '';

    this.authService.resetPassword(this.recoveryToken, this.recoveryNewPassword).subscribe({
      next: (res) => {
        this.isRecoveryLoading = false;
        this.recoveryMessage = res.mensaje || 'Contraseña restablecida exitosamente.';
        // Clear inputs
        setTimeout(() => {
          this.closeRecoveryModal();
        }, 3000);
      },
      error: (err) => {
        this.isRecoveryLoading = false;
        this.recoveryError = err.error?.message || 'Error al restablecer la contraseña. Verifique su código.';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    let { correo, password } = this.loginForm.value;
    if (correo) {
      correo = correo.trim();
    }

    this.authService.login({ correo, password }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.toastService.success('¡Bienvenido al campus virtual Plataforma LMS!');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al conectar con el servidor. Verifique sus credenciales.';
        this.toastService.error(this.errorMessage, 'Fallo de Autenticación');
      }
    });
  }
}
