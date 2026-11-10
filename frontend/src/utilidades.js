import { Bike, Coffee, Flame, Moon, Route, Zap } from "lucide-react";

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

export const FASES = ["Base", "Construcción", "Especialización", "Puesta a punto"];

// Qué es cada sesión, en qué zona va y cómo se hace.
// rango = % del FTP para calcular los vatios objetivo.
export const INFO_SESION = {
  Recuperación: {
    clase: "zona-recuperacion",
    Icono: Coffee,
    zona: "Z1",
    rango: [40, 55],
    resumen: "Muy suave, solo soltar piernas",
    estructura: "Rueda suave todo el tiempo, cadencia alta (90+ rpm). Si sientes que trabajas, vas muy fuerte.",
  },
  Z2: {
    clase: "zona-z2",
    Icono: Bike,
    zona: "Z2",
    rango: [56, 75],
    resumen: "Aeróbico cómodo, puedes conversar",
    estructura: "Ritmo constante en Z2. Respiración controlada; deberías poder hablar en frases completas.",
  },
  "Fondo Largo": {
    clase: "zona-fondo",
    Icono: Route,
    zona: "Z2",
    rango: [56, 75],
    resumen: "Salida larga y constante",
    estructura: "Mantén Z2 todo el recorrido, sin picos en las subidas. Come y bebe cada 30–45 minutos.",
  },
  Umbral: {
    clase: "zona-umbral",
    Icono: Flame,
    zona: "Z4",
    rango: [91, 105],
    resumen: "Bloques sostenidos y exigentes",
    estructura: "15 min de calentamiento · 3 × 12 min en umbral con 5 min suaves entre bloques · vuelta a la calma.",
  },
  VO2: {
    clase: "zona-vo2",
    Icono: Zap,
    zona: "Z5",
    rango: [106, 120],
    resumen: "Intervalos cortos, máxima intensidad",
    estructura: "15 min de calentamiento · 5 × 4 min muy fuerte con 4 min suaves entre series · vuelta a la calma.",
  },
};

export const INFO_DESCANSO = {
  clase: "zona-descanso",
  Icono: Moon,
  resumen: "Día libre: recuperar también es entrenar",
};

// Zonas de potencia para mostrar en el perfil (% del FTP).
export const ZONAS_FTP = [
  { zona: "Z1", nombre: "Recuperación", rango: [0, 55], clase: "zona-recuperacion" },
  { zona: "Z2", nombre: "Resistencia", rango: [56, 75], clase: "zona-z2" },
  { zona: "Z3", nombre: "Tempo", rango: [76, 90], clase: "zona-fondo" },
  { zona: "Z4", nombre: "Umbral", rango: [91, 105], clase: "zona-umbral" },
  { zona: "Z5", nombre: "VO2 máx", rango: [106, 120], clase: "zona-vo2" },
];

export const tipoBase = (tipo = "") => tipo.split("+")[0].trim();

export const infoSesion = (tipo) => INFO_SESION[tipoBase(tipo)] || INFO_SESION.Z2;

export const vatios = (ftp, [min, max]) =>
  ftp ? `${Math.round((ftp * min) / 100)}–${Math.round((ftp * max) / 100)} W` : null;

export const formatearMinutos = (minutos = 0) => {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
};

export const horas = (minutos = 0) => {
  const h = minutos / 60;
  return Number.isInteger(h) ? `${h}` : h.toFixed(1);
};

export const formatearFecha = (fecha, opciones = { day: "numeric", month: "short" }) =>
  new Date(fecha).toLocaleDateString("es", opciones);

export const fechaDelDia = (inicioSemana, indice) => {
  const fecha = new Date(inicioSemana);
  fecha.setDate(fecha.getDate() + indice);
  return fecha;
};

export const mismoDia = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

export const diasHasta = (fecha) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const destino = new Date(fecha);
  destino.setHours(0, 0, 0, 0);
  return Math.round((destino - hoy) / 86400000);
};

// "2026-11-10" en hora local, para <input type="date">.
export const fechaInput = (fecha = new Date()) => {
  const f = new Date(fecha);
  const pad = (n) => String(n).padStart(2, "0");
  return `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`;
};

export const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("") || "?";

export const DISPONIBILIDAD_VACIA = Object.fromEntries(DIAS.map((d) => [d.clave, 0]));
