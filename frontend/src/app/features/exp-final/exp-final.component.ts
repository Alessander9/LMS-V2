import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-exp-final',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exp-final.component.html',
  styleUrls: ['./exp-final.component.css']
})
export class ExpFinalComponent {
  readonly whatsappMatriculaUrl = 'https://wa.me/51939371250?text=Hola%2C+vengo+de+probar+la+experiencia+EXP+Plataforma LMS+y+deseo+matricularme+en+un+curso';
  readonly whatsappAsesorUrl = 'https://wa.me/51939371250?text=Hola%2C+tengo+consultas+sobre+los+cursos+y+certificaciones+de+Plataforma LMS';
  
  readonly socialLinks = [
    {
      name: 'TikTok',
      handle: '@terapias.integrales',
      url: 'https://www.tiktok.com/@terapias.integrales',
      icon: '🎵',
      btnClass: 'social-pill--tiktok'
    },
    {
      name: 'Instagram',
      handle: '@institutodeterapias',
      url: 'https://www.instagram.com/institutodeterapias/?hl=es%20Plataforma LMS',
      icon: '📸',
      btnClass: 'social-pill--instagram'
    },
    {
      name: 'Facebook',
      handle: 'Plataforma LMS',
      url: 'https://www.facebook.com/Plataforma LMS',
      icon: '📘',
      btnClass: 'social-pill--facebook'
    },
    {
      name: 'YouTube',
      handle: 'Plataforma LMS Perú',
      url: 'https://www.youtube.com/@Plataforma LMSperucursosterapiasc4318',
      icon: '🎥',
      btnClass: 'social-pill--youtube'
    }
  ];
}
