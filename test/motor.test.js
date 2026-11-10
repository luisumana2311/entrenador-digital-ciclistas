const test = require("node:test");
const assert = require("node:assert/strict");

const { generarSemana } = require("../services/generadorSemanaService");
const { aplicarAdaptacion } = require("../services/adaptacionService");
const { calcularCumplimiento } = require("../services/cumplimientoService");
const { inicioDeSemana } = require("../utils/fechas");

const HOY = new Date(2026, 10, 11, 10, 0); // miércoles 11 nov 2026
const EN_12_SEMANAS = new Date(2027, 1, 3);

const disponibilidad = {
  lunes: 1,
  martes: 2,
  miercoles: 1,
  jueves: 2,
  viernes: 0,
  sabado: 5,
  domingo: 3,
};

const perfilBase = (cambios = {}) => ({
  _id: "atleta1",
  disponibilidad,
  fatiga: 2,
  ...cambios,
});

const objetivo = (disciplina) => ({
  disciplina,
  fechaObjetivo: EN_12_SEMANAS,
});

const registro = (dias, campos) => ({
  fecha: new Date(HOY.getTime() + dias * 86400000),
  sueno: 8,
  energia: 8,
  estres: 2,
  dolorMuscular: 2,
  ...campos,
});

const tipos = (sesiones) => sesiones.map((s) => s.tipo);
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

test("la semana empieza el lunes a las 00:00", () => {
  const inicio = inicioDeSemana(HOY);
  assert.equal(inicio.getDay(), 1);
  assert.equal(inicio.getDate(), 9);
  assert.equal(inicio.getHours(), 0);
});

for (const disciplina of ["MTB Marathon", "mtb marathon", "Ruta", "Gravel", "XCO", "Indoor", "Mixto"]) {
  test(`genera sesiones clave para ${disciplina}`, () => {
    const semana = generarSemana(perfilBase(), objetivo(disciplina), [], { fecha: HOY });
    const base = tipos(semana.sesiones).map((t) => t.split(" + ")[0]);

    assert.ok(base.includes("Fondo Largo"));
    assert.ok(base.includes("VO2"));
    assert.ok(base.includes("Umbral"));
    assert.ok(semana.mision.length > 0);
  });
}

test("VO2 y Umbral no quedan en días consecutivos", () => {
  const semana = generarSemana(perfilBase(), objetivo("Ruta"), [], { fecha: HOY });
  const dia = (tipo) =>
    dias.indexOf(semana.sesiones.find((s) => s.tipo.startsWith(tipo)).dia);

  assert.notEqual(Math.abs(dia("VO2") - dia("Umbral")), 1);
});

test("no hay intensidad el día antes ni el día después del fondo largo", () => {
  for (const disciplina of ["MTB Marathon", "Ruta", "XCO"]) {
    const semana = generarSemana(perfilBase(), objetivo(disciplina), [], { fecha: HOY });
    const fondo = dias.indexOf(semana.sesiones.find((s) => s.tipo === "Fondo Largo").dia);

    semana.sesiones
      .filter((s) => /VO2|Umbral/.test(s.tipo))
      .forEach((s) => assert.notEqual(Math.abs(dias.indexOf(s.dia) - fondo), 1, s.dia));
  }
});

test("la recuperación no se alarga para llenar el día", () => {
  const semana = generarSemana(perfilBase(), objetivo("Ruta"), [], { fecha: HOY });

  semana.sesiones
    .filter((s) => s.tipo === "Recuperación")
    .forEach((s) => assert.ok(s.duracion <= 60));
});

test("no programa sesiones en días sin disponibilidad", () => {
  const semana = generarSemana(perfilBase(), objetivo("Ruta"), [], { fecha: HOY });
  assert.ok(!semana.sesiones.some((s) => s.dia === "viernes"));
});

test("descanso recomendado elimina VO2 y Umbral aunque estén extendidas con Z2", () => {
  const malDia = registro(0, { sueno: 3, energia: 2, estres: 9, dolorMuscular: 9 });
  const semana = generarSemana(perfilBase(), objetivo("MTB Marathon"), [malDia], { fecha: HOY });

  assert.equal(semana.adaptacion.accion, "Descanso recomendado");
  // De hoy (miércoles) en adelante no queda intensidad.
  const restantes = semana.sesiones.filter((s) => dias.indexOf(s.dia) >= 2);
  assert.ok(restantes.length > 0);
  assert.ok(!restantes.some((s) => /VO2|Umbral/.test(s.tipo)));
});

test("la adaptación no borra días pasados ni la sesión que ya se hizo hoy", () => {
  // HOY es miércoles; sesiones fijas en un horario sin días libres alrededor.
  const perfil = perfilBase({
    disponibilidad: { lunes: 0, martes: 0, miercoles: 2, jueves: 0, viernes: 2, sabado: 5, domingo: 0 },
  });
  const plan = generarSemana(perfil, objetivo("Ruta"), [], { fecha: HOY });
  const sesionHoy = plan.sesiones.find((s) => s.dia === "miercoles");
  assert.ok(sesionHoy, "debe haber sesión el miércoles");

  const malDiaEntrenado = registro(0, {
    sueno: 3, energia: 2, estres: 9, dolorMuscular: 9,
    entrenoRealizado: true,
    entrenamientoRealizado: sesionHoy.tipo,
  });

  const semana = generarSemana(perfil, objetivo("Ruta"), [malDiaEntrenado], { fecha: HOY });

  assert.equal(semana.adaptacion.accion, "Descanso recomendado");
  assert.deepEqual(semana.sesiones.find((s) => s.dia === "miercoles"), sesionHoy);
  // Lo único que ya tocaba (miércoles) se hizo: 100%, sin contar viernes ni sábado.
  assert.equal(semana.cumplimiento.cumplimiento, 100);
  assert.ok(!semana.mensajeEntrenador.includes("adherencia"));
});

test("reducir carga quita los complementos Z2 y recorta el volumen", () => {
  const sesiones = [
    { dia: "martes", tipo: "VO2 + Z2", duracion: 120, bloques: [{ tipo: "VO2", duracion: 90 }, { tipo: "Z2 Complementario", duracion: 30 }] },
    { dia: "sabado", tipo: "Fondo Largo", duracion: 300 },
  ];

  const resultado = aplicarAdaptacion(sesiones, "Reducir carga");

  assert.deepEqual(tipos(resultado), ["VO2", "Fondo Largo"]);
  assert.equal(resultado[0].duracion, 90);
  assert.equal(resultado[1].duracion, 225);
});

test("fatiga alta no agrega Z2 ni extiende sesiones", () => {
  const semana = generarSemana(perfilBase({ fatiga: 8 }), objetivo("Ruta"), [], { fecha: HOY });

  assert.ok(!semana.sesiones.some((s) => s.tipo.includes("Z2")));
});

test("fatiga moderada agrega Z2 de máximo 60 minutos sin extender", () => {
  const semana = generarSemana(perfilBase({ fatiga: 5 }), objetivo("Ruta"), [], { fecha: HOY });

  assert.ok(!semana.sesiones.some((s) => s.tipo.includes("+")));
  semana.sesiones
    .filter((s) => s.tipo === "Z2")
    .forEach((s) => assert.ok(s.duracion <= 60));
});

test("el cumplimiento reconoce VO2 frente a 'VO2 + Z2' y nunca pasa de 100%", () => {
  const plan = [
    { tipo: "VO2 + Z2" },
    { tipo: "Fondo Largo" },
  ];
  const registros = [
    { entrenoRealizado: true, entrenamientoRealizado: "vo2" },
    { entrenoRealizado: true, entrenamientoRealizado: "VO2" },
    { entrenoRealizado: true, entrenamientoRealizado: "Fondo Largo" },
    { entrenoRealizado: true, entrenamientoRealizado: "Fondo Largo" },
  ];

  const resultado = calcularCumplimiento(plan, registros);

  assert.equal(resultado.cumplimiento, 100);
  assert.equal(resultado.estado, "Excelente");
});

test("el cumplimiento solo cuenta registros de la semana actual", () => {
  const semanaPasada = registro(-7, { entrenoRealizado: true, entrenamientoRealizado: "Fondo Largo" });
  const semana = generarSemana(perfilBase(), objetivo("Ruta"), [semanaPasada], { fecha: HOY });

  assert.equal(semana.cumplimiento.puntosRealizados, 0);
  assert.equal(semana.cumplimiento.estado, "Sin datos");
});

test("sin registros, el mensaje no regaña por adherencia ni el perfil dice baja adherencia", () => {
  const semana = generarSemana(perfilBase(), objetivo("Ruta"), [], { fecha: HOY });

  assert.ok(!semana.mensajeEntrenador.includes("adherencia"));
  assert.equal(semana.perfilDinamico.tendencia, "Sin datos");
});

test("el fondo largo se acorta en la puesta a punto", () => {
  const enDosSemanas = { disciplina: "MTB Marathon", fechaObjetivo: new Date(2026, 10, 22) };
  const semana = generarSemana(perfilBase({ fatiga: 8 }), enDosSemanas, [], { fecha: HOY });
  const fondo = semana.sesiones.find((s) => s.tipo === "Fondo Largo");

  assert.equal(semana.fase, "Puesta a punto");
  assert.ok(fondo.duracion < 270);
});
