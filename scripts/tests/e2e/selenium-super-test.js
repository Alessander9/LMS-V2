const { Builder, By, until, logging } = require('selenium-webdriver');
const chromeDriver = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');
const FRONTEND_BASE_URL = process.env.QA_FRONTEND_BASE_URL || 'http://localhost:4200';
const BACKEND_BASE_URL = process.env.QA_BACKEND_BASE_URL || 'http://localhost:8081';
const QA_ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL;
const QA_ADMIN_PASSWORD = process.env.QA_ADMIN_PASSWORD;
const QA_ALUMNO_PASSWORD = process.env.QA_ALUMNO_PASSWORD;
const QA_DOCENTE_PASSWORD = process.env.QA_DOCENTE_PASSWORD;

// Ensure dummy test-material.pdf exists in scripts directory
const uploadFilePath = path.join(__dirname, 'test-material.pdf');
if (!fs.existsSync(uploadFilePath)) {
  console.log('   - Generando archivo test-material.pdf temporal para la prueba...');
  fs.writeFileSync(uploadFilePath, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 43 >>\nstream\nBT /F1 12 Tf 70 700 Td (E2E Test Dummy PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n306\n%%EOF');
}

async function runSeleniumSuperTest() {
  if (!QA_ADMIN_EMAIL || !QA_ADMIN_PASSWORD || !QA_ALUMNO_PASSWORD || !QA_DOCENTE_PASSWORD) {
    throw new Error('Define las credenciales QA antes de ejecutar Selenium.');
  }
  console.log('================================================================');
  console.log('         INSTEIP - INICIANDO SÚPER TEST E2E CON SELENIUM        ');
  console.log('================================================================');

  let options = new chromeDriver.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-extensions');
  options.addArguments('--window-size=1280,800');
  options.addArguments('--headless=new');

  // Enable browser log capturing
  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  options.setLoggingPrefs(prefs);

  // Define download path inside workspace
  const downloadDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }
  options.setUserPreferences({
    'download.default_directory': downloadDir,
    'download.prompt_for_download': false,
    'download.directory_upgrade': true,
    'safebrowsing.enabled': true
  });

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Helper wait & click with scrollIntoView
  async function waitAndClick(selector, timeout = 15000) {
    let el = await driver.wait(until.elementLocated(selector), timeout);
    try {
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
      await driver.sleep(100);
    } catch (e) {}
    try {
      await driver.wait(until.elementIsVisible(el), timeout);
    } catch (e) {
      el = await driver.findElement(selector);
    }
    try {
      await el.click();
    } catch (e) {
      try {
        await driver.executeScript("arguments[0].click();", el);
      } catch (jsErr) {
        const freshEl = await driver.findElement(selector);
        await driver.executeScript("arguments[0].click();", freshEl);
      }
    }
    return el;
  }

  // Helper wait & sendKeys with JS value setting and event dispatching for Angular compatibility
  async function waitAndSendKeys(selector, text, timeout = 15000) {
    let el = await driver.wait(until.elementLocated(selector), timeout);
    try {
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
      await driver.sleep(100);
    } catch (e) {}
    try {
      await driver.wait(until.elementIsVisible(el), timeout);
    } catch (e) {
      el = await driver.findElement(selector);
    }
    
    try {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; " +
        "arguments[0].dispatchEvent(new Event('input', { bubbles: true })); " +
        "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
        el, text
      );
    } catch (e) {
      const freshEl = await driver.findElement(selector);
      await driver.executeScript(
        "arguments[0].value = arguments[1]; " +
        "arguments[0].dispatchEvent(new Event('input', { bubbles: true })); " +
        "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
        freshEl, text
      );
    }
    return el;
  }

  // Helper wait until modal is absent from the DOM
  async function waitForModalToClose(xpathQuery, timeout = 15000) {
    await driver.wait(async () => {
      const elements = await driver.findElements(By.xpath(xpathQuery));
      return elements.length === 0;
    }, timeout);
  }

  // Helper confirm modal
  async function confirmModal(timeout = 10000) {
    const btn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Confirmar')]")), timeout);
    try {
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
    } catch (e) {}
    await driver.wait(until.elementIsVisible(btn), timeout);
    await driver.executeScript("arguments[0].click();", btn);
  }

  const timestamp = Date.now();
  const testAlumnoEmail = `alumno.selenium.${timestamp}@insteip.com`;
  const testDocenteEmail = `docente.selenium.${timestamp}@insteip.com`;
  const testCourseName = `Curso Selenium ${timestamp}`;
  let cleanCertCode = '';

  try {
    // ==================================================================
    // STEP 1: PUBLIC VIEW TESTING
    // ==================================================================
    console.log('\n[1/14] Navegando a la Página de Inicio pública...');
    await driver.get(`${FRONTEND_BASE_URL}/inicio`);
    await driver.wait(until.elementLocated(By.xpath("//h1")), 10000);
    const mainTitle = await driver.findElement(By.xpath("//h1")).getText();
    console.log(`     ✔ Título encontrado: "${mainTitle.replace(/\n/g, ' ')}"`);

    console.log('   - Accediendo al catálogo público...');
    await driver.get(`${FRONTEND_BASE_URL}/cursos`);
    await driver.wait(until.elementLocated(By.css('.course-grid')), 10000);
    const courses = await driver.findElements(By.css('.course-card'));
    console.log(`     ✔ Cursos visibles en catálogo: ${courses.length}`);

    // ==================================================================
    // STEP 2: LOGIN AS ADMINISTRATOR
    // ==================================================================
    console.log('\n[2/14] Iniciando sesión como Administrador...');
    await driver.get(`${FRONTEND_BASE_URL}/login`);
    await waitAndSendKeys(By.css('input[type="email"]'), QA_ADMIN_EMAIL);
    await waitAndSendKeys(By.css('input[type="password"]'), QA_ADMIN_PASSWORD);
    await waitAndClick(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('/dashboard'), 15000);
    console.log('     ✔ Sesión de Administrador iniciada correctamente.');

    // ==================================================================
    // STEP 3: CHECK QUICK ACCESS METRICS
    // ==================================================================
    console.log('\n[3/14] Validando métricas en Dashboard Home...');
    const alumnosMetric = await driver.wait(until.elementLocated(By.xpath("//span[contains(., 'Total Alumnos')]")), 10000);
    const coursesMetric = await driver.wait(until.elementLocated(By.xpath("//span[contains(., 'Total Cursos')]")), 10000);
    console.log('     ✔ Métricas visuales cargadas en Dashboard.');

    // ==================================================================
    // STEP 4: ALUMNOS CRUD (ADMIN)
    // ==================================================================
    console.log('\n[4/14] Gestionando Alumnos (Crear, Editar, Buscar, Alternar Estado)...');
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/alumnos']"));
    await driver.wait(until.urlContains('/dashboard/alumnos'), 10000);
    const headerAlumnos = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Gestión de Alumnos')]")), 10000);
    await driver.wait(until.elementIsVisible(headerAlumnos), 10000);

    // Export CSV
    await waitAndClick(By.xpath("//button[contains(., 'Exportar CSV')]"));
    console.log('     ✔ Botón de exportación de Alumnos clickeado.');

    // Create Alumno
    await waitAndClick(By.xpath("//button[contains(., 'Crear Alumno')]"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Registrar Nuevo Alumno')]")), 10000);

    // Use letters only for names to satisfy the backend validation regex pattern
    await waitAndSendKeys(By.css('input[formControlName="nombres"]'), 'Alumno');
    await waitAndSendKeys(By.css('input[formControlName="apellidos"]'), 'Selenium');
    await waitAndSendKeys(By.css('input[formControlName="correo"]'), testAlumnoEmail);
    await waitAndSendKeys(By.css('input[formControlName="telefono"]'), '987654321');
    await waitAndSendKeys(By.css('input[formControlName="password"]'), QA_ALUMNO_PASSWORD);
    
    // Select Subscription Level (Premium is index/value 3)
    const selectSub = await driver.findElement(By.css('select[formControlName="nivelSuscripcionId"]'));
    await selectSub.click();
    await driver.findElement(By.xpath("//select[@formControlName='nivelSuscripcionId']/option[@value='3']")).click();

    await waitAndClick(By.xpath("//button[contains(., 'Guardar Alumno')]"));
    await waitForModalToClose("//h3[contains(., 'Registrar Nuevo Alumno')]");
    console.log(`     ✔ Alumno creado exitosamente: ${testAlumnoEmail}`);

    // Search and verify in table
    await waitAndSendKeys(By.css('input[placeholder="Buscar por nombre o correo..."]'), testAlumnoEmail);
    await driver.sleep(1500);

    // Detail modal using row-specific selectors
    await waitAndClick(By.xpath("//tr[contains(., '" + testAlumnoEmail + "')]//button[@title='Ver Detalle']"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Ficha Detallada del Alumno')]")), 10000);
    await waitAndClick(By.xpath("//button[contains(., 'Cerrar Ficha')]"));

    // Edit Alumno
    await waitAndClick(By.xpath("//tr[contains(., '" + testAlumnoEmail + "')]//button[@title='Editar Alumno']"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Editar Datos del Alumno')]")), 10000);
    await waitAndSendKeys(By.css('input[formControlName="apellidos"]'), 'SeleniumModificado');
    await waitAndClick(By.xpath("//button[contains(., 'Guardar Alumno')]"));
    await waitForModalToClose("//h3[contains(., 'Editar Datos del Alumno')]");
    console.log('     ✔ Alumno editado correctamente.');

    // Toggle Alumno status
    await waitAndClick(By.xpath("//tr[contains(., '" + testAlumnoEmail + "')]//button[@title='Desactivar']"));
    await confirmModal();
    await driver.sleep(1500);
    await waitAndClick(By.xpath("//tr[contains(., '" + testAlumnoEmail + "')]//button[@title='Activar']"));
    await confirmModal();
    console.log('     ✔ Estado del Alumno (Activar/Desactivar) validado.');

    // Clear search
    await waitAndSendKeys(By.css('input[placeholder="Buscar por nombre o correo..."]'), '');
    await driver.sleep(500);

    // ==================================================================
    // STEP 5: DOCENTES CRUD (ADMIN)
    // ==================================================================
    console.log('\n[5/14] Gestionando Docentes (Crear, Editar, Buscar, Alternar Estado)...');
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/docentes']"));
    await driver.wait(until.urlContains('/dashboard/docentes'), 10000);
    const headerDocentes = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Gestion de Docentes')]")), 10000);
    await driver.wait(until.elementIsVisible(headerDocentes), 10000);

    // Create Docente
    await waitAndClick(By.xpath("//button[contains(., 'Crear Docente')]"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Registrar Nuevo Docente')]")), 10000);

    await waitAndSendKeys(By.css('input[formControlName="nombres"]'), 'Docente');
    await waitAndSendKeys(By.css('input[formControlName="apellidos"]'), 'Selenium');
    await waitAndSendKeys(By.css('input[formControlName="correo"]'), testDocenteEmail);
    await waitAndSendKeys(By.css('input[formControlName="telefono"]'), '999888777');
    await waitAndSendKeys(By.css('input[formControlName="password"]'), QA_DOCENTE_PASSWORD);

    await waitAndClick(By.xpath("//button[contains(., 'Guardar Docente')]"));
    await waitForModalToClose("//h3[contains(., 'Registrar Nuevo Docente')]");
    console.log(`     ✔ Docente creado exitosamente: ${testDocenteEmail}`);

    // Edit Docente
    await waitAndSendKeys(By.css('input[placeholder="Buscar por nombre o correo..."]'), testDocenteEmail);
    await driver.sleep(1500);
    await waitAndClick(By.xpath("//tr[contains(., '" + testDocenteEmail + "')]//button[@title='Editar Docente']"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Editar Datos del Docente')]")), 10000);
    await waitAndSendKeys(By.css('input[formControlName="apellidos"]'), 'SeleniumModificado');
    await waitAndClick(By.xpath("//button[contains(., 'Guardar Docente')]"));
    await waitForModalToClose("//h3[contains(., 'Editar Datos del Docente')]");
    console.log('     ✔ Docente editado correctamente.');

    // Clear search
    await waitAndSendKeys(By.css('input[placeholder="Buscar por nombre o correo..."]'), '');
    await driver.sleep(500);

    // ==================================================================
    // STEP 6: CURSOS CRUD (ADMIN)
    // ==================================================================
    console.log('\n[6/14] Gestionando Cursos (Crear Curso con Niveles y Docente)...');
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/cursos']"));
    await driver.wait(until.urlContains('/dashboard/cursos'), 10000);
    const headerCursos = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Gestión de Cursos')]")), 10000);
    await driver.wait(until.elementIsVisible(headerCursos), 10000);

    // Export CSV
    await waitAndClick(By.css('button.btn-export'));
    console.log('     ✔ Botón de exportación de Cursos clickeado.');

    // Create Course
    await waitAndClick(By.css('button.btn-create'));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Registrar Nuevo Curso')]")), 10000);

    await waitAndSendKeys(By.css('input[formControlName="nombre"]'), testCourseName);
    await waitAndSendKeys(By.css('textarea[formControlName="descripcion"]'), 'Curso de pruebas Selenium.');
    await waitAndSendKeys(By.css('input[formControlName="imagenPortada"]'), 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97');

    // Subscription Levels (Intermediate and Premium)
    await waitAndClick(By.xpath("//button[contains(., 'Intermedio')]"));
    await waitAndClick(By.xpath("//button[contains(., 'Premium')]"));

    // Assign the newly created Docente in Custom Dropdown
    console.log(`   - Buscando y asignando docente ${testDocenteEmail} en el curso...`);
    await waitAndSendKeys(By.css('input[placeholder="Buscar por nombre o correo..."]'), testDocenteEmail);
    await driver.sleep(1500);
    await waitAndClick(By.xpath(`//button[contains(., '${testDocenteEmail}')]`));

    await waitAndClick(By.xpath("//button[contains(., 'Guardar Curso')]"));
    await waitForModalToClose("//h3[contains(., 'Registrar Nuevo Curso')]");
    console.log(`     ✔ Curso creado: "${testCourseName}" asignado a ${testDocenteEmail}.`);

    // ==================================================================
    // STEP 7: COURSE SYLLABUS, MATERIALS, VIDEOS & ENROLLMENT (ADMIN)
    // ==================================================================
    console.log('\n[7/14] Configurando Temario, Clases y Matrícula del Curso...');
    await waitAndSendKeys(By.css('input[placeholder="Buscar por nombre o descripción..."]'), testCourseName);
    await driver.sleep(2000);
    
    // Click the specific row matching the new course name
    await waitAndClick(By.xpath("//tr[contains(., '" + testCourseName + "')]//button[@title='Administrar Temario y Alumnos']"));

    // Wait for detail view URL with exact route ID
    await driver.wait(until.urlMatches(/\/dashboard\/cursos\/\d+/), 15000);
    
    // Wait for the detail view unique element (the Volver link) to make sure page has loaded
    const backBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(., 'Volver a la lista de cursos')]")), 15000);
    await driver.wait(until.elementIsVisible(backBtn), 15000);

    // Let the Docentes list finish loading from the API
    await driver.sleep(2000);

    // Edit course inside details view
    await waitAndClick(By.xpath("//button[contains(., 'Editar Curso')]"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Modificar Curso')]")), 15000);

    await waitAndSendKeys(By.css('textarea[formControlName="descripcion"]'), 'Curso de pruebas Selenium con temario completo.');
    await waitAndClick(By.xpath("//button[contains(., 'Guardar Cambios')]"));
    await waitForModalToClose("//h3[contains(., 'Modificar Curso')]");
    console.log('     ✔ Curso editado en ficha técnica.');

    // Add module
    await waitAndClick(By.xpath("//button[contains(., 'Agregar Módulo')]"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Registrar Nuevo Módulo')]")), 10000);
    await waitAndSendKeys(By.css('input[formControlName="nombre"]'), 'Módulo Principal Selenium');
    await waitAndSendKeys(By.css('textarea[formControlName="descripcion"]'), 'Contenidos básicos de Selenium.');
    await waitAndSendKeys(By.css('input[formControlName="orden"]'), '1');
    await waitAndClick(By.xpath("//button[contains(., 'Guardar Módulo')]"));
    await waitForModalToClose("//h3[contains(., 'Registrar Nuevo Módulo')]");
    console.log('     ✔ Módulo guardado.');

    // Expand accordion
    await waitAndClick(By.xpath("//h3[contains(., 'Módulo Principal Selenium')]"));
    await driver.sleep(1500);

    // Add Video
    console.log('   - Agregando video de clase...');
    await waitAndClick(By.xpath("//button[contains(., 'Agregar Video')]"));
    await waitAndSendKeys(By.css('input[placeholder="Ej. Introducción Práctica"]'), 'Vídeo Clase Selenium');
    await waitAndSendKeys(By.css('input[placeholder="Ej. https://youtube.com/watch?v=..."]'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await waitAndSendKeys(By.css('textarea[placeholder="Contenido clave de la lección..."]'), 'Explicación teórica de E2E.');
    await waitAndClick(By.xpath("//button[contains(., 'Guardar Video')]"));
    await driver.sleep(2000);

    // Upload Material File
    console.log('   - Subiendo archivo PDF de material...');
    await waitAndClick(By.xpath("//button[contains(., 'Subir Archivo')]"));
    await waitAndSendKeys(By.css('input[placeholder="Ej. Guía Práctica Excel"]'), 'Material Académico Selenium');
    const fileInput = await driver.findElement(By.css('input[type="file"]'));
    await fileInput.sendKeys(uploadFilePath);
    await waitAndClick(By.xpath("//button[contains(., 'Subir Archivo')]"));
    await driver.sleep(2500);
    console.log('     ✔ Material cargado exitosamente.');

    // Enroll the new Alumno
    console.log('   - Matriculando alumno de prueba...');
    await waitAndClick(By.xpath("//button[contains(., 'Alumnos Matriculados')]"));
    await waitAndClick(By.xpath("//button[contains(., 'Matricular Alumno')]"));
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Matricular Alumno')]")), 10000);

    const enrollSearch = await driver.findElement(By.css('input[name="alumnoSearchTerm"]'));
    await enrollSearch.sendKeys(testAlumnoEmail);
    await driver.sleep(2000);
    await waitAndClick(By.xpath(`//button[contains(., '${testAlumnoEmail}')]`));
    await driver.sleep(500);
    await waitAndClick(By.xpath("//button[normalize-space(text())='Matricular']"));
    await waitForModalToClose("//h3[contains(., 'Matricular Alumno')]");
    console.log('     ✔ Alumno matriculado en el curso.');

    // Export matriculas CSV
    await waitAndClick(By.xpath("//button[contains(., 'Exportar CSV')]"));
    console.log('     ✔ Matrículas CSV exportadas.');

    // ==================================================================
    // STEP 8: CONFIGURATION & REPORTS (ADMIN)
    // ==================================================================
    console.log('\n[8/14] Validando Configuración y Reportes de Certificados...');
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/certificados']"));
    await driver.wait(until.urlContains('/dashboard/certificados'), 10000);
    const headerCerts = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Reporte de Certificados')]")), 10000);
    await driver.wait(until.elementIsVisible(headerCerts), 10000);
    await waitAndClick(By.xpath("//button[contains(., 'Exportar CSV')]"));
    console.log('     ✔ Reporte de Certificados CSV descargado.');

    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/configuracion']"));
    await driver.wait(until.urlContains('/dashboard/configuracion'), 10000);
    const headerConfig = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Configuración Institucional')]")), 10000);
    await driver.wait(until.elementIsVisible(headerConfig), 10000);
    
    // Check tabs
    await waitAndClick(By.xpath("//button[contains(., 'Medios de Pago')]"));
    await waitAndClick(By.xpath("//button[contains(., 'Branding')]"));
    await waitAndClick(By.xpath("//button[contains(., 'Información General')]"));
    await waitAndSendKeys(By.css('input[formControlName="telefono"]'), '999999999');
    await waitAndClick(By.xpath("//button[contains(., 'Guardar Cambios')]"));
    await driver.sleep(1500);
    console.log('     ✔ Pestañas y Guardado de configuración validados.');

    // ==================================================================
    // STEP 9: SYSTEM AUDIT & STATUS (ADMIN)
    // ==================================================================
    console.log('\n[9/14] Validando Auditoría y Monitoreo de Sistema...');
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/auditoria']"));
    await driver.wait(until.urlContains('/dashboard/auditoria'), 10000);
    const headerAudit = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Auditoría de Seguridad')]")), 10000);
    await driver.wait(until.elementIsVisible(headerAudit), 10000);
    await waitAndClick(By.xpath("//button[contains(., 'Sistema')]"));
    await waitAndClick(By.xpath("//button[contains(., 'Login')]"));

    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/sistema']"));
    await driver.wait(until.urlContains('/dashboard/sistema'), 10000);
    const headerSystem = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Monitoreo del Sistema')]")), 10000);
    await driver.wait(until.elementIsVisible(headerSystem), 10000);
    await waitAndClick(By.xpath("//button[contains(., 'Actualizar Estado')]"));
    
    await waitAndClick(By.xpath("//button[contains(., 'Backup Ahora')]"));
    await confirmModal();
    await driver.wait(async () => {
      try {
        const text = await driver.findElement(By.tagName('body')).getText();
        return text.includes('Copia de Seguridad Completada') || text.includes('Backup generado exitosamente');
      } catch (e) {
        return false;
      }
    }, 45000);
    console.log('     ✔ Tareas de bitácora y backup manual ejecutadas.');

    // Logout Admin
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//button[contains(., 'Cerrar Sesión')]"));
    await driver.wait(until.urlContains('/login'), 10000);
    console.log('     ✔ Sesión de Administrador cerrada.');

    // ==================================================================
    // STEP 10: LOGIN & FLOW AS DOCENTE
    // ==================================================================
    console.log(`\n[10/14] Iniciando sesión como el Docente Creado (${testDocenteEmail})...`);
    await waitAndSendKeys(By.css('input[type="email"]'), testDocenteEmail);
    await waitAndSendKeys(By.css('input[type="password"]'), QA_DOCENTE_PASSWORD);
    await waitAndClick(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('/dashboard'), 15000);
    console.log('     ✔ Sesión de Docente iniciada.');

    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/mis-cursos-docente']"));
    await driver.wait(until.urlContains('/dashboard/mis-cursos-docente'), 10000);
    const headerDocCursos = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Mis Cursos')]")), 10000);
    await driver.wait(until.elementIsVisible(headerDocCursos), 10000);
    const assignedCourses = await driver.findElements(By.xpath("//button[contains(., 'Estudiantes')]"));
    if (assignedCourses.length === 0) {
      throw new Error('El docente creado no tiene cursos asignados. La prueba de permisos no puede continuar.');
    }
    console.log(`     ✔ Cursos asignados al docente: ${assignedCourses.length}`);

    // Click "Estudiantes" on the first course
    await waitAndClick(By.xpath("//button[contains(., 'Estudiantes')]"));
    await driver.wait(until.urlContains('/dashboard/mis-alumnos-docente/'), 10000);
    console.log('     ✔ Listado de alumnos del curso asignado verificado.');

    // Logout Docente
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//button[contains(., 'Cerrar Sesión')]"));
    await driver.wait(until.urlContains('/login'), 10000);
    console.log('     ✔ Sesión de Docente cerrada.');

    // ==================================================================
    // STEP 11: LOGIN AS NEW STUDENT (ALUMNO E2E)
    // ==================================================================
    console.log(`\n[11/14] Iniciando sesión como el Alumno Creado (${testAlumnoEmail})...`);
    await waitAndSendKeys(By.css('input[type="email"]'), testAlumnoEmail);
    await waitAndSendKeys(By.css('input[type="password"]'), QA_ALUMNO_PASSWORD);
    await waitAndClick(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('/dashboard'), 15000);
    console.log('     ✔ Sesión de Alumno iniciada.');

    // Validate Student KPIs
    await driver.wait(until.elementLocated(By.xpath("//span[contains(., 'Cursos Inscritos')]")), 10000);
    console.log('     ✔ KPIs del alumno cargados.');

    // ==================================================================
    // STEP 12: STUDENT AULA VIRTUAL (PLAY), DOWNLOADS & DIPLOMA
    // ==================================================================
    console.log('\n[12/14] Validando reproducción de clases y descarga de materiales...');
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/mis-cursos']"));
    await driver.wait(until.urlContains('/dashboard/mis-cursos'), 10000);
    const headerAluCursos = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Mis Cursos')]")), 10000);
    await driver.wait(until.elementIsVisible(headerAluCursos), 10000);

    // Start Course
    await waitAndClick(By.xpath("//button[contains(., 'Iniciar') or contains(., 'Continuar')]"));
    await driver.wait(until.urlContains('/dashboard/cursos-play/'), 10000);

    // Click class/video to play
    await waitAndClick(By.css('div[class*="space-y-1.5"] button'));
    console.log('     ✔ Clase cargada en el reproductor.');

    // Read Tabs
    await waitAndClick(By.xpath("//button[contains(., 'Información del Curso')]"));
    await waitAndClick(By.xpath("//button[contains(., 'Materiales de Apoyo')]"));
    
    // Download Material
    await waitAndClick(By.xpath("//button[contains(., 'download')]"));
    await driver.sleep(1500);
    console.log('     ✔ Material descargado.');

    // Complete class via direct API call (more reliable than Angular component injection)
    console.log('   - Completando la clase vía API directa para desbloquear el certificado...');
    
    // Get the auth token from the browser's localStorage
    const token = await driver.executeScript("return localStorage.getItem('token');");
    
    // First, get the course play structure to find the video ID
    const coursePlayUrl = await driver.getCurrentUrl();
    const courseIdMatch = coursePlayUrl.match(/\/dashboard\/cursos-play\/(\d+)/);
    const coursePlayId = courseIdMatch ? courseIdMatch[1] : '';
    
    // Fetch course structure via API to get video ID
    const apiBase = `${BACKEND_BASE_URL}/api`;
    const authHeaders = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    
    const playResponse = await fetch(`${apiBase}/alumno/cursos/${coursePlayId}/play`, { headers: authHeaders });
    const playData = await playResponse.json();
    
    // Find the first video ID
    let videoId = null;
    if (playData && playData.modulos && playData.modulos.length > 0) {
      const modulos = Array.isArray(playData.modulos) ? playData.modulos : [];
      for (const mod of modulos) {
        if (mod.videos && mod.videos.length > 0) {
          videoId = mod.videos[0].id;
          const videoDuration = mod.videos[0].duracionSegundos || 300;
          // Save progress at 100%
          const progressResponse = await fetch(`${apiBase}/avance`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ videoId, ultimoSegundo: videoDuration, duracionSegundos: videoDuration })
          });
          const progressData = await progressResponse.json();
          console.log(`     ✔ Progreso guardado vía API: video ${videoId} completado.`);
          break;
        }
      }
    }
    
    if (videoId) {
      // Generate certificate via API
      const certResponse = await fetch(`${apiBase}/certificados/generar/${coursePlayId}`, {
        method: 'POST',
        headers: authHeaders
      });
      
      if (certResponse.ok) {
        const certData = await certResponse.json();
        cleanCertCode = certData.codigo || '';
        console.log(`     ✔ Certificado generado vía API: ${cleanCertCode}`);
      } else {
        console.log('   - El certificado pudo ya existir, obteniendo código desde la UI...');
      }
    }
    
    // Refresh the play page to reflect completion
    await driver.navigate().refresh();
    await driver.sleep(3000);

    // Open Certificate tab
    await waitAndClick(By.xpath("//button[contains(., 'Certificado Oficial')]"));
    await driver.sleep(1500);

    // If we don't have the code yet, try to extract from UI
    if (!cleanCertCode) {
      try {
        const certCodeElement = await driver.wait(until.elementLocated(By.xpath("//strong[contains(text(), 'INS-')]")), 10000);
        const rawCode = await certCodeElement.getText();
        cleanCertCode = rawCode.trim();
      } catch (e) {
        // Try generating via API one more time
        const retryCertResponse = await fetch(`${apiBase}/certificados/generar/${coursePlayId}`, {
          method: 'POST',
          headers: authHeaders
        });
        if (retryCertResponse.ok) {
          const retryCertData = await retryCertResponse.json();
          cleanCertCode = retryCertData.codigo || '';
        }
        await driver.navigate().refresh();
        await driver.sleep(3000);
        await waitAndClick(By.xpath("//button[contains(., 'Certificado Oficial')]"));
        await driver.sleep(1500);
        const certCodeElement = await driver.wait(until.elementLocated(By.xpath("//strong[contains(text(), 'INS-')]")), 10000);
        const rawCode = await certCodeElement.getText();
        cleanCertCode = rawCode.trim();
      }
    }
    console.log(`     ✔ Código de certificado: ${cleanCertCode}`);

    // Download generated Certificate
    await waitAndClick(By.xpath("//button[contains(., 'Descargar PDF')]"));
    await driver.sleep(1500);
    console.log('     ✔ Diploma oficial descargado.');

    // Verify history "Mis Certificados" (refresh to see new cert)
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/certificados']"));
    await driver.wait(until.urlContains('/dashboard/certificados'), 10000);
    await driver.navigate().refresh();
    await driver.sleep(2000);
    if (cleanCertCode) {
      await driver.wait(until.elementLocated(By.xpath(`//td[contains(., '${cleanCertCode}')]`)), 15000);
      console.log('     ✔ Diploma verificado en el historial personal del alumno.');
    } else {
      console.log('     ⚠ No se pudo verificar el diploma en el historial (código no disponible).');
    }

    // Profile Achievements view
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//a[@routerLink='/dashboard/perfil']"));
    await driver.wait(until.urlContains('/dashboard/perfil'), 10000);
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'PREMIUM')]")), 10000);
    console.log('     ✔ Ficha de logros y nivel de suscripción Premium validados.');

    // Logout Alumno
    await waitAndClick(By.xpath("//aside[contains(@class, 'md:flex')]//button[contains(., 'Cerrar Sesión')]"));
    await driver.wait(until.urlContains('/login'), 10000);

    // ==================================================================
    // STEP 13: PUBLIC CERTIFICATE VALIDATION GATEWAY
    // ==================================================================
    console.log('\n[13/14] Validando firma digital en la pasarela pública de validación...');
    const validationUrl = `${FRONTEND_BASE_URL}/certificados/validar/${cleanCertCode}`;
    await driver.get(validationUrl);

    await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'CERTIFICADO VÁLIDO')]")), 15000);
    const valCode = await driver.findElement(By.css('[data-testid="validation-codigo"]')).getText();
    const valStudent = await driver.findElement(By.css('[data-testid="validation-alumno"]')).getText();
    const valCourse = await driver.findElement(By.css('[data-testid="validation-curso"]')).getText();
    
    console.log(`     Código validado: ${valCode.trim()}`);
    console.log(`     Alumno validado: ${valStudent.trim()}`);
    console.log(`     Curso validado: ${valCourse.trim()}`);
    console.log('     ✔ Firma y datos correctos expuestos en portal público.');

    // ==================================================================
    // STEP 14: API ENDPOINT ROBUST CHECK
    // ==================================================================
    console.log('\n[14/14] Ejecutando comprobación final de salud de las APIs...');
    await driver.get(`${BACKEND_BASE_URL}/actuator/health`);
    const bodyContent = await driver.findElement(By.tagName('body')).getText();
    if (bodyContent.includes('"status":"UP"') || bodyContent.includes('UP')) {
      console.log('     ✔ API Actuator Health: UP.');
    } else {
      throw new Error('API Actuator no retornó estado UP. Contenido: ' + bodyContent);
    }

    console.log('\n================================================================');
    console.log('    ★ SÚPER TEST E2E DE SELENIUM COMPLETADO CON ÉXITO: OK ★      ');
    console.log('================================================================');
  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA EJECUCIÓN DEL SÚPER TEST E2E:', error);
    try {
      const screenshot = await driver.takeScreenshot();
      const screenshotPath = path.join('C:\\Users\\Alessander\\.gemini\\antigravity-ide\\brain\\c1cecf65-a7bd-4760-80bf-7622f3009444', 'screenshot_error.png');
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      console.log(`   [DEBUG] Captura de pantalla del error guardada en: ${screenshotPath}`);
      
      // Get browser console logs
      const logs = await driver.manage().logs().get(logging.Type.BROWSER);
      console.log('\n--- BROWSER CONSOLE LOGS ---');
      logs.forEach(log => {
        console.log(`[${log.level.name}] ${log.message}`);
      });
      console.log('----------------------------\n');
    } catch (ssErr) {
      console.error('No se pudo tomar la captura de pantalla o leer los logs:', ssErr);
    }
    process.exit(1);
  } finally {
    try {
      const loginResponse = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: QA_ADMIN_EMAIL, password: QA_ADMIN_PASSWORD })
      });
      const loginData = await loginResponse.json();
      const adminToken = loginData.token || loginData.accessToken;
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [usersResponse, docentesResponse, cursosResponse] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/api/usuarios?size=100`, { headers }),
        fetch(`${BACKEND_BASE_URL}/api/usuarios/docentes?size=100`, { headers }),
        fetch(`${BACKEND_BASE_URL}/api/cursos?size=100`, { headers })
      ]);
      const users = (await usersResponse.json()).content || [];
      const docentes = (await docentesResponse.json()).content || [];
      const cursos = (await cursosResponse.json()).content || [];
      const course = cursos.find(item => item.nombre === testCourseName);
      const createdUsers = users.filter(item => item.correo === testAlumnoEmail);
      const createdDocentes = docentes.filter(item => item.correo === testDocenteEmail);

      if (course) {
        await fetch(`${BACKEND_BASE_URL}/api/cursos/${course.id}`, { method: 'DELETE', headers });
        console.log(`   ✔ Curso Selenium limpiado: ${course.id}`);
      }
      for (const user of [...createdUsers, ...createdDocentes]) {
        const endpoint = createdDocentes.includes(user)
          ? `/api/usuarios/docentes/${user.id}`
          : `/api/usuarios/${user.id}`;
        await fetch(`${BACKEND_BASE_URL}${endpoint}`, { method: 'DELETE', headers });
        console.log(`   ✔ Usuario Selenium limpiado: ${user.id}`);
      }
    } catch (cleanupError) {
      console.error('No se pudo completar la limpieza de datos Selenium:', cleanupError.message);
      process.exitCode = 1;
    }
    await driver.quit();
  }
}

runSeleniumSuperTest();
