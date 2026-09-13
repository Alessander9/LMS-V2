import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SkeletonLoaderComponent } from '../../core/components/skeleton-loader/skeleton-loader.component';
import { CertificadoService, CertificadoResponse } from '../../core/services/';

interface ValidationPayload {
  valido: boolean;
  alumno: string;
  curso: string;
  fechaEmision: string;
  codigo: string;
}

@Component({
  selector: 'app-validar-certificado',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  templateUrl: './validar-certificado.component.html',
  styleUrls: ['./validar-certificado.component.css']
})
export class ValidarCertificadoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private certificadoService = inject(CertificadoService);

  codigo = '';
  validationData: ValidationPayload | null = null;
  errorMsg = '';
  isLoading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const codeParam = params.get('codigo');
      if (codeParam) {
        this.codigo = codeParam;
        this.validateCode();
      } else {
        this.isLoading = false;
        this.errorMsg = 'No se ha proporcionado un código de validación.';
      }
    });
  }

  validateCode(): void {
    this.certificadoService.validarCertificado(this.codigo).subscribe({
      next: (res: any) => {
        this.validationData = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'El certificado ingresado no es válido o no está registrado en nuestro sistema.';
      }
    });
  }
}
