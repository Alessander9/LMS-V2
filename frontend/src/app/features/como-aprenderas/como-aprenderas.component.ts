import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-como-aprenderas',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './como-aprenderas.component.html',
  styleUrls: ['./como-aprenderas.component.css']
})
export class ComoAprenderasComponent {}
