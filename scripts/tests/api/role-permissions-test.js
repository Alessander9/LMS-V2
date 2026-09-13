const API_BASE_URL = process.env.QA_API_BASE_URL || 'http://localhost:8081/api';

const accounts = {
  ADMINISTRADOR: { correo: process.env.QA_ADMIN_EMAIL, password: process.env.QA_ADMIN_PASSWORD },
  DOCENTE: { correo: process.env.QA_DOCENTE_EMAIL, password: process.env.QA_DOCENTE_PASSWORD },
  ALUMNO: { correo: process.env.QA_ALUMNO_EMAIL, password: process.env.QA_ALUMNO_PASSWORD }
};

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  return response.status;
}

async function login(account) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account)
  });
  if (!response.ok) throw new Error(`Login fallido: ${account.correo} (${response.status})`);
  const data = await response.json();
  return data.token || data.accessToken;
}

async function run() {
  for (const [role, account] of Object.entries(accounts)) {
    if (!account.correo || !account.password) {
      throw new Error(`Faltan credenciales de QA para ${role}.`);
    }
  }
  const tokens = {};
  for (const [role, account] of Object.entries(accounts)) {
    tokens[role] = await login(account);
    console.log(`PASS login ${role}`);
  }

  const checks = [
    ['ADMINISTRADOR', '/usuarios', 200],
    ['ADMINISTRADOR', '/configuracion', 200],
    ['ADMINISTRADOR', '/sistema/status', 200],
    ['DOCENTE', '/docente/cursos', 200],
    ['DOCENTE', '/usuarios', 403],
    ['DOCENTE', '/configuracion', 403],
    ['DOCENTE', '/sistema/status', 403],
    ['DOCENTE', '/alumno/dashboard', 403],
    ['ALUMNO', '/alumno/dashboard', 200],
    ['ALUMNO', '/alumno/cursos', 200],
    ['ALUMNO', '/usuarios', 403],
    ['ALUMNO', '/configuracion', 403],
    ['ALUMNO', '/sistema/status', 403],
    ['ALUMNO', '/docente/cursos', 403],
    ['ALUMNO', '/cursos', 403]
  ];

  for (const [role, path, expected] of checks) {
    const actual = await request(path, tokens[role]);
    if (actual !== expected) {
      throw new Error(`FAIL ${role} ${path}: esperado ${expected}, recibido ${actual}`);
    }
    console.log(`PASS ${role} ${path}: ${actual}`);
  }

  const noTokenStatus = await request('/usuarios');
  if (![401, 403].includes(noTokenStatus)) {
    throw new Error(`FAIL sin token /usuarios: recibido ${noTokenStatus}`);
  }
  console.log(`PASS sin token /usuarios: ${noTokenStatus}`);
  console.log('ROLE PERMISSIONS TEST PASSED');
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
