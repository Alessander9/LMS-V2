import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-sedes-v2',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './sedes-v2.component.html',
  styleUrls: ['./sedes-v2.component.css']
})
export class SedesV2Component {
  activeTab: 'huanuco' | 'lima' | 'piura' = 'huanuco';

  // Lightbox Modal state
  isModalOpen = false;
  modalImageUrl = '';

  // Lima Carousel state
  limaActiveIndex = 0;
  limaImages = ['assets/SedeLima1.jpg', 'assets/SedeLima2.jpg'];

  setActiveTab(tab: 'huanuco' | 'lima' | 'piura'): void {
    this.activeTab = tab;
  }

  openModal(imageUrl: string): void {
    this.modalImageUrl = imageUrl;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalImageUrl = '';
  }

  nextLimaImage(): void {
    this.limaActiveIndex = (this.limaActiveIndex + 1) % this.limaImages.length;
  }

  prevLimaImage(): void {
    this.limaActiveIndex = (this.limaActiveIndex - 1 + this.limaImages.length) % this.limaImages.length;
  }
}
