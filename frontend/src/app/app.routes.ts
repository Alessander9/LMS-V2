import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  // ================================================================
  //  REDIRECCIÓN RAÍZ
  // ================================================================
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  // ================================================================
  //  RUTAS PÚBLICAS  (sin autenticación)
  // ================================================================
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'inicio.html',
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'programas',
    loadComponent: () => import('./features/programas/programas.component').then(m => m.ProgramasComponent)
  },
  {
    path: 'programas.html',
    loadComponent: () => import('./features/programas/programas.component').then(m => m.ProgramasComponent)
  },
  {
    path: 'libros',
    loadComponent: () => import('./features/libros/libros.component').then(m => m.LibrosComponent)
  },
  {
    path: 'libros.html',
    loadComponent: () => import('./features/libros/libros.component').then(m => m.LibrosComponent)
  },
  {
    path: 'biblioteca',
    loadComponent: () => import('./features/libros/libros.component').then(m => m.LibrosComponent)
  },
  {
    path: 'sedes',
    loadComponent: () => import('./features/sedes/sedes.component').then(m => m.SedesComponent)
  },
  {
    path: 'sedes.html',
    loadComponent: () => import('./features/sedes/sedes.component').then(m => m.SedesComponent)
  },
  {
    path: 'recursos',
    loadComponent: () => import('./features/recursos/recursos.component').then(m => m.RecursosComponent)
  },
  {
    path: 'recursos.html',
    loadComponent: () => import('./features/recursos/recursos.component').then(m => m.RecursosComponent)
  },
  {
    path: 'certificacion',
    loadComponent: () => import('./features/certificacion/certificacion.component').then(m => m.CertificacionComponent)
  },
  {
    path: 'certificacion.html',
    loadComponent: () => import('./features/certificacion/certificacion.component').then(m => m.CertificacionComponent)
  },
  {
    path: 'bolsa-de-trabajo',
    loadComponent: () => import('./features/bolsa-de-trabajo/bolsa-de-trabajo.component').then(m => m.BolsaDeTrabajoComponent)
  },
  {
    path: 'bolsa-de-trabajo.html',
    loadComponent: () => import('./features/bolsa-de-trabajo/bolsa-de-trabajo.component').then(m => m.BolsaDeTrabajoComponent)
  },
  {
    path: 'por-que-elegirnos',
    loadComponent: () => import('./features/por-que-elegirnos/por-que-elegirnos.component').then(m => m.PorQueElegirnosComponent)
  },
  {
    path: 'por-que-elegirnos.html',
    loadComponent: () => import('./features/por-que-elegirnos/por-que-elegirnos.component').then(m => m.PorQueElegirnosComponent)
  },
  {
    path: 'como-aprenderas',
    loadComponent: () => import('./features/como-aprenderas/como-aprenderas.component').then(m => m.ComoAprenderasComponent)
  },
  {
    path: 'como-aprenderas.html',
    loadComponent: () => import('./features/como-aprenderas/como-aprenderas.component').then(m => m.ComoAprenderasComponent)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/cursos/cursos.component').then(m => m.PublicCursosComponent)
  },
  {
    path: 'TodosLosCursos.html',
    loadComponent: () => import('./features/cursos/cursos.component').then(m => m.PublicCursosComponent)
  },
  {
    path: 'cursos-presenciales',
    loadComponent: () => import('./features/cursos-presenciales/cursos-presenciales.component').then(m => m.CursosPresencialesComponent)
  },
  {
    path: 'cursos-presenciales.html',
    loadComponent: () => import('./features/cursos-presenciales/cursos-presenciales.component').then(m => m.CursosPresencialesComponent)
  },
  {
    path: 'cursos-online',
    loadComponent: () => import('./features/cursos-online/cursos-online.component').then(m => m.CursosOnlineComponent)
  },
  {
    path: 'cursos-online.html',
    loadComponent: () => import('./features/cursos-online/cursos-online.component').then(m => m.CursosOnlineComponent)
  },
  {
    path: 'cursos/auriculoterapia',
    loadComponent: () => import('./features/formaciones/auriculoterapia/auriculoterapia.component').then(m => m.AuriculoterapiaComponent)
  },
  {
    path: 'cursos/auriculoterapia.html',
    loadComponent: () => import('./features/formaciones/auriculoterapia/auriculoterapia.component').then(m => m.AuriculoterapiaComponent)
  },
  {
    path: 'cursos/acupuntura-china',
    loadComponent: () => import('./features/formaciones/acupuntura-china/acupuntura-china.component').then(m => m.AcupunturaChinaComponent)
  },
  {
    path: 'cursos/acupuntura-china.html',
    loadComponent: () => import('./features/formaciones/acupuntura-china/acupuntura-china.component').then(m => m.AcupunturaChinaComponent)
  },
  {
    path: 'cursos/masaje-terapeutico',
    loadComponent: () => import('./features/formaciones/masaje-terapeutico/masaje-terapeutico.component').then(m => m.MasajeTerapeticoComponent)
  },
  {
    path: 'cursos/masaje-terapeutico.html',
    loadComponent: () => import('./features/formaciones/masaje-terapeutico/masaje-terapeutico.component').then(m => m.MasajeTerapeticoComponent)
  },
  {
    path: 'cursos/paralisis-facial-acupuntura-fisioterapia-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/control-peso-auriculoterapia-acupuntura-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/stretching-terapeutico-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/acupuntura-estetica-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/reflexologia-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/seminario-reflexologia-online',
    loadComponent: () => import('./features/formaciones/seminario-reflexologia-online/seminario-reflexologia-online.component').then(m => m.SeminarioReflexologiaOnlineComponent)
  },
  {
    path: 'cursos/electroacupuntura',
    loadComponent: () => import('./features/formaciones/electroacupuntura/electroacupuntura.component').then(m => m.ElectroacupunturaComponent)
  },
  {
    path: 'cursos/electroacupuntura.html',
    loadComponent: () => import('./features/formaciones/electroacupuntura/electroacupuntura.component').then(m => m.ElectroacupunturaComponent)
  },
  {
    path: 'cursos/electroacupuntura-online',
    loadComponent: () => import('./features/formaciones/electroacupuntura/electroacupuntura.component').then(m => m.ElectroacupunturaComponent)
  },
  {
    path: 'cursos/electroacupuntura-online.html',
    loadComponent: () => import('./features/formaciones/electroacupuntura/electroacupuntura.component').then(m => m.ElectroacupunturaComponent)
  },
  {
    path: 'cursos/digitopresion-presencial',
    loadComponent: () => import('./features/formaciones/digitopresion-presencial/digitopresion-presencial.component').then(m => m.DigitopresionPresencialComponent)
  },
  {
    path: 'cursos/auriculoterapia-presencial',
    loadComponent: () => import('./features/formaciones/auriculoterapia-presencial/auriculoterapia-presencial.component').then(m => m.AuriculoterapiaPresencialComponent)
  },
  {
    path: 'cursos/acupuntura-china-7-meses',
    loadComponent: () => import('./features/formaciones/acupuntura-china-7-meses/acupuntura-china-7-meses.component').then(m => m.AcupunturaChina7MesesComponent)
  },
  {
    path: 'cursos/acupuntura-china-7-meses.html',
    loadComponent: () => import('./features/formaciones/acupuntura-china-7-meses/acupuntura-china-7-meses.component').then(m => m.AcupunturaChina7MesesComponent)
  },
  {
    path: 'cursos/acupuntura-presencial',
    loadComponent: () => import('./features/formaciones/acupuntura-presencial/acupuntura-presencial.component').then(m => m.AcupunturaPresencialComponent)
  },
  {
    path: 'cursos/dietetica-presencial',
    loadComponent: () => import('./features/formaciones/dietetica-presencial/dietetica-presencial.component').then(m => m.DieteticaPresencialComponent)
  },
  {
    path: 'cursos/fitoterapia-presencial',
    loadComponent: () => import('./features/formaciones/fitoterapia-presencial/fitoterapia-presencial.component').then(m => m.FitoterapiaPresencialComponent)
  },
  {
    path: 'cursos/aromaterapia-flores-bach',
    loadComponent: () => import('./features/formaciones/aromaterapia-flores-bach/aromaterapia-flores-bach.component').then(m => m.AromaterapiaFloresBachComponent)
  },
  {
    path: 'cursos/acupuntura-estetica-presencial',
    loadComponent: () => import('./features/formaciones/acupuntura-estetica-presencial/acupuntura-estetica-presencial.component').then(m => m.AcupunturaEsteticaPresencialComponent)
  },
  {
    path: 'cursos/moxibustion-ventosas-presencial',
    loadComponent: () => import('./features/formaciones/moxibustion-ventosas-presencial/moxibustion-ventosas-presencial.component').then(m => m.MoxibustionVentosasPresencialComponent)
  },
  {
    path: 'cursos/paralisis-facial-presencial',
    loadComponent: () => import('./features/formaciones/paralisis-facial-presencial/paralisis-facial-presencial.component').then(m => m.ParalisisFacialPresencialComponent)
  },
  {
    path: 'cursos/reflexologia-podal-presencial',
    loadComponent: () => import('./features/formaciones/reflexologia-podal-presencial/reflexologia-podal-presencial.component').then(m => m.ReflexologiaPodalPresencialComponent)
  },
  {
    path: 'cursos/stretching-terapeutico-presencial',
    loadComponent: () => import('./features/formaciones/stretching-terapeutico-presencial/stretching-terapeutico-presencial.component').then(m => m.StretchingTerapeticoPresencialComponent)
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./features/cursos/curso-detalle-publico/curso-detalle-publico.component').then(m => m.CursoDetallePublicoComponent)
  },
  {
    path: 'certificados/validar/:codigo',
    loadComponent: () => import('./features/validar-certificado/validar-certificado.component').then(m => m.ValidarCertificadoComponent)
  },

  // ================================================================
  //  ACCESOS DIRECTOS OCULTOS MASTER OPS
  // ================================================================
  { path: 'master-ops', redirectTo: 'dashboard/master-ops', pathMatch: 'full' },
  { path: 'ops-console', redirectTo: 'dashboard/master-ops', pathMatch: 'full' },

  // ================================================================
  //  AUTENTICACIÓN & EXPERIENCIA EXP Plataforma LMS
  // ================================================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'exp-final',
    loadComponent: () => import('./features/exp-final/exp-final.component').then(m => m.ExpFinalComponent)
  },

  // ================================================================
  //  DASHBOARD  (requiere autenticación — authGuard)
  //  Sub-rutas protegidas por rol con roleGuard
  // ================================================================
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [

      // ── Home (todos los roles) ──
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },

      // ── Perfil (todos los roles) ──
      {
        path: 'perfil',
        loadComponent: () => import('./features/dashboard/perfil/perfil.component').then(m => m.PerfilComponent)
      },

      // ── ADMINISTRADOR ─────────────────────────────────────────
      {
        path: 'alumnos',
        loadComponent: () => import('./features/dashboard/alumnos/alumnos.component').then(m => m.AlumnosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'docentes',
        loadComponent: () => import('./features/dashboard/docentes/docentes.component').then(m => m.DocentesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/dashboard/cursos/cursos.component').then(m => m.CursosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] },
        pathMatch: 'full'
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/dashboard/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./features/dashboard/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'sistema',
        loadComponent: () => import('./features/dashboard/sistema/sistema.component').then(m => m.SistemaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'comunicados',
        loadComponent: () => import('./features/dashboard/admin/comunicados-anuncios/comunicados-anuncios.component').then(m => m.ComunicadosAnunciosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO'] }
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./features/dashboard/mensajes/mensajes.component').then(m => m.MensajesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO'] }
      },
      {
        path: 'master-ops',
        loadComponent: () => import('./features/master-ops/master-ops.component').then(m => m.MasterOpsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },

      // ── ADMINISTRADOR + DOCENTE ───────────────────────────────
      {
        path: 'cursos/:id',
        loadComponent: () => import('./features/dashboard/cursos/curso-detalle/curso-detalle.component').then(m => m.CursoDetalleComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },
      {
        path: 'modulos/:id/videos',
        loadComponent: () => import('./features/dashboard/videos/videos.component').then(m => m.VideosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },
      {
        path: 'modulos/:id/materiales',
        loadComponent: () => import('./features/dashboard/materiales/materiales.component').then(m => m.MaterialesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },

      // ── DOCENTE ───────────────────────────────────────────────
      {
        path: 'mis-cursos-docente',
        loadComponent: () => import('./features/dashboard/docente/mis-cursos-docente/mis-cursos-docente.component').then(m => m.MisCursosDocenteComponent),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] }
      },
      {
        path: 'mis-alumnos-docente/:id',
        loadComponent: () => import('./features/dashboard/docente/mis-alumnos-docente/mis-alumnos-docente.component').then(m => m.MisAlumnosDocenteComponent),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] }
      },
      {
        path: 'docente/tareas',
        loadComponent: () => import('./features/dashboard/docente/docente-tareas/docente-tareas.component').then(m => m.DocenteTareasComponent),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE', 'ADMINISTRADOR'] }
      },

      // ── ALUMNO ────────────────────────────────────────────────
      {
        path: 'mis-cursos',
        loadComponent: () => import('./features/dashboard/mis-cursos/mis-cursos.component').then(m => m.MisCursosComponent)
      },
      {
        path: 'mis-tareas',
        loadComponent: () => import('./features/dashboard/alumno/mis-tareas/mis-tareas.component').then(m => m.MisTareasComponent),
        canActivate: [roleGuard],
        data: { roles: ['ALUMNO', 'ADMINISTRADOR'] }
      },
      {
        path: 'cursos-play/:id',
        loadComponent: () => import('./features/dashboard/play-curso/play-curso.component').then(m => m.PlayCursoComponent)
      },

      // ── MÓDULOS ESCOLARES E INSTITUTOS (QR, NOTAS DUALES, ESTUDIANTES) ──
      {
        path: 'asistencia-qr',
        loadComponent: () => import('./features/academico/asistencia-qr/asistencia-qr.component').then(m => m.AsistenciaQrComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO'] }
      },
      {
        path: 'gestion-notas',
        loadComponent: () => import('./features/academico/gestion-notas/gestion-notas.component').then(m => m.GestionNotasComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO'] }
      },
      {
        path: 'estudiantes',
        loadComponent: () => import('./features/academico/gestion-estudiantes/gestion-estudiantes.component').then(m => m.GestionEstudiantesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },

      // ── ALUMNO + ADMINISTRADOR ────────────────────────────────
      {
        path: 'certificados',
        loadComponent: () => import('./features/dashboard/certificados/certificados.component').then(m => m.CertificadosComponent)
      },
    ]
  },

  // ================================================================
  //  WILDCARD — redirige al login si no hay match
  // ================================================================
  { path: '**', redirectTo: 'login' }
];
