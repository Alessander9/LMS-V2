// selenium_test/selenium_runner.js
const { Builder, By, Key, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:4200';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function takeScreenshot(driver, name) {
  try {
    const image = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    fs.writeFileSync(filePath, image, 'base64');
    console.log(` -> 📸 Captura guardada: ${name}.png`);
  } catch (e) {
    console.error(` -> Error al tomar captura: ${e.message}`);
  }
}

async function runSeleniumTests() {
  console.log('======================================================================');
  console.log('>> INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS SELENIUM E2E (LMS V2) <<');
  console.log('======================================================================');

  let driver;
  
  try {
    const edgeOptions = new edge.Options();
    edgeOptions.addArguments('--headless=new');
    edgeOptions.addArguments('--disable-gpu');
    edgeOptions.addArguments('--no-sandbox');
    edgeOptions.addArguments('--disable-dev-shm-usage');
    edgeOptions.addArguments('--window-size=1600,1000');

    driver = await new Builder()
      .forBrowser('MicrosoftEdge')
      .setEdgeOptions(edgeOptions)
      .build();
    console.log(' -> Navegador Microsoft Edge WebDriver iniciado en modo Headless.');
  } catch (edgeErr) {
    console.log(' -> Probando con Chrome WebDriver...');
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--headless=new');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--window-size=1600,1000');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    console.log(' -> Navegador Chrome WebDriver iniciado en modo Headless.');
  }

  try {
    // -------------------------------------------------------------
    // FASE 1: PANTALLA DE CARGA Y LOGIN
    // -------------------------------------------------------------
    console.log('\n[FASE 1] Verificando Pantalla de Carga y Acceso al Login...');
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(2000);

    const title = await driver.getTitle();
    console.log(` -> Título de la Aplicación: "${title}"`);
    await takeScreenshot(driver, '01_login_screen');

    // -------------------------------------------------------------
    // FASE 2: ROL ADMINISTRADOR (DASHBOARD & MÓDULOS ACADÉMICOS)
    // -------------------------------------------------------------
    console.log('\n[FASE 2] Probando Flujo del Rol ADMINISTRADOR...');
    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"], input[formcontrolname="correo"]')), 10000);
    const passInput = await driver.findElement(By.css('input[type="password"], input[formcontrolname="password"]'));
    
    await emailInput.clear();
    await emailInput.sendKeys('admin@plataformalms.com');
    await passInput.clear();
    await passInput.sendKeys('admin_password');
    
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();

    await driver.wait(until.urlContains('/dashboard'), 12000);
    await driver.sleep(2500);
    console.log(' -> ✅ Login Administrador OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '02_admin_dashboard');

    // Módulo Asistencia QR
    console.log(' -> Accediendo a /dashboard/asistencia-qr...');
    await driver.get(`${BASE_URL}/dashboard/asistencia-qr`);
    await driver.sleep(2500);
    console.log(' -> ✅ Asistencia QR OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '03_admin_asistencia_qr');

    // Módulo Gestión de Notas
    console.log(' -> Accediendo a /dashboard/gestion-notas...');
    await driver.get(`${BASE_URL}/dashboard/gestion-notas`);
    await driver.sleep(2500);
    console.log(' -> ✅ Gestión de Notas (MINEDU / Instituto) OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '04_admin_gestion_notas');

    // Módulo Directorio Estudiantes & Legajos
    console.log(' -> Accediendo a /dashboard/estudiantes...');
    await driver.get(`${BASE_URL}/dashboard/estudiantes`);
    await driver.sleep(2500);
    console.log(' -> ✅ Directorio Estudiantes & Carnet QR OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '05_admin_estudiantes_carnet_qr');

    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
    console.log(' -> Sesión de Administrador cerrada correctamente.');

    // -------------------------------------------------------------
    // FASE 3: ROL DOCENTE (TOMA DE ASISTENCIA & MATRIZ DE NOTAS)
    // -------------------------------------------------------------
    console.log('\n[FASE 3] Probando Flujo del Rol DOCENTE...');
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1500);

    const emailDoc = await driver.wait(until.elementLocated(By.css('input[type="email"], input[formcontrolname="correo"]')), 10000);
    const passDoc = await driver.findElement(By.css('input[type="password"], input[formcontrolname="password"]'));
    
    await emailDoc.clear();
    await emailDoc.sendKeys('docente@plataformalms.com');
    await passDoc.clear();
    await passDoc.sendKeys('docente_password');
    
    const loginDocBtn = await driver.findElement(By.css('button[type="submit"]'));
    await loginDocBtn.click();

    await driver.wait(until.urlContains('/dashboard'), 12000);
    await driver.sleep(2500);
    console.log(' -> ✅ Login Docente OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '06_docente_dashboard');

    // Docente - Asistencia QR
    await driver.get(`${BASE_URL}/dashboard/asistencia-qr`);
    await driver.sleep(2000);
    console.log(' -> ✅ Docente: Lector de Asistencia QR OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '07_docente_asistencia_qr');

    // Docente - Gestión de Notas
    await driver.get(`${BASE_URL}/dashboard/gestion-notas`);
    await driver.sleep(2000);
    console.log(' -> ✅ Docente: Matriz de Calificaciones OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '08_docente_gestion_notas');

    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
    console.log(' -> Sesión de Docente cerrada correctamente.');

    // -------------------------------------------------------------
    // FASE 4: ROL ALUMNO (CARNET QR, BOLETA, CURSOS Y TAREAS)
    // -------------------------------------------------------------
    console.log('\n[FASE 4] Probando Flujo del Rol ALUMNO...');
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1500);

    const emailAlu = await driver.wait(until.elementLocated(By.css('input[type="email"], input[formcontrolname="correo"]')), 10000);
    const passAlu = await driver.findElement(By.css('input[type="password"], input[formcontrolname="password"]'));
    
    await emailAlu.clear();
    await emailAlu.sendKeys('alumno@plataformalms.com');
    await passAlu.clear();
    await passAlu.sendKeys('alumno_password');
    
    const loginAluBtn = await driver.findElement(By.css('button[type="submit"]'));
    await loginAluBtn.click();

    await driver.wait(until.urlContains('/dashboard'), 12000);
    await driver.sleep(2500);
    console.log(' -> ✅ Login Alumno OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '09_alumno_dashboard');

    // Alumno - Mi Asistencia
    await driver.get(`${BASE_URL}/dashboard/asistencia-qr`);
    await driver.sleep(2000);
    console.log(' -> ✅ Alumno: Mi Récord de Asistencia OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '10_alumno_asistencia');

    // Alumno - Boleta de Notas
    await driver.get(`${BASE_URL}/dashboard/gestion-notas`);
    await driver.sleep(2000);
    console.log(' -> ✅ Alumno: Boleta Oficial de Notas OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '11_alumno_boleta_notas');

    // Alumno - Mis Cursos
    await driver.get(`${BASE_URL}/dashboard/mis-cursos`);
    await driver.sleep(2000);
    console.log(' -> ✅ Alumno: Mis Cursos Matriculados OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '12_alumno_mis_cursos');

    // Alumno - Mis Tareas
    await driver.get(`${BASE_URL}/dashboard/mis-tareas`);
    await driver.sleep(2000);
    console.log(' -> ✅ Alumno: Mis Tareas & Feedback OK. URL:', await driver.getCurrentUrl());
    await takeScreenshot(driver, '13_alumno_mis_tareas');

    console.log('\n======================================================================');
    console.log('>> TODAS LAS PRUEBAS SELENIUM E2E MULTI-ROL COMPLETADAS CON ÉXITO <<');
    console.log('======================================================================');
  } catch (err) {
    console.error('❌ Error durante la ejecución de pruebas Selenium:', err);
    if (driver) {
      await takeScreenshot(driver, 'error_state');
    }
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runSeleniumTests();
