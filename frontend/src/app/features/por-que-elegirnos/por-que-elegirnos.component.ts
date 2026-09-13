import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-por-que-elegirnos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './por-que-elegirnos.component.html',
  styleUrls: ['./por-que-elegirnos.component.css']
})
export class PorQueElegirnosComponent {
  // Simulator inputs
  pacientesPorSemana = 5;
  precioSesion = 80;

  get ingresosSemanales(): number {
    return this.pacientesPorSemana * this.precioSesion;
  }

  get ingresosMensuales(): number {
    return this.ingresosSemanales * 4;
  }

  get recuperacionCurso(): string {
    const costoCurso = 180; // Reiki course average S/ 180
    const semanas = costoCurso / this.ingresosSemanales;
    if (semanas <= 1) return 'Menos de 1 semana';
    return `${semanas.toFixed(1)} semanas`;
  }

  get recuperacionDiplomado(): string {
    const costoDiplomado = 1850; // Average S/ 1,850
    const semanas = costoDiplomado / this.ingresosSemanales;
    if (semanas <= 1) return 'Menos de 1 semana';
    return `${semanas.toFixed(1)} semanas`;
  }

  ajustarPacientes(valor: number) {
    this.pacientesPorSemana = Math.max(1, Math.min(25, this.pacientesPorSemana + valor));
  }

  ajustarPrecio(valor: number) {
    this.precioSesion = Math.max(30, Math.min(350, this.precioSesion + valor));
  }
}
