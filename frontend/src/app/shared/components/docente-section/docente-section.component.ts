import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DocenteSpecialty {
  icon: string;
  label: string;
}

export interface DocenteData {
  nombre: string;
  cargo: string;
  biografia: string;
  fotoUrl: string;
  kicker: string;
  especialidades: DocenteSpecialty[];
}

@Component({
  selector: 'app-docente-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docente-section.component.html'
})
export class DocenteSectionComponent {
  @Input() docente?: DocenteData;
  @Input() docenteSecundario?: DocenteData;
}
