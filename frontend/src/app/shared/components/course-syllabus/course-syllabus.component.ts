import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SyllabusItem {
  number: string;
  title: string;
  badge1: string;
  badge2: string;
  description: string;
}

export interface SyllabusPhase {
  id: string;
  title: string;
  tabLabel: string;
  subtitle?: string;
  description: string;
  image: string;
  imageAlt: string;
  specimenLabel: string;
  items: SyllabusItem[];
}

@Component({
  selector: 'app-course-syllabus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-syllabus.component.html'
})
export class CourseSyllabusComponent {
  @Input() phases: SyllabusPhase[] = [];
  activePhaseId = 'fase1';

  showLightbox = false;
  lightboxImage = '';

  setPhase(phaseId: string): void {
    this.activePhaseId = phaseId;
  }

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
