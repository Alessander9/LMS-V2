const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const FRONTEND_BASE_URL = process.env.QA_FRONTEND_BASE_URL || 'http://localhost:4200';

async function runSeleniumTest() {
  console.log('================================================================');
  console.log('            INSTEIP - INICIANDO TEST CON SELENIUM               ');
  console.log('================================================================');

  let options = new chrome.Options();
  // Opciones del navegador para asegurar compatibilidad y estabilidad local
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-background-networking');
  options.addArguments('--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter');
  options.addArguments('--remote-debugging-port=0');
  options.addArguments('--window-size=1280,800');
  options.addArguments('--headless=new');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // ------------------------------------------------------------------
    // STEP 1: VALIDATE PUBLIC LANDING PAGE
    // ------------------------------------------------------------------
    console.log('\n[1/3] Navegando a la Página de Inicio pública...');
    await driver.get(`${FRONTEND_BASE_URL}/inicio`);

    // Esperar a que el titular principal de la landing se renderice
    await driver.wait(until.elementLocated(By.xpath("//h1")), 10000);
    const mainTitle = await driver.findElement(By.xpath("//h1")).getText();
    console.log(`     Título principal encontrado: "${mainTitle.replace(/\n/g, ' ')}"`);
    console.log('✔ Página de inicio validada correctamente.');

    // ------------------------------------------------------------------
    // STEP 2: VALIDATE PUBLIC COURSE CATALOG
    // ------------------------------------------------------------------
    console.log('\n[2/3] Navegando al Catálogo de Cursos público...');
    await driver.get(`${FRONTEND_BASE_URL}/cursos`);

    // Esperar a que se cargue el catálogo actual
    await driver.wait(until.elementLocated(By.css('.course-grid')), 10000);
    const courseCards = await driver.findElements(By.css('.course-card'));
    console.log(`     Cantidad de cursos visibles en catálogo: ${courseCards.length}`);
    if (courseCards.length === 0) {
      throw new Error('El catálogo de cursos está vacío o no se renderizó ningún curso.');
    }
    console.log('✔ Catálogo de cursos público verificado.');

    // ------------------------------------------------------------------
    // STEP 3: VALIDATE PUBLIC CERTIFICATE VERIFIER
    // ------------------------------------------------------------------
    console.log('\n[3/3] Probando pasarela de validación con código de prueba...');
    // Código semilla cargado por defecto en la base de datos (seed.sql)
    const testCode = 'INS-2026-ABX9F2K8';
    await driver.get(`${FRONTEND_BASE_URL}/certificacion`);

    const input = await driver.wait(until.elementLocated(By.css('input[placeholder="Ej. INST-2026-9842"]')), 10000);
    await input.clear();
    await input.sendKeys(testCode);

    const verifyButton = await driver.findElement(By.xpath("//button[contains(., 'Verificar')]"));
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", verifyButton);
    await driver.wait(until.elementIsVisible(verifyButton), 10000);
    try {
      await verifyButton.click();
    } catch {
      await driver.executeScript("arguments[0].click();", verifyButton);
    }

    // Esperar a que la pasarela devuelva el estado exitoso
    await driver.wait(async () => {
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      return bodyText.includes('VERIFICADO') || bodyText.includes('CERTIFICADO VÁLIDO');
    }, 15000);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    console.log(`     Texto de validación observado: ${bodyText.includes('VERIFICADO') ? 'VERIFICADO' : 'CERTIFICADO VÁLIDO'}`);

    console.log('\n================================================================');
    console.log('       ★ TEST DE SELENIUM COMPLETADO CON ÉXITO: OK ★            ');
    console.log('================================================================');
  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL TEST DE SELENIUM:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

runSeleniumTest();
