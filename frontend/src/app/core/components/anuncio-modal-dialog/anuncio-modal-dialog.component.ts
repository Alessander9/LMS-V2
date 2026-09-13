import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnuncioModalService } from '../../services/anuncio-modal.service';
import { AnuncioModalItem } from '../../models/anuncio-modal.model';

@Component({
  selector: 'app-anuncio-modal-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anuncio-modal-dialog.component.html',
  styleUrls: ['./anuncio-modal-dialog.component.css']
})
export class AnuncioModalDialogComponent implements OnInit {
  private anuncioModalService = inject(AnuncioModalService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  anuncio: AnuncioModalItem | null = null;
  isVisible = false;
  isLightboxOpen = false;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isLightboxOpen) {
        this.cerrarLightbox();
      } else if (this.isVisible) {
        this.cerrar();
      }
    }
  }

  ngOnInit(): void {
    this.verificarAnuncio();
  }

  verificarAnuncio(): void {
    this.anuncioModalService.obtenerAnuncioActivo().subscribe({
      next: (anuncio) => {
        if (!anuncio || !anuncio.activo) return;

        // Comprobar control de frecuencia en localStorage
        const storageKey = `Plataforma LMS_anuncio_visto_${anuncio.id}`;
        const lastSeen = localStorage.getItem(storageKey);
        const hoy = new Date().toDateString();

        // Si ya lo vio hoy, no mostrar
        if (lastSeen === hoy) {
          return;
        }

        this.anuncio = anuncio;
        // Pequeño delay estético para que el dashboard cargue primero suavemente
        setTimeout(() => {
          this.isVisible = true;
        }, 1200);
      },
      error: () => {
        // En caso de fallo de red silencioso no bloquea la experiencia
      }
    });
  }

  abrirLightbox(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isLightboxOpen = true;
  }

  cerrarLightbox(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isLightboxOpen = false;
  }

  cerrar(): void {
    this.marcarComoVistoHoy();
    this.isLightboxOpen = false;
    this.isVisible = false;
  }

  ejecutarAccion(): void {
    if (!this.anuncio) return;

    this.marcarComoVistoHoy();
    this.isLightboxOpen = false;
    this.isVisible = false;

    if (this.anuncio.botonUrl && this.anuncio.botonUrl.trim() !== '') {
      const url = this.anuncio.botonUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('https://wa.me')) {
        window.open(url, '_blank');
      } else {
        this.router.navigateByUrl(url);
      }
    }
  }

  getFormattedHtml(rawText?: string): SafeHtml {
    if (!rawText) return '';
    const formatted = rawText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n/g, '<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private marcarComoVistoHoy(): void {
    if (!this.anuncio) return;
    const storageKey = `Plataforma LMS_anuncio_visto_${this.anuncio.id}`;
    localStorage.setItem(storageKey, new Date().toDateString());
  }
}
