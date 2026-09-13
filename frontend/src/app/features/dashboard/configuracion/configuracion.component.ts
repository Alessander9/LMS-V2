import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { ConfiguracionService } from '../../../core/services/';
import { ConfiguracionRequest, ConfiguracionResponse } from '../../../core/models/';
import { ToastService } from '../../../core/services/';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SkeletonLoaderComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  private configService = inject(ConfiguracionService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  configForm: FormGroup = this.fb.group({
    nombreInstitucion: ['', [Validators.required]],
    logoUrl: [''],
    correo: ['', [Validators.email]],
    telefono: [''],
    direccion: [''],
    qrYape: [''],
    qrPlin: [''],
    paypalUrl: [''],
    colorPrincipal: ['#6366f1'],
    colorSecundario: ['#0b0f19']
  });

  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  activeTab: 'general' | 'pagos' | 'branding' = 'general';

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.isLoading = true;
    this.configService.obtenerConfiguracion().subscribe({
      next: (data) => {
        this.configForm.patchValue({
          nombreInstitucion: data.nombreInstitucion || '',
          logoUrl: data.logoUrl || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          qrYape: data.qrYape || '',
          qrPlin: data.qrPlin || '',
          paypalUrl: data.paypalUrl || '',
          colorPrincipal: data.colorPrincipal || '#6366f1',
          colorSecundario: data.colorSecundario || '#0b0f19'
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'Error al cargar la configuración.';
        console.error(err);
      }
    });
  }

  onSave(): void {
    if (this.configForm.invalid) return;

    this.isSaving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const request: ConfiguracionRequest = {
      nombreInstitucion: this.configForm.value.nombreInstitucion,
      logoUrl: this.configForm.value.logoUrl || '',
      correo: this.configForm.value.correo || '',
      telefono: this.configForm.value.telefono || '',
      direccion: this.configForm.value.direccion || '',
      qrYape: this.configForm.value.qrYape || '',
      qrPlin: this.configForm.value.qrPlin || '',
      paypalUrl: this.configForm.value.paypalUrl || '',
      colorPrincipal: this.configForm.value.colorPrincipal || '#6366f1',
      colorSecundario: this.configForm.value.colorSecundario || '#0b0f19'
    };

    this.configService.actualizarConfiguracion(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.success('Configuración guardada exitosamente.');
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err.error?.message || 'Error al guardar la configuración.';
        this.toastService.error(this.errorMsg);
        console.error(err);
      }
    });
  }

  setTab(tab: 'general' | 'pagos' | 'branding'): void {
    this.activeTab = tab;
  }
}
