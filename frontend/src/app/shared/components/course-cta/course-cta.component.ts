import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CourseCtaFaq {
  pregunta: string;
  respuesta: string;
  icon: string;
}

export interface CourseCtaData {
  precio: number;
  cuotasInfo: string;
  plazasDisponibles: number;
  whatsappLink: string;
  email: string;
  beneficios: string[];
  headlineHtml: string; // To support highlighted inline styles like <span class="text-secondary">...</span>
  description: string;
  faqs: CourseCtaFaq[];
  trustText: string;
}

@Component({
  selector: 'app-course-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-cta.component.html'
})
export class CourseCtaComponent {
  @Input() ctaData?: CourseCtaData;
}
