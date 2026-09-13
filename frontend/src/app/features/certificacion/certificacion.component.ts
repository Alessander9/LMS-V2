import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-certificacion',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './certificacion.component.html',
  styleUrls: []
})
export class CertificacionComponent {
  showLightbox = false;
  lightboxImage = '';

  openLightbox(imagePath: string): void {
    this.lightboxImage = imagePath;
    this.showLightbox = true;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox(): void {
    this.showLightbox = false;
    this.lightboxImage = '';
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
