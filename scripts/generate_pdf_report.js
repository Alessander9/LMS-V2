const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Completo del Sistema INSTEIP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.45;
      font-size: 9pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Cover / Header */
    .header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.15);
    }

    .header-banner::after {
      content: "";
      position: absolute;
      top: -30px;
      right: -30px;
      width: 140px;
      height: 140px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }

    .brand-title {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-subtitle {
      font-size: 11pt;
      font-weight: 500;
      color: #a7f3d0;
      margin-bottom: 12px;
    }

    .header-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 8pt;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.12);
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }

    /* Section Styling */
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #064e3b;
      margin-top: 18px;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 2px solid #10b981;
      display: flex;
      align-items: center;
      gap: 6px;
      page-break-after: avoid;
    }

    .section-desc {
      font-size: 8.5pt;
      color: #475569;
      margin-bottom: 10px;
    }

    /* Grid & Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      page-break-inside: avoid;
    }

    .card-highlight {
      border-left: 3px solid #059669;
      background: #f0fdf4;
    }

    .card-title {
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .card-body {
      font-size: 8pt;
      color: #334155;
      line-height: 1.35;
    }

    .card-body ul {
      margin-left: 14px;
      margin-top: 4px;
    }

    .card-body li {
      margin-bottom: 2px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 8pt;
      page-break-inside: avoid;
    }

    th, td {
      padding: 6px 8px;
      text-align: left;
      border: 1px solid #cbd5e1;
    }

    th {
      background-color: #047857;
      color: #ffffff;
      font-weight: 600;
      font-size: 8pt;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .badge-check {
      display: inline-block;
      color: #059669;
      font-weight: bold;
      text-align: center;
    }

    .badge-no {
      display: inline-block;
      color: #94a3b8;
      text-align: center;
    }

    /* Progress & Metrics */
    .progress-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .progress-bar-container {
      background: #e2e8f0;
      height: 14px;
      border-radius: 7px;
      overflow: hidden;
      margin: 6px 0 10px 0;
    }

    .progress-bar-fill {
      background: linear-gradient(90deg, #10b981 0%, #047857 100%);
      height: 100%;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 6px;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 700;
    }

    .stats-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .stat-pill {
      flex: 1;
      text-align: center;
      background: #f1f5f9;
      padding: 6px 4px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .stat-val {
      font-size: 11pt;
      font-weight: 800;
      color: #047857;
    }

    .stat-lbl {
      font-size: 6.8pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }

    .page-break {
      page-break-before: always;
    }

    .tag {
      display: inline-block;
      font-size: 7pt;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e0e7ff;
      color: #3730a3;
    }

    .tag-emerald {
      background: #d1fae5;
      color: #065f46;
    }

    .tag-amber {
      background: #fef3c7;
      color: #92400e;
    }

    .tag-blue {
      background: #e0f2fe;
      color: #0369a1;
    }

    .flow-step {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
    }

    .step-num {
      background: #047857;
      color: #fff;
      font-weight: 700;
      font-size: 7.5pt;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .step-text {
      font-size: 7.8pt;
      color: #334155;
    }

    .step-text strong {
      color: #0f172a;
    }

    .footer-note {
      margin-top: 20px;
      padding: 10px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 7.5pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- ENCABEZADO / COVER -->
  <div class="header-banner">
    <div class="brand-title">
      🌿 INSTEIP — Campus Virtual & Gestión Académica
    </div>
    <div class="brand-subtitle">
      Informe Técnico Integral: Funcionalidades, Flujos, Roles, Restricciones, Avance y Roadmap
    </div>
    <div class="header-meta">
      <div class="meta-item">📅 <strong>Fecha:</strong> Septiembre 2026</div>
      <div class="meta-item">⚡ <strong>Versión:</strong> 1.0.0 (Release Candidate)</div>
      <div class="meta-item">🛡️ <strong>Estado:</strong> Apto para Producción</div>
      <div class="meta-item">🎯 <strong>Progreso Global:</strong> ~94%</div>
      <div class="meta-item">💻 <strong>Stack:</strong> Java 21 · Spring Boot 3.4 · Angular 18 · PostgreSQL 15</div>
    </div>
  </div>

  <!-- RESUMEN EJECUTIVO Y MÉTRICAS -->
  <div class="progress-box">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: 700; font-size: 9.5pt; color: #0f172a;">Estado Global de Desarrollo y Madurez del Sistema</span>
      <span style="font-weight: 800; font-size: 11pt; color: #047857;">94% Completado</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: 94%;">94%</div>
    </div>
    <div class="stats-row">
      <div class="stat-pill">
        <div class="stat-val">22</div>
        <div class="stat-lbl">Controladores REST</div>
      </div>
      <div class="stat-pill">
        <div class="stat-val">21</div>
        <div class="stat-lbl">Entidades JPA</div>
      </div>
      <div class="stat-pill">
        <div class="stat-val">18</div>
        <div class="stat-lbl">Vistas Frontend</div>
      </div>
      <div class="stat-pill">
        <div class="stat-val">5</div>
        <div class="stat-lbl">Migraciones SQL</div>
      </div>
      <div class="stat-pill">
        <div class="stat-val">53</div>
        <div class="stat-lbl">Tests en Verde</div>
      </div>
      <div class="stat-pill">
        <div class="stat-val">100%</div>
        <div class="stat-lbl">Seguridad JWT</div>
      </div>
    </div>
  </div>

  <!-- 1. CATÁLOGO DE FUNCIONALIDADES -->
  <div class="section-title">1. Funcionalidades del Sistema por Módulos</div>
  <p class="section-desc">Estructura funcional modular implementada en backend y frontend.</p>

  <div class="grid-2">
    <div class="card card-highlight">
      <div class="card-title">🌐 Portal Público & Oferta Académica</div>
      <div class="card-body">
        <ul>
          <li><strong>Landing Page Institucional:</strong> Presentación, sedes (Lima Lince, Huánuco, Piura), metodología y bolsa de trabajo.</li>
          <li><strong>Catálogo de Cursos:</strong> Fichas informativas de diplomados y talleres en modalidades Online y Presencial.</li>
          <li><strong>Descarga de Temarios en PDF:</strong> Acceso público directo a los programas oficiales de estudio.</li>
          <li><strong>Validador QR de Certificados:</strong> Consulta pública por código alfanumérico o escaneo QR para verificar autenticidad y notas.</li>
          <li><strong>Chatbot IA (Llama 3 / Groq):</strong> Asistente interactivo flotante con información institucional en tiempo real.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">🔐 Autenticación & Seguridad Multi-Rol</div>
      <div class="card-body">
        <ul>
          <li><strong>Seguridad Stateless:</strong> Access Token JWT y Refresh Token con expiración y rotación.</li>
          <li><strong>Guards & Interceptores:</strong> Control de rutas y perfiles en Angular según roles y suscripciones.</li>
          <li><strong>Recuperación de Contraseña:</strong> Flujo seguro vía token para restablecimiento de clave.</li>
          <li><strong>Gestión de Perfil:</strong> Edición de datos personales, avatar y cambio de credenciales de acceso.</li>
          <li><strong>Aislamiento de Cuentas:</strong> Bloqueo inmediato para usuarios en estado inactivo.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">📚 Gestión Académica & LMS (Clases y Materiales)</div>
      <div class="card-body">
        <ul>
          <li><strong>CRUD de Cursos y Módulos:</strong> Estructuración jerárquica de contenidos formativos.</li>
          <li><strong>Asignación Docente:</strong> Vinculación de profesores titulares a programas específicos.</li>
          <li><strong>Videos de Clases:</strong> Vinculación de lecciones organizadas cronológicamente por módulo.</li>
          <li><strong>Materiales Descargables:</strong> Subida multipart y descarga protegida de manuales y diapositivas PDF.</li>
          <li><strong>Planes de Suscripción:</strong> Soporte para niveles <code>BASICO</code>, <code>INTERMEDIO</code> y <code>PREMIUM</code>.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">▶️ Reproductor de Clases Avanzado (Video Player)</div>
      <div class="card-body">
        <ul>
          <li><strong>Persistencia de Progreso:</strong> Guarda y reanuda el segundo exacto visto por el estudiante.</li>
          <li><strong>Marcado de Completitud:</strong> Detección automática al superar el umbral de visualización.</li>
          <li><strong>Navegación Lateral:</strong> Selector dinámico de módulos, videos y recursos adjuntos.</li>
          <li><strong>Control de Reproducción:</strong> Pantalla completa, controles táctiles y subtítulos.</li>
          <li><strong>Aislamiento por Matrícula:</strong> Bloqueo para cursos no inscritos o caducados.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">📝 Tareas, Entregas y Calificaciones</div>
      <div class="card-body">
        <ul>
          <li><strong>Publicación de Tareas:</strong> Creación de evaluaciones por módulo con fecha límite.</li>
          <li><strong>Buzón de Entregas:</strong> Carga de documentos de alumnos (PDF, Word) antes de la fecha límite.</li>
          <li><strong>Panel de Calificación Docente:</strong> Revisión de entregas, asignación de nota (0–20) y retroalimentación personalizada.</li>
          <li><strong>Historial del Alumno:</strong> Seguimiento en vivo de estado de tareas, notas y feedback.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">🎓 Certificación Oficial con Código QR</div>
      <div class="card-body">
        <ul>
          <li><strong>Generación PDF Automatizada:</strong> Diplomas generados con OpenPDF al alcanzar el 100% de avance.</li>
          <li><strong>Código QR Criptográfico:</strong> Enlace directo al endpoint público de validación.</li>
          <li><strong>Plantilla Institucional:</strong> Diseño vectorial con firmas, folios, nota final y horas académicas.</li>
          <li><strong>Bandeja de Diplomas:</strong> Módulo para que el alumno consulte y descargue sus certificados.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">🔔 Notificaciones & Comunicados Segmentados</div>
      <div class="card-body">
        <ul>
          <li><strong>Campanita en Tiempo Real:</strong> Conteo reactivo de avisos no leídos y redirección con 1 clic.</li>
          <li><strong>Triggers Automáticos:</strong> Avisos al publicar nuevos videos, materiales, tareas y notas.</li>
          <li><strong>Comunicados Segmentados:</strong> Difusión dirigida a: <code>TODOS</code>, <code>SOLO_ESTUDIANTES</code>, <code>SOLO_DOCENTES</code> o <code>POR_CURSO</code>.</li>
        </ul>
      </div>
    </div>

    <div class="card card-highlight">
      <div class="card-title">📢 Anuncios Pop-Up & Auditoría del Sistema</div>
      <div class="card-body">
        <ul>
          <li><strong>Modales Promocionales:</strong> Flyers emergentes con botón CTA y control de frecuencia diario.</li>
          <li><strong>Logs de Auditoría:</strong> Registro de inicios de sesión (IP, navegador) y eventos por módulo.</li>
          <li><strong>Exportación CSV:</strong> Reportes de alumnos, matrículas, cursos y certificados.</li>
          <li><strong>Backups & Monitoreo:</strong> Estado del servidor, métricas de carga y respaldos SQL.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 2. FLUJOS DE TRABAJO -->
  <div class="section-title">2. Flujos de Trabajo Principales</div>
  <p class="section-desc">Ciclos operativos de los actores dentro del ecosistema INSTEIP.</p>

  <div class="grid-3">
    <!-- Flujo 1 -->
    <div class="card">
      <div class="card-title" style="color: #047857;">🎓 Flujo del Alumno</div>
      <div style="margin-top: 6px;">
        <div class="flow-step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Matrícula:</strong> Activación de cuenta y asignación de plan (Básico / Intermedio / Premium).</div>
        </div>
        <div class="flow-step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Estudio:</strong> Visualización de videoclases y descarga de manuales en PDF.</div>
        </div>
        <div class="flow-step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Evaluación:</strong> Carga de entregas de tareas antes de la fecha límite.</div>
        </div>
        <div class="flow-step">
          <div class="step-num">4</div>
          <div class="step-text"><strong>Certificación:</strong> Al completar el 100% de clases y tareas, se emite el certificado oficial con QR.</div>
        </div>
      </div>
    </div>

    <!-- Flujo 2 -->
    <div class="card">
      <div class="card-title" style="color: #0284c7;">👨‍🏫 Flujo del Docente</div>
      <div style="margin-top: 6px;">
        <div class="flow-step">
          <div class="step-num" style="background:#0284c7;">1</div>
          <div class="step-text"><strong>Panel Docente:</strong> Acceso a cursos asignados exclusivamente por la institución.</div>
        </div>
        <div class="flow-step">
          <div class="step-num" style="background:#0284c7;">2</div>
          <div class="step-text"><strong>Contenidos:</strong> Publicación de módulos, videos y material complementario.</div>
        </div>
        <div class="flow-step">
          <div class="step-num" style="background:#0284c7;">3</div>
          <div class="step-text"><strong>Asignaciones:</strong> Creación de tareas con pautas e instrucciones.</div>
        </div>
        <div class="flow-step">
          <div class="step-num" style="background:#0284c7;">4</div>
          <div class="step-text"><strong>Calificación:</strong> Revisión de archivos de alumnos, nota sobre 20 y retroalimentación.</div>
        </div>
      </div>
    </div>

    <!-- Flujo 3 -->
    <div class="card">
      <div class="card-title" style="color: #7c3aed;">⚙️ Flujo Administrativo</div>
      <div style="margin-top: 6px;">
        <div class="flow-step">
          <div class="step-num" style="background:#7c3aed;">1</div>
          <div class="step-text"><strong>Gestión de Usuarios:</strong> Alta de alumnos, docentes y asignación de cursos.</div>
        </div>
        <div class="flow-step">
          <div class="step-num" style="background:#7c3aed;">2</div>
          <div class="step-text"><strong>Aprobación de Pagos:</strong> Validación de vouchers (Yape/Plin/Transferencias) y membresías.</div>
        </div>
        <div class="flow-step">
          <div class="step-num" style="background:#7c3aed;">3</div>
          <div class="step-text"><strong>Comunicación:</strong> Emisión de comunicados segmentados y campañas Pop-up.</div>
        </div>
        <div class="flow-step">
          <div class="step-num" style="background:#7c3aed;">4</div>
          <div class="step-text"><strong>Supervisión:</strong> Auditoría de accesos, reportes CSV y monitoreo de servidor.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. MATRIZ DE ROLES Y PERMISOS -->
  <div class="section-title">3. Roles del Sistema y Matriz de Acceso</div>
  <table>
    <thead>
      <tr>
        <th style="width: 40%;">Módulo o Funcionalidad</th>
        <th style="width: 15%; text-align: center;">Público</th>
        <th style="width: 15%; text-align: center;">ALUMNO</th>
        <th style="width: 15%; text-align: center;">DOCENTE</th>
        <th style="width: 15%; text-align: center;">ADMINISTRADOR</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ver landing, catálogo de cursos y temarios</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Consultar Chatbot IA institucional</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Validar Certificados oficiales mediante QR</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Acceso a Dashboard propio y edición de Perfil</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Ver cursos matriculados y reproductor de clases</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Descargar manuales y materiales de estudio</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔ (Según Plan)</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Subir entregas de tareas por módulo</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
      </tr>
      <tr>
        <td>Calificar tareas con escala 0-20 y feedback</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔ (Cursos Asignados)</td>
        <td style="text-align: center;" class="badge-check">✔ (Todos)</td>
      </tr>
      <tr>
        <td>Gestionar módulos, videos y materiales</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔ (Cursos Asignados)</td>
        <td style="text-align: center;" class="badge-check">✔ (Todos)</td>
      </tr>
      <tr>
        <td>Publicar Comunicados y Anuncios Pop-Up</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Aprobación de pagos y asignación de suscripción</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>CRUD de Alumnos, Docentes y Auditoría</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
      <tr>
        <td>Exportación de reportes en formato CSV</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-no">✘</td>
        <td style="text-align: center;" class="badge-check">✔</td>
      </tr>
    </tbody>
  </table>

  <!-- 4. RESTRICCIONES Y REGLAS DE NEGOCIO -->
  <div class="section-title">4. Restricciones y Reglas de Negocio Clave</div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">🛡️ Reglas de Seguridad y Acceso</div>
      <div class="card-body">
        <ul>
          <li><strong>Usuarios Inactivos:</strong> Bloqueo total de autenticación. Token revocado inmediatamente.</li>
          <li><strong>Expiración de Matrícula:</strong> Las matrículas vencidas bloquean automáticamente el reproductor de clases y descargas.</li>
          <li><strong>Aislamiento Docente:</strong> Los docentes no pueden ver ni modificar cursos donde no estén expresamente asignados.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🎖️ Reglas Académicas y Certificados</div>
      <div class="card-body">
        <ul>
          <li><strong>Generación de Certificado:</strong> Requiere estrictamente 100% de avance en las clases del curso.</li>
          <li><strong>Código QR Inmutable:</strong> La firma criptográfica previene la falsificación física o digital.</li>
          <li><strong>Evaluaciones:</strong> Las tareas enviadas fuera de la fecha límite son rechazadas por el sistema.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 5. PORCENTAJE GLOBAL Y ROADMAP -->
  <div class="section-title">5. Desglose del Progreso Global (~94%)</div>
  <p class="section-desc">Estado de avance por componentes técnicos y arquitectura de software.</p>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">⚡ Backend API (Spring Boot 3.4 / Java 21) — <span style="color:#047857;">98%</span></div>
      <div class="card-body">
        <ul>
          <li>22 Controladores REST implementados y securizados.</li>
          <li>21 Entidades JPA con relaciones optimizadas y Lazy Loading.</li>
          <li>Suite de 53 pruebas unitarias y de integración en verde.</li>
          <li>Generación de PDFs vectoriales con OpenPDF.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🎨 Frontend Web (Angular 18 Standalone) — <span style="color:#047857;">94%</span></div>
      <div class="card-body">
        <ul>
          <li>18 Vistas públicas responsive y SEO optimizadas.</li>
          <li>Dashboards personalizados para Admin, Docente y Alumno.</li>
          <li>Reproductor de video con guardado continuo de segundo visto.</li>
          <li>Campanita de notificaciones reactiva y pop-ups promocionales.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🗄️ Base de Datos (PostgreSQL 15) — <span style="color:#047857;">98%</span></div>
      <div class="card-body">
        <ul>
          <li>5 Migraciones SQL secuenciales versionadas.</li>
          <li>Índices de alto rendimiento para búsqueda y filtrado.</li>
          <li>Esquema íntegro con claves foráneas y auditoría de eventos.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🧪 Calidad & Testing (QA) — <span style="color:#047857;">92%</span></div>
      <div class="card-body">
        <ul>
          <li>Pruebas End-to-End con Selenium y Playwright.</li>
          <li>Smoke tests y validación de flujos de todos los roles.</li>
          <li>Limpieza automática de datos de prueba en suites QA.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 6. QUÉ FALTA CONSTRUIR (ROADMAP) -->
  <div class="section-title">6. ¿Qué Falta Construir? (Roadmap de Expansión)</div>
  <p class="section-desc">Módulos complementarios y mejoras futuras para escalar el ecosistema institucional.</p>

  <div class="grid-2">
    <div class="card" style="border-left: 3px solid #f59e0b;">
      <div class="card-title" style="color: #b45309;">💳 1. Pasarela de Pagos 100% Automatizada</div>
      <div class="card-body">
        <p><strong>Actual:</strong> Registro y validación manual de comprobantes (Yape/Plin/Transferencia).</p>
        <p><strong>Roadmap:</strong> Integración vía Webhook con <em>Mercado Pago</em>, <em>Culqi</em> o <em>Niubiz</em> para activación instantánea tras pago con tarjeta de crédito/débito.</p>
      </div>
    </div>

    <div class="card" style="border-left: 3px solid #f59e0b;">
      <div class="card-title" style="color: #b45309;">❓ 2. Cuestionarios y Quizzes Interactivos</div>
      <div class="card-body">
        <p><strong>Actual:</strong> Sistema de tareas y asignaciones evaluadas manualmente por el docente.</p>
        <p><strong>Roadmap:</strong> Exámenes en línea con preguntas de opción múltiple, banco de reactivos aleatorio, tiempo límite y autocorrección inmediata.</p>
      </div>
    </div>

    <div class="card" style="border-left: 3px solid #3b82f6;">
      <div class="card-title" style="color: #1d4ed8;">📧 3. Servidor de Correo Transaccional (SMTP)</div>
      <div class="card-body">
        <p><strong>Actual:</strong> Notificaciones internas en plataforma y token API de recuperación.</p>
        <p><strong>Roadmap:</strong> Envío automatizado de emails transaccionales (bienvenida, entrega de certificados en PDF, recordatorios de vencimiento de tareas) mediante SendGrid o AWS SES.</p>
      </div>
    </div>

    <div class="card" style="border-left: 3px solid #3b82f6;">
      <div class="card-title" style="color: #1d4ed8;">📱 4. Aplicación Móvil Nativa (Android / iOS)</div>
      <div class="card-body">
        <p><strong>Actual:</strong> Web app 100% responsive en Angular adaptable a smartphones y tablets.</p>
        <p><strong>Roadmap:</strong> Empaquetado PWA con caché offline o App nativa en Flutter para publicación en Google Play Store y App Store.</p>
      </div>
    </div>
  </div>

  <div class="footer-note">
    <strong>INSTEIP — Instituto Superior de Terapias Integrales</strong> · Documento Técnico Oficial emitido por el equipo de Desarrollo de Software.
  </div>

</body>
</html>`;

  console.log('Lanzando navegador Chromium para renderizar PDF...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  const outputPath1 = path.resolve(__dirname, '../../docs/Informe_Completo_Sistema_INSTEIP.pdf');
  const outputPath2 = path.resolve(__dirname, '../../Informe_Completo_Sistema_INSTEIP.pdf');

  console.log('Generando archivo PDF...');
  await page.pdf({
    path: outputPath1,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    }
  });

  fs.copyFileSync(outputPath1, outputPath2);

  await browser.close();
  console.log(`PDF generado exitosamente en: \n- ${outputPath1}\n- ${outputPath2}`);
}

generatePDF().catch(err => {
  console.error('Error generando PDF:', err);
  process.exit(1);
});
