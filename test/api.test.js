// Pruebas de la API contra un MongoDB real.
// Se ejecutan solo si MONGO_URI_TEST está definida; la base se borra al terminar.
// Ejemplo: MONGO_URI_TEST=mongodb://127.0.0.1:27017/entrenador-test npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const MONGO_URI_TEST = process.env.MONGO_URI_TEST;

test("API", { skip: !MONGO_URI_TEST && "MONGO_URI_TEST no definida" }, async (t) => {
  process.env.JWT_SECRET = "secreto-de-pruebas";

  const { crearApp } = require("../app");

  await mongoose.connect(MONGO_URI_TEST);
  await mongoose.connection.dropDatabase();
  await mongoose.connection.syncIndexes();

  const servidor = crearApp().listen(0);
  const base = `http://127.0.0.1:${servidor.address().port}/api`;

  t.after(async () => {
    servidor.close();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  const api = async (metodo, ruta, { token, body } = {}) => {
    const respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return { status: respuesta.status, datos: await respuesta.json() };
  };

  const registrar = (email) =>
    api("POST", "/auth/registro", {
      body: {
        email,
        password: "clave-segura-123",
        nombre: email.split("@")[0],
        disponibilidad: { martes: 2, jueves: 2, sabado: 5, domingo: 3 },
      },
    });

  const ana = await registrar("Ana@Ejemplo.com");
  const beto = await registrar("beto@ejemplo.com");

  await t.test("registro devuelve token y crea el perfil", () => {
    assert.equal(ana.status, 201);
    assert.ok(ana.datos.token);
    assert.equal(ana.datos.usuario.email, "ana@ejemplo.com");
    assert.equal(ana.datos.perfil.nombre, "Ana");
  });

  await t.test("registro rechaza email repetido, inválido y contraseña corta", async () => {
    assert.equal((await registrar("ana@ejemplo.com")).status, 409);
    assert.equal(
      (await api("POST", "/auth/registro", { body: { email: "no-es-email", password: "clave-segura-123" } })).status,
      400,
    );
    assert.equal(
      (await api("POST", "/auth/registro", { body: { email: "c@ejemplo.com", password: "corta" } })).status,
      400,
    );
  });

  await t.test("la respuesta nunca incluye el hash de la contraseña", async () => {
    const login = await api("POST", "/auth/login", {
      body: { email: "ana@ejemplo.com", password: "clave-segura-123" },
    });
    assert.ok(!JSON.stringify(login.datos).includes("passwordHash"));
    assert.ok(!JSON.stringify(ana.datos).includes("passwordHash"));
  });

  await t.test("login con credenciales correctas e incorrectas", async () => {
    const ok = await api("POST", "/auth/login", {
      body: { email: "ANA@ejemplo.com", password: "clave-segura-123" },
    });
    const mala = await api("POST", "/auth/login", {
      body: { email: "ana@ejemplo.com", password: "otra-clave-123" },
    });
    const noExiste = await api("POST", "/auth/login", {
      body: { email: "nadie@ejemplo.com", password: "clave-segura-123" },
    });

    assert.equal(ok.status, 200);
    assert.ok(ok.datos.token);
    assert.equal(mala.status, 401);
    assert.equal(noExiste.status, 401);
    assert.equal(mala.datos.mensaje, noExiste.datos.mensaje);
  });

  await t.test("las rutas protegidas exigen un token válido", async () => {
    assert.equal((await api("GET", "/perfiles/yo")).status, 401);
    assert.equal((await api("GET", "/perfiles/yo", { token: "basura" })).status, 401);
    assert.equal((await api("GET", "/perfiles/yo", { token: ana.datos.token })).status, 200);
    assert.equal((await api("GET", "/auth/yo", { token: ana.datos.token })).datos.usuario.email, "ana@ejemplo.com");
  });

  await t.test("un atleta no puede ver ni modificar los datos de otro", async () => {
    const idBeto = beto.datos.perfil._id;
    const token = ana.datos.token;

    assert.equal((await api("GET", `/perfiles/${idBeto}`, { token })).status, 403);
    assert.equal((await api("PATCH", `/perfiles/${idBeto}`, { token, body: { nombre: "X" } })).status, 403);
    assert.equal((await api("DELETE", `/perfiles/${idBeto}`, { token })).status, 403);
    assert.equal((await api("GET", `/semanas/atleta/${idBeto}`, { token })).status, 403);
    assert.equal((await api("GET", `/historial/${idBeto}`, { token })).status, 403);
    assert.equal((await api("GET", `/registros-diarios/atleta/${idBeto}`, { token })).status, 403);

    const objetivoBeto = await api("POST", "/objetivos", {
      token: beto.datos.token,
      body: { nombre: "Gran Fondo", disciplina: "Ruta", fechaObjetivo: "2027-06-01" },
    });

    const idObjetivo = objetivoBeto.datos._id;
    assert.equal((await api("PATCH", `/objetivos/${idObjetivo}`, { token, body: { nombre: "Mío" } })).status, 404);
    assert.equal((await api("DELETE", `/objetivos/${idObjetivo}`, { token })).status, 404);
    assert.equal((await api("GET", "/objetivos", { token })).datos.length, 0);
  });

  await t.test("el atletaId del body se ignora: todo se crea en el perfil propio", async () => {
    const objetivo = await api("POST", "/objetivos", {
      token: ana.datos.token,
      body: {
        atletaId: beto.datos.perfil._id,
        nombre: "Vuelta",
        disciplina: "MTB Marathon",
        fechaObjetivo: "2027-03-01",
        prioridad: "Alta",
      },
    });

    assert.equal(objetivo.status, 201);
    assert.equal(objetivo.datos.atletaId, ana.datos.perfil._id);
  });

  await t.test("no se pueden cambiar campos fuera de la lista permitida", async () => {
    const respuesta = await api("PATCH", "/perfiles/yo", {
      token: ana.datos.token,
      body: { ftp: 250, _id: beto.datos.perfil._id, createdAt: "2000-01-01" },
    });

    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.datos.ftp, 250);
    assert.equal(respuesta.datos._id, ana.datos.perfil._id);
    assert.notEqual(respuesta.datos.createdAt.slice(0, 4), "2000");
  });

  await t.test("registro diario actualiza la fatiga y la semana se genera sin duplicar historial", async () => {
    const token = ana.datos.token;

    const registro = await api("POST", "/registros-diarios", {
      token,
      body: { sueno: 3, energia: 2, estres: 9, dolorMuscular: 9 },
    });
    assert.equal(registro.status, 201);

    const perfil = await api("GET", "/perfiles/yo", { token });
    assert.equal(perfil.datos.fatiga, 9);

    const semana = await api("GET", "/semanas/actual", { token });
    await api("GET", `/semanas/atleta/${ana.datos.perfil._id}`, { token });

    assert.equal(semana.status, 200);
    assert.equal(semana.datos.semana.adaptacion.accion, "Descanso recomendado");
    assert.ok(!semana.datos.semana.sesiones.some((s) => /VO2|Umbral/.test(s.tipo)));
    assert.equal((await api("GET", "/historial", { token })).datos.length, 1);
  });

  await t.test("JSON mal formado y rutas inexistentes", async () => {
    const respuesta = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ esto no es json",
    });

    assert.equal(respuesta.status, 400);
    assert.equal((await api("GET", "/no-existe", { token: ana.datos.token })).status, 404);
  });

  await t.test("borrar la cuenta elimina todo y el token deja de servir", async () => {
    const token = ana.datos.token;

    assert.equal((await api("DELETE", "/perfiles/yo", { token })).status, 200);
    assert.equal((await api("GET", "/perfiles/yo", { token })).status, 401);
    assert.equal(
      (await api("POST", "/auth/login", { body: { email: "ana@ejemplo.com", password: "clave-segura-123" } })).status,
      401,
    );
    assert.equal((await api("GET", "/perfiles/yo", { token: beto.datos.token })).status, 200);
  });
});
