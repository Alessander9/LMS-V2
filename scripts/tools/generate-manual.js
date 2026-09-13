const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('================================================================');
  console.log('         INSTEIP - GENERADOR AUTOMÁTICO DE MANUAL VISUAL        ');
  console.log('================================================================');

  const assetsDir = path.join(__dirname, 'manual-assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Helper to capture a screenshot with styling and logs
  async function takeScreenshot(name, delay = 1500) {
    console.log(`   - Capturando pantalla: ${name}...`);
    await page.waitForTimeout(delay);
    const screenshotPath = path.join(assetsDir, `${name}.png`);
    await page.screenshot({ path: screenshotPath });
    return screenshotPath;
  }

  try {
    // ------------------------------------------------------------------
    // 1. CAPTURE LOGIN PAGE
    // ------------------------------------------------------------------
    console.log('\n[Paso 1] Capturando Login...');
    await page.goto('http://localhost:4200/login');
    await page.waitForSelector('input[type="email"]');
    await takeScreenshot('01_login');

    // ------------------------------------------------------------------
    // 2. ADMIN FLOW
    // ------------------------------------------------------------------
    console.log('\n[Paso 2] Iniciando sesión de Administrador y capturando paneles...');
    await page.fill('input[type="email"]', 'admin@insteip.com');
    await page.fill('input[type="password"]', process.env.QA_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h1:has-text("Campus Virtual INSTEIP")');
    await takeScreenshot('02_admin_dashboard');

    // Cursos Management
    await page.click('a[routerLink="/dashboard/cursos"]');
    await page.waitForURL('**/dashboard/cursos');
    await page.waitForSelector('h1:has-text("Gestión de Cursos")');
    await takeScreenshot('03_admin_cursos');

    // Curso Detalle (First course)
    await page.locator('button[title="Administrar Temario y Alumnos"]').first().click();
    await page.waitForURL('**/dashboard/cursos/**');
    await page.waitForSelector('button:has-text("Agregar Módulo")');
    // Expand first module accordion if exists
    try {
      await page.locator('.border-slate-900 h3').first().click();
      await page.waitForTimeout(500);
    } catch(e) {}
    await takeScreenshot('04_admin_curso_detalle');

    // Alumnos Management
    await page.click('a[routerLink="/dashboard/alumnos"]');
    await page.waitForURL('**/dashboard/alumnos');
    await page.waitForSelector('h1:has-text("Gestión de Alumnos")');
    await takeScreenshot('05_admin_alumnos');

    // Reporte de Certificados
    await page.click('a[routerLink="/dashboard/certificados"]');
    await page.waitForURL('**/dashboard/certificados');
    await page.waitForSelector('h1:has-text("Reporte de Certificados")');
    await takeScreenshot('06_admin_certificados');

    // Configuración
    await page.click('a[routerLink="/dashboard/configuracion"]');
    await page.waitForURL('**/dashboard/configuracion');
    await page.waitForSelector('h1:has-text("Configuración Institucional")');
    await takeScreenshot('07_admin_configuracion');

    // Auditoría
    await page.click('a[routerLink="/dashboard/auditoria"]');
    await page.waitForURL('**/dashboard/auditoria');
    await page.waitForSelector('h1:has-text("Auditoría de Seguridad")');
    await takeScreenshot('08_admin_auditoria');

    // Sistema
    await page.click('a[routerLink="/dashboard/sistema"]');
    await page.waitForURL('**/dashboard/sistema');
    await page.waitForSelector('h1:has-text("Monitoreo del Sistema")');
    await takeScreenshot('09_admin_sistema');

    // Logout Admin
    await page.click('button:has-text("Cerrar Sesión")');
    await page.waitForURL('**/login');

    // ------------------------------------------------------------------
    // 3. STUDENT FLOW
    // ------------------------------------------------------------------
    console.log('\n[Paso 3] Iniciando sesión de Estudiante (Juan Pérez)...');
    await page.fill('input[type="email"]', 'juan.perez@insteip.com');
    await page.fill('input[type="password"]', process.env.QA_ALUMNO_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h1:has-text("¡Hola de nuevo, Juan!")');
    await takeScreenshot('10_student_dashboard');

    // Mis Cursos
    await page.click('a[routerLink="/dashboard/mis-cursos"]');
    await page.waitForURL('**/dashboard/mis-cursos');
    await page.waitForSelector('h1:has-text("Mis Cursos")');
    await takeScreenshot('11_student_mis_cursos');

    // Course Player (Excel Avanzado or first dynamic course)
    await page.locator('div.border button').first().click();
    await page.waitForURL('**/dashboard/cursos-play/**');
    await page.waitForSelector('button:has-text("Información del Curso")');
    // Open accordion
    try {
      await page.locator('span:has-text("Módulo 1")').first().click();
      await page.waitForTimeout(500);
      await page.locator('span:has-text("Clase")').first().click();
      await page.waitForTimeout(1000);
    } catch(e) {}
    await takeScreenshot('12_student_reproductor');

    // Certificados Estudiante
    await page.click('a[routerLink="/dashboard/certificados"]');
    await page.waitForURL('**/dashboard/certificados');
    await page.waitForSelector('h1:has-text("Mis Certificados")');
    await takeScreenshot('13_student_certificados');

    // Perfil Estudiante
    await page.click('a[routerLink="/dashboard/perfil"]');
    await page.waitForURL('**/dashboard/perfil');
    await page.waitForSelector('h2:has-text("Tus Logros Académicos")');
    await takeScreenshot('14_student_perfil');

    // Public Validation Page
    let certCode = 'INS-2026-E8DFF9D5'; // Fallback code
    try {
      await page.click('a[routerLink="/dashboard/certificados"]');
      await page.waitForURL('**/dashboard/certificados');
      const firstCode = await page.locator('td.font-mono').first().textContent();
      if (firstCode) {
        certCode = firstCode.trim();
      }
    } catch(e) {}

    console.log(`\n[Paso 4] Capturando portal público de verificación con código: ${certCode}`);
    await page.goto(`http://localhost:4200/certificados/validar/${certCode}`);
    await page.waitForSelector('span:has-text("CERTIFICADO VÁLIDO")');
    await takeScreenshot('15_validacion_publica');

    // Logout
    await page.goto('http://localhost:4200/login');

    // ------------------------------------------------------------------
    // 4. WRITE THE HTML USER MANUAL WITH EMBEDDED IMAGES (AS BASE64)
    // ------------------------------------------------------------------
    console.log('\n[Paso 5] Compilando manual detallado y visual en HTML...');
    
    // Helper to read image as Base64 for zero-dependency local PDF generation
    function getBase64Image(filename) {
      const imgPath = path.join(assetsDir, `${filename}.png`);
      if (fs.existsSync(imgPath)) {
        const fileBuffer = fs.readFileSync(imgPath);
        return `data:image/png;base64,${fileBuffer.toString('base64')}`;
      }
      return '';
    }

    const imgLogin = getBase64Image('01_login');
    const imgAdminDash = getBase64Image('02_admin_dashboard');
    const imgAdminCursos = getBase64Image('03_admin_cursos');
    const imgAdminCursoDet = getBase64Image('04_admin_curso_detalle');
    const imgAdminAlumnos = getBase64Image('05_admin_alumnos');
    const imgAdminCert = getBase64Image('06_admin_certificados');
    const imgAdminConf = getBase64Image('07_admin_configuracion');
    const imgAdminAud = getBase64Image('08_admin_auditoria');
    const imgAdminSis = getBase64Image('09_admin_sistema');
    const imgStudDash = getBase64Image('10_student_dashboard');
    const imgStudCursos = getBase64Image('11_student_mis_cursos');
    const imgStudPlay = getBase64Image('12_student_reproductor');
    const imgStudCert = getBase64Image('13_student_certificados');
    const imgStudPerf = getBase64Image('14_student_perfil');
    const imgPubVal = getBase64Image('15_validacion_publica');

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Manual de Usuario Visual INSTEIP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@800;900&family=Fira+Code:wght@500&display=swap');

    body {
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.4;
      margin: 0;
      padding: 0;
    }

    h1, h2, h3, h4 {
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
      margin-top: 0;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    p {
      margin-top: 0;
      margin-bottom: 0.6rem;
      font-size: 11.5px;
      color: #334155;
      text-align: justify;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 955;
      font-size: 8.5px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border: 1px solid #0f172a;
      margin-bottom: 6px;
    }

    /* Print & Layout page wrappers */
    .page {
      padding: 25px 40px;
      box-sizing: border-box;
      page-break-after: always;
      position: relative;
      height: 297mm; /* A4 height */
      max-height: 297mm;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Brutalist Style Elements */
    .card {
      border: 2px solid #0f172a;
      padding: 10px 15px;
      background-color: #ffffff;
      box-shadow: 4px 4px 0px 0px rgba(15,23,42,1);
      margin-bottom: 12px;
    }

    .card-title {
      font-size: 13px;
      font-weight: 900;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }

    /* Image Box Brutalist with Visual Sumilla built in */
    .screenshot-container {
      border: 2px solid #0f172a;
      margin-top: 8px;
      margin-bottom: 8px;
      background-color: #f8fafc;
      overflow: hidden;
      box-shadow: 3px 3px 0px 0px rgba(15,23,42,1);
    }

    .screenshot-container img {
      width: 100%;
      height: auto;
      max-height: 105mm; /* Dynamic height limit to secure fit */
      object-fit: contain;
      display: block;
    }

    .screenshot-sumilla {
      background-color: #f1f5f9;
      border-t: 2px solid #0f172a;
      padding: 8px 12px;
      font-size: 10px;
      line-height: 1.4;
      color: #1e293b;
    }

    .screenshot-sumilla strong {
      text-transform: uppercase;
      font-weight: 900;
      color: #0f172a;
    }

    /* Title Page Style */
    .cover-page {
      height: 297mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 8px solid #0f172a;
      padding: 45px;
      box-sizing: border-box;
      background-color: #fafafa;
      page-break-after: always;
    }

    .cover-header {
      border-bottom: 4px solid #0f172a;
      padding-bottom: 15px;
    }

    .cover-logo {
      width: 45px;
      height: 45px;
      background-color: #0f172a;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .cover-title {
      font-size: 38px;
      line-height: 1.1;
      font-weight: 900;
      margin: 0;
      letter-spacing: -1px;
    }

    .cover-subtitle {
      font-size: 15px;
      font-weight: 700;
      color: #64748b;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .meta-item {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 1px;
      color: #64748b;
    }

    .meta-value {
      font-size: 12.5px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 3px;
    }

    /* Table styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 8px;
      font-size: 9.5px;
    }

    th, td {
      border: 1.5px solid #0f172a;
      padding: 4px 6px;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      font-weight: 900;
      text-transform: uppercase;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Infografías / Flowcharts inside pages */
    .infografia-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 15px 0;
      text-align: center;
    }

    .infografia-step {
      border: 2px solid #0f172a;
      background: #fafafa;
      padding: 8px;
      box-shadow: 2px 2px 0px 0px rgba(15,23,42,1);
      position: relative;
    }

    .infografia-step.active {
      background: #e0f2fe;
    }

    .infografia-step.highlight {
      background: #fef3c7;
    }

    .infografia-step-num {
      background: #0f172a;
      color: #ffffff;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: bold;
      margin: 0 auto 5px auto;
    }

    .infografia-step-title {
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .infografia-step-desc {
      font-size: 8px;
      color: #475569;
      line-height: 1.2;
    }

    .infografia-arrow {
      align-self: center;
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
    }

    /* Bullet and lists */
    ul {
      margin: 0 0 8px 0;
      padding-left: 15px;
      font-size: 10px;
    }

    li {
      margin-bottom: 3px;
      color: #334155;
    }

    li strong {
      color: #0f172a;
    }

    /* Alerts */
    .alert-box {
      border-left: 3px solid #10b981;
      background-color: #f0fdf4;
      color: #065f46;
      padding: 6px 10px;
      font-size: 9.5px;
      margin-bottom: 8px;
    }

    .page-number {
      position: absolute;
      bottom: 12px;
      right: 40px;
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      font-weight: 900;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      .page {
        height: 297mm;
        max-height: 297mm;
        page-break-after: always;
        overflow: hidden;
      }
      .cover-page {
        height: 297mm;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>

  <!-- ================= PORTADA ================= -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-logo">I</div>
      <h1 class="cover-title">Manual de Usuario Visual<br>y Operación del Campus</h1>
      <div class="cover-subtitle">Plataforma Educativa INSTEIP</div>
    </div>
    
    <div class="card" style="margin-bottom: 0;">
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        ✓ Guía de interfaces, mapeo de botones, infografías de arquitectura y sumillas de funcionalidad.
      </p>
    </div>

    <div class="cover-footer">
      <div>
        <div class="meta-item">Documentación de Sistema</div>
        <div class="meta-value">Manual del Campus Virtual</div>
      </div>
      <div style="text-align: right;">
        <div class="meta-item">Edición Visual</div>
        <div class="meta-value">Junio 2026 - v1.2</div>
      </div>
    </div>
  </div>

  <!-- ================= CAPITULO 1 ================= -->
  <div class="page">
    <div class="badge">Capítulo 1</div>
    <h2>1. Introducción y Acceso</h2>
    <p>
      La plataforma virtual de **INSTEIP** ofrece control total del ciclo académico. El acceso se realiza mediante correo y contraseña validados contra el backend de Spring Boot (JWT).
    </p>

    <div class="screenshot-container">
      <img src="${imgLogin}" alt="Acceso al Campus">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Login):</strong> 
        [1] Campo de texto para email de acceso institucional. 
        [2] Campo de entrada secreto para contraseña. 
        [3] Botón con efecto Brutalista que ejecuta la autenticación POST.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mapeo del Formulario de Ingreso</div>
      <table>
        <thead>
          <tr>
            <th>Elemento Interactivo</th>
            <th>Tipo</th>
            <th>Funcionalidad y Efecto en el Sistema</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>[1] Campo Email</strong></td>
            <td>Input Text</td>
            <td>Ingreso del usuario. Requiere formato válido. Filtra accesos incorrectos.</td>
          </tr>
          <tr>
            <td><strong>[2] Campo Password</strong></td>
            <td>Input Password</td>
            <td>Ingreso de contraseña. Valida longitud y caracteres especiales.</td>
          </tr>
          <tr>
            <td><strong>[3] Botón Ingresar</strong></td>
            <td>Submit Button</td>
            <td>Envía datos a <code>POST /api/auth/login</code>. Genera Token JWT en local storage.</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="page-number">Pág. 2</div>
  </div>

  <!-- ================= INFOGRAFÍA 1 ================= -->
  <div class="page">
    <div class="badge">Infografía I</div>
    <h2>Flujo de Autenticación y Autorización (JWT)</h2>
    <p>
      El sistema de seguridad implementado asegura que cada petición esté firmada por un token válido, discriminando los permisos según el rol asignado al usuario.
    </p>

    <div class="infografia-container" style="grid-template-columns: 1fr 20px 1fr 20px 1fr 20px 1fr; margin-top: 40px; margin-bottom: 40px;">
      <div class="infografia-step active">
        <div class="infografia-step-num">1</div>
        <div class="infografia-step-title">Usuario Clic</div>
        <div class="infografia-step-desc">El usuario ingresa credenciales en login y da clic en "Ingresar".</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step">
        <div class="infografia-step-num">2</div>
        <div class="infografia-step-title">Spring Boot Security</div>
        <div class="infografia-step-desc">El backend procesa y valida los hashes de base de datos.</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step highlight">
        <div class="infografia-step-num">3</div>
        <div class="infografia-step-title">Token Emitido</div>
        <div class="infografia-step-desc">Se devuelve un JWT Token que el navegador almacena en memoria.</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step">
        <div class="infografia-step-num">4</div>
        <div class="infografia-step-title">Navegación</div>
        <div class="infografia-step-desc">Angular protege las vistas internas mediante Guards de acceso.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Roles del Sistema y Acceso de Endpoints</div>
      <ul>
        <li><strong>Rol Administrador (ROLE_ADMIN):</strong> Accede a endpoints <code>/api/usuarios</code>, <code>/api/cursos</code>, <code>/api/configuracion</code>, <code>/api/auditoria</code> y <code>/api/sistema</code>.</li>
        <li><strong>Rol Alumno (ROLE_STUDENT):</strong> Limitado a <code>/api/alumno/**</code>, lectura de cursos asignados, descarga de sus propios materiales y diplomas.</li>
      </ul>
    </div>
    
    <div class="page-number">Pág. 3</div>
  </div>

  <!-- ================= CAPITULO 2 ================= -->
  <div class="page">
    <div class="badge">Capítulo 2</div>
    <h2>2. Portal del Administrador - Dashboard</h2>
    <p>
      Al acceder como administrador, se despliega el Panel de Control general que resume los indicadores principales del campus virtual en tiempo real.
    </p>

    <div class="screenshot-container">
      <img src="${imgAdminDash}" alt="Dashboard Admin">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Dashboard):</strong> 
        [1] Tarjetas de Métricas de Base de Datos.
        [2] Botones de Navegación Rápida Brutalistas.
        [3] Menú lateral de navegación persistente (Sidenav).
      </div>
    </div>

    <div class="card">
      <div class="card-title">Acciones y Accesos Rápidos del Panel</div>
      <table>
        <thead>
          <tr>
            <th>Elemento en Pantalla</th>
            <th>Acción al Pulsar</th>
            <th>Destino / Endpoint Técnico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>[1] Tarjetas de Totales</strong></td>
            <td>Clic en métricas visuales.</td>
            <td>Redirige a listados correspondientes (Cursos / Alumnos).</td>
          </tr>
          <tr>
            <td><strong>[2] Acceso Cursos</strong></td>
            <td>Ingreso rápido al catálogo.</td>
            <td>/dashboard/cursos (Consume GET /api/cursos)</td>
          </tr>
          <tr>
            <td><strong>[2] Acceso Matricular</strong></td>
            <td>Ingreso rápido a alumnos.</td>
            <td>/dashboard/alumnos (Consume GET /api/usuarios)</td>
          </tr>
          <tr>
            <td><strong>[2] Acceso Seguridad/Monitoreo</strong></td>
            <td>Ingreso a logs y recursos.</td>
            <td>Rutas /dashboard/auditoria y /dashboard/sistema</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 4</div>
  </div>

  <!-- ================= CAPITULO 3 ================= -->
  <div class="page">
    <div class="badge">Capítulo 2 (Cont.)</div>
    <h2>3. Gestión de Alumnos - Tabla y Filtros</h2>
    <p>
      Este módulo centraliza el registro, visualización y control de estudiantes y sus planes de suscripción activos.
    </p>

    <div class="screenshot-container">
      <img src="${imgAdminAlumnos}" alt="Alumnos Admin">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Gestión Alumnos):</strong> 
        [1] Barra de búsqueda reactiva por correo/nombres. 
        [2] Botones de exportación CSV y registro manual de alumnos. 
        [3] Tabla interactiva con botones de acción directa en fila (Ver Detalle, Editar, Alternar Estado).
      </div>
    </div>

    <div class="card">
      <div class="card-title">Botones Operativos Generales</div>
      <table>
        <thead>
          <tr>
            <th>Botón en Interfaz</th>
            <th>Acción Técnica</th>
            <th>Efecto de Base de Datos / Backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Crear Alumno</strong></td>
            <td>Abre modal de registro manual.</td>
            <td>Petición <code>POST /api/usuarios</code> al guardar.</td>
          </tr>
          <tr>
            <td><strong>Exportar CSV</strong></td>
            <td>Descarga directa del listado.</td>
            <td>GET a <code>/api/reportes/alumnos</code> formateado en CSV.</td>
          </tr>
          <tr>
            <td><strong>Buscar por correo...</strong></td>
            <td>Entrada de búsqueda dinámica.</td>
            <td>Filtra la grilla local basándose en el campo correo/nombre.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 5</div>
  </div>

  <!-- ================= CAPITULO 4 ================= -->
  <div class="page">
    <div class="badge">Capítulo 2 (Cont.)</div>
    <h2>4. Gestión de Alumnos - Acciones de Fila y Modales</h2>
    <p>
      Para cada estudiante, el administrador dispone de un menú de acciones en la columna derecha para un control detallado.
    </p>

    <div class="card">
      <div class="card-title">Detalle de Acciones Unitarias de la Tabla</div>
      <table>
        <thead>
          <tr>
            <th>Botón / Icono</th>
            <th>Nombre Acción</th>
            <th>Procedimiento y Transacción Backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Ojo (Ver Detalle)</strong></td>
            <td>Ver Detalle</td>
            <td>Llama a <code>GET /api/usuarios/{id}</code>. Abre modal que detalla la ficha académica e historial.</td>
          </tr>
          <tr>
            <td><strong>Lápiz (Editar Alumno)</strong></td>
            <td>Editar Alumno</td>
            <td>Abre modal con formulario cargado. Envía <code>PUT /api/usuarios/{id}</code> para actualizar datos.</td>
          </tr>
          <tr>
            <td><strong>Block / Check (Alternador)</strong></td>
            <td>Desactivar / Activar</td>
            <td>Llama a <code>PATCH /api/usuarios/{id}/estado</code>. Aplica borrado lógico o reactivación inmediata.</td>
          </tr>
          <tr>
            <td><strong>Cerrar Ficha / Cancelar</strong></td>
            <td>Cierre Modal</td>
            <td>Descarta los cambios en interfaz y cierra la superposición (modal).</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Niveles de Suscripción en Modal</div>
      <p>
        Al registrar o editar un alumno, se asocia un ID de Nivel de Suscripción:
        <br>• <strong>ID 1 - Básico:</strong> Acceso limitado a cursos de plan Básico.
        <br>• <strong>ID 2 - Intermedio:</strong> Acceso a planes Básico e Intermedio.
        <br>• <strong>ID 3 - Premium:</strong> Acceso a todos los cursos sin restricción.
      </p>
    </div>

    <div class="page-number">Pág. 6</div>
  </div>

  <!-- ================= INFOGRAFÍA 2 ================= -->
  <div class="page">
    <div class="badge">Infografía II</div>
    <h2>Ciclo de Suscripciones y Matrícula del Alumno</h2>
    <p>
      El acceso a los programas educativos se rige por un doble filtro de seguridad: el nivel de suscripción activa y la matrícula específica al curso.
    </p>

    <div class="infografia-container" style="grid-template-columns: 1fr 20px 1fr 20px 1fr; margin-top: 50px; margin-bottom: 50px;">
      <div class="infografia-step active">
        <div class="infografia-step-num">A</div>
        <div class="infografia-step-title">Nivel del Alumno</div>
        <div class="infografia-step-desc">El admin asigna el plan (ej: Premium). Esto define el alcance máximo de contenidos.</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step highlight">
        <div class="infografia-step-num">B</div>
        <div class="infografia-step-title">Matrícula Específica</div>
        <div class="infografia-step-desc">Se asocia el alumno a un curso en la pestaña "Alumnos Matriculados" del curso.</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step">
        <div class="infografia-step-num">C</div>
        <div class="infografia-step-title">Acceso Validado</div>
        <div class="infografia-step-desc">El estudiante puede reproducir el contenido en su panel desde "Mis Cursos".</div>
      </div>
    </div>

    <div class="alert-box">
      <strong>Regla de Negocio:</strong> Un estudiante con plan Básico matriculado en un curso de nivel Premium no podrá reproducir el contenido en el campus, el backend arrojará un error 403 (Acceso Denegado).
    </div>

    <div class="page-number">Pág. 7</div>
  </div>

  <!-- ================= CAPITULO 5 ================= -->
  <div class="page">
    <div class="badge">Capítulo 2 (Cont.)</div>
    <h2>5. Gestión de Cursos - Panel General</h2>
    <p>
      La vista de Cursos permite dar de alta nuevos programas de estudio y definir a qué niveles de membresía pertenecen.
    </p>

    <div class="screenshot-container">
      <img src="${imgAdminCursos}" alt="Cursos Admin">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Cursos):</strong> 
        [1] Buscador dinámico de asignaturas. 
        [2] Botones para exportar listado CSV e iniciar creación. 
        [3] Tabla de asignaturas con estado, planes requeridos y botón de acceso a temario.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Interacciones Clave de Gestión de Cursos</div>
      <table>
        <thead>
          <tr>
            <th>Botón en Interfaz</th>
            <th>Acción Operativa</th>
            <th>Transacción Backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Crear Curso</strong></td>
            <td>Abre modal de creación.</td>
            <td><code>POST /api/cursos</code> (Envía nombre, descripción, niveles).</td>
          </tr>
          <tr>
            <td><strong>Exportar CSV</strong></td>
            <td>Descarga listado en CSV.</td>
            <td>Llama a GET <code>/api/reportes/cursos</code>.</td>
          </tr>
          <tr>
            <td><strong>Administrar Temario (Lista)</strong></td>
            <td>Redirige a la ficha técnica.</td>
            <td>Abre ruta <code>/dashboard/cursos/{id}</code> en Angular.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 8</div>
  </div>

  <!-- ================= CAPITULO 6 ================= -->
  <div class="page">
    <div class="badge">Capítulo 2 (Cont.)</div>
    <h2>6. Ficha Técnica de Curso - Módulos</h2>
    <p>
      Al acceder al detalle de un curso, se despliega el diseñador académico para gestionar el temario y los alumnos matriculados.
    </p>

    <div class="screenshot-container">
      <img src="${imgAdminCursoDet}" alt="Detalle Temario Admin">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Detalle Curso):</strong> 
        [1] Botones de edición de curso y creación de módulos. 
        [2] Pestañas selectoras: Módulos del Curso vs Alumnos Matriculados. 
        [3] Acordeón modular con cargadores de videos e inline forms.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Acciones del Encabezado de la Ficha</div>
      <table>
        <thead>
          <tr>
            <th>Botón / Tab</th>
            <th>Efecto de Clic</th>
            <th>Procedimiento backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Editar Curso</strong></td>
            <td>Modal para cambiar datos.</td>
            <td>PUT a <code>/api/cursos/{id}</code>.</td>
          </tr>
          <tr>
            <td><strong>Agregar Módulo</strong></td>
            <td>Modal de alta de módulo.</td>
            <td>POST a <code>/api/modulos</code> (nombre, descripción, orden).</td>
          </tr>
          <tr>
            <td><strong>Tab Alumnos Matriculados</strong></td>
            <td>Muestra alumnos inscritos.</td>
            <td>GET a <code>/api/matriculas/curso/{id}</code>.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 9</div>
  </div>

  <!-- ================= CAPITULO 7 ================= -->
  <div class="page">
    <div class="badge">Capítulo 2 (Cont.)</div>
    <h2>7. Inline Forms: Videos y Archivos PDFs</h2>
    <p>
      Al abrir el acordeón de un módulo específico, se habilitan los formularios incrustados para cargar contenido de clases de forma rápida.
    </p>

    <div class="card">
      <div class="card-title">Formulario Agregar Video (Inline)</div>
      <ul>
        <li><strong>Título del Video:</strong> Campo de texto obligatorio.</li>
        <li><strong>URL de YouTube:</strong> Dirección del recurso para el reproductor (ej: https://www.youtube.com/watch?v=...).</li>
        <li><strong>Guardar Video:</strong> Dispara <code>POST /api/videos</code> asociando el video al ID del módulo.</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title">Formulario Subir Archivo (Inline)</div>
      <ul>
        <li><strong>Nombre del Recurso:</strong> Texto descriptivo (ej: Guía de Ejercicios).</li>
        <li><strong>Arrastrar o Clic:</strong> Abre el explorador de archivos para seleccionar PDFs o DOCX.</li>
        <li><strong>Subir Archivo (Confirmar):</strong> Ejecuta una petición <code>POST /api/materiales</code> de tipo Multipart Form-Data que almacena el archivo físico en el servidor.</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title">Botones de Configuración de Módulo (Pie de Módulo)</div>
      <ul>
        <li><strong>Editar Módulo:</strong> Abre modal para renombrar la sección.</li>
        <li><strong>Desactivar / Activar:</strong> PATCH a <code>/api/modulos/{id}/estado</code> para ocultar la unidad del alumno.</li>
      </ul>
    </div>

    <div class="page-number">Pág. 10</div>
  </div>

  <!-- ================= INFOGRAFÍA 3 ================= -->
  <div class="page">
    <div class="badge">Infografía III</div>
    <h2>Flujo de Creación de Contenido Académico</h2>
    <p>
      La jerarquía y orden en el almacenamiento de recursos del backend de INSTEIP se organiza según el siguiente pipeline secuencial:
    </p>

    <div class="infografia-container" style="grid-template-columns: repeat(4, 1fr); margin-top: 40px; margin-bottom: 40px;">
      <div class="infografia-step active">
        <div class="infografia-step-num">1</div>
        <div class="infografia-step-title">Curso Creado</div>
        <div class="infografia-step-desc">Se crea el contenedor general (Catálogo).</div>
      </div>
      <div class="infografia-step highlight">
        <div class="infografia-step-num">2</div>
        <div class="infografia-step-title">Creación de Módulos</div>
        <div class="infografia-step-desc">Se asocian unidades numeradas con orden secuencial.</div>
      </div>
      <div class="infografia-step">
        <div class="infografia-step-num">3</div>
        <div class="infografia-step-title">Vídeos de Clase</div>
        <div class="infografia-step-desc">Se vinculan URLs de clases embebidas dentro de cada módulo.</div>
      </div>
      <div class="infografia-step active">
        <div class="infografia-step-num">4</div>
        <div class="infografia-step-title">Material de Apoyo</div>
        <div class="infografia-step-desc">Se cargan las guías PDFs vinculadas directamente.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Efecto en la Base de Datos Relacional</div>
      <p>
        El curso mantiene una relación de uno-a-muchos (1:N) con los Módulos. A su vez, cada módulo se relaciona 1:N con los Videos y Materiales correspondientes. Eliminar o desactivar un curso desactiva en cascada todos sus videos y guías asociados.
      </p>
    </div>

    <div class="page-number">Pág. 11</div>
  </div>

  <!-- ================= CAPITULO 8 ================= -->
  <div class="page">
    <div class="badge">Capítulo 3</div>
    <h2>8. Ajustes de Configuración e Identidad</h2>
    <p>
      El panel de Ajustes permite adaptar la imagen institucional. El guardado consolida los datos de contacto, branding y pasarelas de pago.
    </p>

    <div class="screenshot-container">
      <img src="${imgAdminConf}" alt="Configuracion Admin">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Configuración):</strong> 
        [1] Pestañas selectoras de módulo (Información, Branding, Pagos). 
        [2] Campos dinámicos de texto y selector hexadecimal de color. 
        [3] Botón guardar que dispara la actualización global.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Ajustes Generales de Pestaña</div>
      <table>
        <thead>
          <tr>
            <th>Pestaña</th>
            <th>Acción / Botón</th>
            <th>Efecto de Guardado en el Backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Información General</strong></td>
            <td>Teléfono, Dirección, Email.</td>
            <td>Actualiza datos corporativos mostrados en pies de página.</td>
          </tr>
          <tr>
            <td><strong>Branding</strong></td>
            <td>Selector de realce de color.</td>
            <td>Inyecta el color hexadecimal en el CSS del campus.</td>
          </tr>
          <tr>
            <td><strong>Medios de Pago</strong></td>
            <td>Selector de archivo QR.</td>
            <td>Almacena imagen QR de pago móvil Yape/Plin.</td>
          </tr>
          <tr>
            <td><strong>Guardar Cambios</strong></td>
            <td>Disparador de guardado.</td>
            <td>Ejecuta petición PUT a <code>/api/configuracion</code>. Responde modal de éxito.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 12</div>
  </div>

  <!-- ================= CAPITULO 9 ================= -->
  <div class="page">
    <div class="badge">Capítulo 3 (Cont.)</div>
    <h2>9. Auditoría y Monitoreo del Sistema</h2>
    <p>
      El centro de operaciones y seguridad permite visualizar las bitácoras inmutables de auditoría del servidor y el rendimiento físico.
    </p>

    <div class="screenshot-container">
      <img src="${imgAdminSis}" alt="Sistema Admin">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Monitoreo):</strong> 
        [1] Tarjetas de rendimiento gráfico (CPU, Memoria, Base de Datos). 
        [2] Botones de actualización de estado y disparo de copia de seguridad (Backup).
      </div>
    </div>

    <div class="card">
      <div class="card-title">Módulo de Mantenimiento Operativo</div>
      <table>
        <thead>
          <tr>
            <th>Botón / Acción</th>
            <th>Finalidad de Uso</th>
            <th>Procedimiento del Servidor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Actualizar Estado</strong></td>
            <td>Refresca gráficas de memoria y CPU.</td>
            <td>Consulta de salud de hardware mediante GET a <code>/api/sistema/status</code>.</td>
          </tr>
          <tr>
            <td><strong>Backup Ahora</strong></td>
            <td>Generación física de respaldo SQL.</td>
            <td>Dispara <code>POST /api/sistema/backup</code>. Guarda archivo en directorio seguro.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 13</div>
  </div>

  <!-- ================= CAPITULO 10 ================= -->
  <div class="page">
    <div class="badge">Capítulo 4</div>
    <h2>10. Portal del Estudiante - Dashboard y Cursos</h2>
    <p>
      Al ingresar como estudiante, la interfaz se simplifica para centrarse en el progreso de sus clases y nivel de suscripción real.
    </p>

    <div class="screenshot-container">
      <img src="${imgStudDash}" alt="Dashboard Alumno">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Dashboard Alumno):</strong> 
        [1] Tarjetas de KPIs (Inscritos, Completados, Diplomas logrados). 
        [2] Catálogo de asignaturas con botón de ingreso rápido al reproductor.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Interacciones del Catálogo del Alumno</div>
      <table>
        <thead>
          <tr>
            <th>Botón de Tarjeta</th>
            <th>Acción en Interfaz</th>
            <th>Destino / Endpoint</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Iniciar Curso</strong></td>
            <td>Abre por primera vez el reproductor de clases.</td>
            <td>Redirige a /dashboard/cursos-play/{id}</td>
          </tr>
          <tr>
            <td><strong>Continuar</strong></td>
            <td>Abre el reproductor en la última clase vista.</td>
            <td>Recupera progreso de GET /api/avance/video/{id}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 14</div>
  </div>

  <!-- ================= CAPITULO 11 ================= -->
  <div class="page">
    <div class="badge">Capítulo 4 (Cont.)</div>
    <h2>11. Reproductor de Clases y Descargas</h2>
    <p>
      El reproductor integra la visualización de videos, guías de descarga en PDF y el desbloqueo del certificado en una única pantalla.
    </p>

    <div class="screenshot-container">
      <img src="${imgStudPlay}" alt="Reproductor Alumno">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Player):</strong> 
        [1] Pantalla principal de reproducción de video. 
        [2] Playlist lateral del temario estructurado. 
        [3] Botón marcar completado y panel de descargas de apoyo académico.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mapeo del Reproductor y Descarga de PDF</div>
      <table>
        <thead>
          <tr>
            <th>Elemento Interactivo</th>
            <th>Efecto de Clic</th>
            <th>Petición Backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Clase en playlist</strong></td>
            <td>Carga el video de YouTube seleccionado.</td>
            <td>Recupera metadatos del video cargado.</td>
          </tr>
          <tr>
            <td><strong>Marcar como completado</strong></td>
            <td>Marca progreso de la clase actual.</td>
            <td>Envía <code>POST /api/avance</code> actualizando la finalización.</td>
          </tr>
          <tr>
            <td><strong>Materiales de Apoyo (Tab)</strong></td>
            <td>Muestra PDFs vinculados por el docente.</td>
            <td>Descarga archivo binario mediante link a <code>/api/materiales/{id}/download</code>.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 15</div>
  </div>

  <!-- ================= INFOGRAFÍA 4 ================= -->
  <div class="page">
    <div class="badge">Infografía IV</div>
    <h2>Flujo de Avance y Firma de Diplomas</h2>
    <p>
      El proceso de graduación y firma digital está totalmente automatizado y controlado por el porcentaje de avance calculado en base de datos.
    </p>

    <div class="infografia-container" style="grid-template-columns: 1fr 20px 1fr 20px 1fr 20px 1fr; margin-top: 40px; margin-bottom: 40px;">
      <div class="infografia-step active">
        <div class="infografia-step-num">1</div>
        <div class="infografia-step-title">Ver Lección</div>
        <div class="infografia-step-desc">El alumno visualiza la clase grabada y da clic en "Marcar Completado".</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step">
        <div class="infografia-step-num">2</div>
        <div class="infografia-step-title">Cálculo de Progreso</div>
        <div class="infografia-step-desc">El backend calcula si todas las lecciones del curso están en estado completado (100%).</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step highlight">
        <div class="infografia-step-num">3</div>
        <div class="infografia-step-title">Firma Digital</div>
        <div class="infografia-step-desc">Se genera el código inmutable INS-YYYY-XXXX y los metadatos de emisión.</div>
      </div>
      <div class="infografia-arrow">→</div>
      <div class="infografia-step">
        <div class="infografia-step-num">4</div>
        <div class="infografia-step-title">Diploma PDF</div>
        <div class="infografia-step-desc">Se desbloquea el botón de descarga del diploma digital en formato PDF.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Estructura del Código Único de Firma</div>
      <p>
        El código de verificación del certificado (ej. <code>INS-2026-AB7C290E</code>) está compuesto por:
        <br>1. Identificador de Institución: <code>INS-</code>
        <br>2. Año de Graduación: <code>2026-</code>
        <br>3. Hash alfanumérico único generado a partir del ID de matrícula y usuario para evitar falsificaciones.
      </p>
    </div>

    <div class="page-number">Pág. 16</div>
  </div>

  <!-- ================= CAPITULO 11 ================= -->
  <div class="page">
    <div class="badge">Capítulo 5</div>
    <h2>11. Certificaciones y Validación Pública</h2>
    <p>
      El campus virtual permite verificar de forma libre y pública la autenticidad de los diplomas emitidos desde cualquier navegador externo.
    </p>

    <div class="screenshot-container">
      <img src="${imgPubVal}" alt="Validacion Publica">
      <div class="screenshot-sumilla">
        <strong>Sumilla Visual (Validación Pública):</strong> 
        [1] Distintivo de autenticidad color verde "✓ CERTIFICADO VÁLIDO". 
        [2] Grilla con metadatos del alumno, curso y fecha de emisión de firma digital.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Interacciones del Historial y Pasarela de Validación</div>
      <table>
        <thead>
          <tr>
            <th>Botón / Elemento</th>
            <th>Acción Ejecutada</th>
            <th>Respuesta de Base de Datos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Descargar PDF (Historial)</strong></td>
            <td>Descarga archivo de diploma.</td>
            <td>Llama a GET <code>/api/certificados/{id}/download</code> retornando binario PDF.</td>
          </tr>
          <tr>
            <td><strong>Validar Certificado (Enlace)</strong></td>
            <td>Abre pasarela pública en nueva pestaña.</td>
            <td>Carga la ruta sin autenticación <code>/certificados/validar/{codigo}</code>.</td>
          </tr>
          <tr>
            <td><strong>Volver al Login</strong></td>
            <td>Botón de redirección.</td>
            <td>Carga la ruta pública de acceso al campus.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-number">Pág. 17</div>
  </div>

</body>
</html>
    `;

    const tempHtmlPath = path.join(__dirname, 'manual.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);
    console.log('✔ Archivo HTML compilado correctamente.');

    // ------------------------------------------------------------------
    // 5. RENDER THE HTML AND PRINT TO PDF
    // ------------------------------------------------------------------
    console.log('\n[Paso 6] Generando archivo PDF con Playwright...');
    // Load the local HTML file in headless browser
    await page.goto(`file://${tempHtmlPath}`);
    await page.waitForLoadState('networkidle');

    // Generate the PDF
    const pdfPath = path.join(__dirname, 'Manual_de_Usuario_INSTEIP.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      }
    });

    console.log(`\n================================================================`);
    console.log(`★ MANUAL PDF GENERADO CON ÉXITO EN:`);
    console.log(`  ${pdfPath}`);
    console.log(`================================================================`);

  } catch(error) {
    console.error('\n❌ ERROR DURANTE LA GENERACIÓN DEL MANUAL:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
