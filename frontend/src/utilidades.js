export const DIAS = [
  { clave: "lunes", corto: "Lun", nombre: "Lunes" },
  { clave: "martes", corto: "Mar", nombre: "Martes" },
  { clave: "miercoles", corto: "Mié", nombre: "Miércoles" },
  { clave: "jueves", corto: "Jue", nombre: "Jueves" },
  { clave: "viernes", corto: "Vie", nombre: "Viernes" },
  { clave: "sabado", corto: "Sáb", nombre: "Sábado" },
  { clave: "domingo", corto: "Dom", nombre: "Domingo" },
];

export const DISCIPLINAS = ["MTB Marathon", "XCO", "Ruta", "Gravel", "Indoor", "Mixto"];

export const TIPOS_SESION = ["Recuperación", "Z2", "Fondo Largo", "Umbral", "VO2"];

// Descripción corta de cada tipo de sesión para el atleta.
export const INFO_SESION = {
  Recuperación: { clase: "recuperacion", detalle: "Muy suave, piernas sueltas (Z1)" },
  Z2: { clase: "z2", detalle: "Ritmo aeróbico cómodo, puedes conversar" },
  "Fondo Largo": { clase: "fondo", detalle: "Salida larga y constante en Z2" },
  Umbral: { clase: "umbral", detalle: "Bloques sostenidos a ritmo de umbral (Z4)" },
  VO2: { clase: "vo2", detalle: "Intervalos cortos muy intensos (Z5)" },
};

export const tipoBase = (tipo = "") => tipo.split("+")[0].trim();

export const formatearMinutos = (minutos = 0) => {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

export const formatearFecha = (fecha, opciones = { day: "numeric", month: "short" }) =>
  new Date(fecha).toLocaleDateString("es", opciones);

// Fecha del día de la semana a partir del lunes de inicio.
export const fechaDelDia = (inicioSemana, indice) => {
  const fecha = new Date(inicioSemana);
  fecha.setDate(fecha.getDate() + indice);
  return fecha;
};

export const mismoDia = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

// "2026-11-10" en hora local, para <input type="date">.
export const fechaInput = (fecha = new Date()) => {
  const f = new Date(fecha);
  const pad = (n) => String(n).padStart(2, "0");
  return `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`;
};

export const DISPONIBILIDAD_VACIA = Object.fromEntries(DIAS.map((d) => [d.clave, 0]));
