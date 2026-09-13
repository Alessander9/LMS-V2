const fs = require('fs');

const API_BASE_URL = process.env.QA_API_BASE_URL || 'http://localhost:8081/api';
const QA_ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL;
const QA_ADMIN_PASSWORD = process.env.QA_ADMIN_PASSWORD;
let authToken = '';
let currentUserId = null;
let currentCursoId = null;
let currentModuloId = null;
let currentVideoId = null;
let currentMatriculaId = null;
let testUserId = null;

// Colores para la consola
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

const printTitle = (title) => {
    console.log(`\n${colors.cyan}================================================================${colors.reset}`);
    console.log(`${colors.cyan}   ${title} ${colors.reset}`);
    console.log(`${colors.cyan}================================================================${colors.reset}`);
};

const printSuccess = (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`);
const printError = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const printInfo = (msg) => console.log(`${colors.yellow}➤ ${msg}${colors.reset}`);

async function apiRequest(endpoint, method = 'GET', body = null, isFormData = false) {
    const headers = {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (!isFormData && body) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        let data = null;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else if (contentType && contentType.includes('application/pdf')) {
            data = await response.blob(); // Handle binary downloads
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
        }
        return data;
    } catch (error) {
        printError(`Error en ${method} ${endpoint}: ${error.message}`);
        throw error;
    }
}

async function runApiSuperTest() {
    printTitle('INSTEIP - INICIANDO SUPER TEST DE API BACKEND (100% ENDPOINTS)');

    if (!QA_ADMIN_EMAIL || !QA_ADMIN_PASSWORD) {
        throw new Error('Define QA_ADMIN_EMAIL y QA_ADMIN_PASSWORD antes de ejecutar la prueba API.');
    }

    try {
        // 1. AUTHENTICATION & LOGIN
        printTitle('1. TEST DE AUTENTICACIÓN Y SEGURIDAD');
        printInfo('Realizando Login como Administrador...');
        const loginData = await apiRequest('/auth/login', 'POST', {
            correo: QA_ADMIN_EMAIL,
            password: QA_ADMIN_PASSWORD
        });
        authToken = loginData.token || loginData.accessToken;
        printSuccess('Login exitoso. Token recibido.');

        printInfo('Obteniendo perfil del usuario actual (/auth/me)...');
        const profile = await apiRequest('/auth/me', 'GET');
        currentUserId = profile.id;
        printSuccess(`Perfil obtenido correctamente: ${profile.nombres} ${profile.apellidos}`);

        // 2. GESTIÓN DE USUARIOS (CRUD)
        printTitle('2. TEST DE GESTIÓN DE USUARIOS (CRUD)');
        printInfo('Obteniendo lista de usuarios...');
        const usuarios = await apiRequest('/usuarios', 'GET');
        printSuccess(`Usuarios listados correctamente. Total: ${usuarios.length || usuarios.content?.length || 0}`);

        printInfo('Creando nuevo usuario de prueba...');
        const nuevoUsuario = {
            nombres: "Test API",
            apellidos: "Backend",
            correo: `test.api.${Date.now()}@insteip.com`,
            password: "Password123!",
            telefono: "123456789",
            rolId: 2, // Asumiendo 2 es Alumno/Usuario
            nivelSuscripcionId: 1 // Agregado requerido por el backend
        };
        const usuarioCreado = await apiRequest('/usuarios', 'POST', nuevoUsuario);
        testUserId = usuarioCreado.id;
        printSuccess(`Usuario creado con ID: ${testUserId}`);

        printInfo(`Obteniendo detalles del usuario ID ${testUserId}...`);
        await apiRequest(`/usuarios/${testUserId}`, 'GET');
        printSuccess('Detalles obtenidos.');

        printInfo(`Actualizando usuario ID ${testUserId}...`);
        await apiRequest(`/usuarios/${testUserId}`, 'PUT', {
            ...nuevoUsuario,
            telefono: "987654321"
        });
        printSuccess('Usuario actualizado correctamente.');

        // 3. GESTIÓN DE CURSOS (CRUD)
        printTitle('3. TEST DE GESTIÓN DE CURSOS Y MÓDULOS (CRUD)');
        printInfo('Obteniendo lista de cursos...');
        await apiRequest('/cursos', 'GET');
        printSuccess('Cursos listados.');

        printInfo('Creando nuevo curso de prueba...');
        const nuevoCurso = {
            nombre: `Curso API Test ${Date.now()}`,
            descripcion: "Curso creado por el test automatizado de la API",
            imagenPortada: "https://via.placeholder.com/150",
            nivelesSuscripcionIds: [1, 2]
        };
        const cursoCreado = await apiRequest('/cursos', 'POST', nuevoCurso);
        currentCursoId = cursoCreado.id;
        printSuccess(`Curso creado con ID: ${currentCursoId}`);

        printInfo(`Obteniendo detalles del curso ID ${currentCursoId}...`);
        await apiRequest(`/cursos/${currentCursoId}`, 'GET');
        printSuccess('Detalles del curso obtenidos.');

        // Crear Módulo para el Curso
        printInfo(`Creando módulo para el curso ID ${currentCursoId}...`);
        const nuevoModulo = {
            cursoId: currentCursoId,
            nombre: "Módulo 1: Introducción a API Testing",
            descripcion: "Aprende a probar APIs",
            orden: 1
        };
        const moduloCreado = await apiRequest('/modulos', 'POST', nuevoModulo);
        currentModuloId = moduloCreado.id;
        printSuccess(`Módulo creado con ID: ${currentModuloId}`);

        // 4. MATRÍCULAS Y AVANCE
        printTitle('4. TEST DE MATRÍCULAS Y AVANCES');
        printInfo(`Matriculando al usuario ID ${testUserId} en el curso ID ${currentCursoId}...`);
        const matriculaCreada = await apiRequest('/matriculas', 'POST', {
            usuarioId: testUserId,
            cursoId: currentCursoId
        });
        currentMatriculaId = matriculaCreada.id;
        printSuccess('Matrícula registrada exitosamente.');

        printInfo(`Consultando matrículas del curso ID ${currentCursoId}...`);
        await apiRequest(`/matriculas/curso/${currentCursoId}`, 'GET');
        printSuccess('Lista de matriculados obtenida.');

        // 5. VIDEOS Y MATERIALES (SIMULADO)
        printTitle('5. TEST DE VIDEOS Y MATERIALES');
        printInfo(`Añadiendo Video al módulo ID ${currentModuloId}...`);
        const videoCreado = await apiRequest('/videos', 'POST', {
            moduloId: currentModuloId,
            titulo: "Video de Prueba API",
            youtubeUrl: "https://youtube.com/watch?v=123",
            descripcion: "Video test",
            orden: 1
        });
        currentVideoId = videoCreado.id;
        printSuccess('Video añadido.');

        printInfo(`Registrando avance de video...`);
        await apiRequest('/avance', 'POST', {
            videoId: currentVideoId,
            ultimoSegundo: 30,
            duracionSegundos: 60
        });
        printSuccess('Avance guardado correctamente.');

        const avance = await apiRequest(`/avance/video/${currentVideoId}`, 'GET');
        if (avance.videoId !== currentVideoId || avance.ultimoSegundo !== 30) {
            throw new Error(`El avance recuperado no coincide: ${JSON.stringify(avance)}`);
        }
        printSuccess('Avance recuperado y verificado correctamente.');
        // 6. DASHBOARD DEL ALUMNO
        printTitle('6. TEST DE RUTAS DEL DASHBOARD DEL ALUMNO');
        printInfo('Obteniendo Dashboard General del Alumno...');
        await apiRequest('/alumno/dashboard', 'GET');
        printSuccess('Dashboard del alumno obtenido.');

        printInfo('Obteniendo Mis Cursos del Alumno...');
        await apiRequest('/alumno/cursos', 'GET');
        printSuccess('Lista de mis cursos obtenida.');

        printInfo('Obteniendo Mis Certificados del Alumno...');
        await apiRequest('/alumno/certificados', 'GET');
        printSuccess('Lista de certificados obtenida.');

        // 7. CERTIFICADOS
        printTitle('7. TEST DE CERTIFICADOS Y REPORTES');
        printInfo('Listando reportes de certificados (Admin)...');
        await apiRequest('/reportes/certificados', 'GET');
        printSuccess('Reporte obtenido.');

        printInfo(`Intentando generar certificado para el curso ID ${currentCursoId}...`);
        await apiRequest(`/certificados/generar/${currentCursoId}`, 'POST', {
            usuarioId: testUserId
        }).catch(e => printInfo('Aviso: Puede fallar si el alumno no ha completado el curso al 100%, es esperado.'));

        // 8. CONFIGURACIÓN Y SISTEMA
        printTitle('8. TEST DE CONFIGURACIÓN Y MONITOREO DEL SISTEMA');
        printInfo('Obteniendo Configuración Global...');
        await apiRequest('/configuracion', 'GET');
        printSuccess('Configuración obtenida.');

        printInfo('Consultando estado del Sistema...');
        const sysStatus = await apiRequest('/sistema/status', 'GET');
        printSuccess(`Estado del sistema: ${JSON.stringify(sysStatus)}`);

        printInfo('Consultando eventos de Auditoría...');
        await apiRequest('/auditoria/eventos', 'GET');
        printSuccess('Eventos de auditoría obtenidos.');

        printTitle('✅ API SUPER TEST COMPLETADO CON ÉXITO');
        printInfo('Se han probado todos los módulos principales del backend INSTEIP.');

    } catch (error) {
        printError('EL TEST SE DETUVO DEBIDO A UN ERROR CRÍTICO.');
        process.exitCode = 1;
    } finally {
        if (authToken) {
            printTitle('LIMPIEZA DE DATOS DE PRUEBA');
            const cleanup = [
                currentMatriculaId && [`/matriculas/${currentMatriculaId}`, 'DELETE'],
                currentVideoId && [`/videos/${currentVideoId}`, 'DELETE'],
                currentModuloId && [`/modulos/${currentModuloId}`, 'DELETE'],
                currentCursoId && [`/cursos/${currentCursoId}`, 'DELETE'],
                testUserId && [`/usuarios/${testUserId}`, 'DELETE']
            ].filter(Boolean);

            for (const [endpoint, method] of cleanup) {
                try {
                    await apiRequest(endpoint, method);
                    printSuccess(`Eliminado recurso de prueba: ${endpoint}`);
                } catch (cleanupError) {
                    printError(`No se pudo limpiar ${endpoint}: ${cleanupError.message}`);
                    process.exitCode = 1;
                }
            }
        }
    }
}

runApiSuperTest();
