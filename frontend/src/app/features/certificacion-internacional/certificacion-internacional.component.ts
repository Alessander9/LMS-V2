import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Beneficio {
  icon: string;
  title: string;
  description: string;
}

interface Paso {
  numero: string;
  title: string;
  description: string;
  icon: string;
}

interface Reconocimiento {
  pais: string;
  bandera: string;
  descripcion: string;
}

@Component({
  selector: 'app-certificacion-internacional',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './certificacion-internacional.component.html',
  styleUrls: ['./certificacion-internacional.component.css']
})
export class CertificacionInternacionalComponent {

  beneficios: Beneficio[] = [
    {
      icon: 'workspace_premium',
      title: 'Reconocimiento Internacional',
      description: 'Nuestros certificados son reconocidos por organizaciones y asociaciones de terapias complementarias en más de 12 países de América y Europa.'
    },
    {
      icon: 'verified_user',
      title: 'Código QR de Verificación',
      description: 'Cada certificado incluye un código QR único que permite verificar su autenticidad en línea de forma instantánea y segura.'
    },
    {
      icon: 'school',
      title: 'Aval Académico',
      description: 'Respaldados por docentes con formación clínica y académica certificada, garantizando el más alto nivel de rigor profesional.'
    },
    {
      icon: 'translate',
      title: 'Certificado Bilingüe',
      description: 'Disponible en español e inglés para facilitar su uso en contextos internacionales y procesos de homologación.'
    },
    {
      icon: 'groups',
      title: 'Red Profesional Global',
      description: 'Al certificarte con Plataforma LMS accedes a una red de profesionales y egresados activos en más de 15 países.'
    },
    {
      icon: 'security',
      title: 'Respaldo Institucional',
      description: 'Plataforma LMS emite certificados con sello institucional, firma del director académico y número de registro único.'
    }
  ];

  pasos: Paso[] = [
    {
      numero: '01',
      icon: 'menu_book',
      title: 'Completa tu formación',
      description: 'Finaliza satisfactoriamente el programa académico online o presencial con nota aprobatoria.'
    },
    {
      numero: '02',
      icon: 'assignment_turned_in',
      title: 'Evaluación final',
      description: 'Aprueba la evaluación de conocimientos y, en cursos presenciales, la práctica clínica supervisada.'
    },
    {
      numero: '03',
      icon: 'workspace_premium',
      title: 'Emisión del certificado',
      description: 'Plataforma LMS emite tu certificado digital con código único de verificación en un plazo de 5 días hábiles.'
    },
    {
      numero: '04',
      icon: 'download',
      title: 'Descarga y comparte',
      description: 'Accede a tu certificado desde el campus virtual, descárgalo en PDF y compártelo en tu perfil profesional.'
    }
  ];

  reconocimientos: Reconocimiento[] = [
    { pais: 'Perú', bandera: '🇵🇪', descripcion: 'País sede y origen académico de Plataforma LMS' },
    { pais: 'Colombia', bandera: '🇨🇴', descripcion: 'Red de profesionales en terapias complementarias' },
    { pais: 'México', bandera: '🇲🇽', descripcion: 'Asociaciones de medicina natural y alternativa' },
    { pais: 'España', bandera: '🇪🇸', descripcion: 'Organizaciones de terapias naturales europeas' },
    { pais: 'Argentina', bandera: '🇦🇷', descripcion: 'Colegios de terapeutas holísticos' },
    { pais: 'Chile', bandera: '🇨🇱', descripcion: 'Centros de medicina integrativa' }
  ];
}
