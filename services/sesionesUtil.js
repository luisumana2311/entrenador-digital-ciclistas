// "VO2 + Z2" -> "VO2". Las sesiones extendidas conservan su tipo base
// para calcular cumplimiento, fatiga y adaptación.
const tipoBase = (tipo = "") => String(tipo).split("+")[0].trim();

const normalizarTexto = (texto = "") =>
  String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const TIPOS_CANONICOS = ["Recuperación", "Z2", "Fondo Largo", "Umbral", "VO2"];

// Acepta variantes escritas por el atleta ("vo2", "fondo largo", "Recuperacion").
const tipoCanonico = (tipo) => {
  const base = normalizarTexto(tipoBase(tipo));
  return (
    TIPOS_CANONICOS.find((t) => normalizarTexto(t) === base) || tipoBase(tipo)
  );
};

const esIntensidad = (tipo) => ["VO2", "Umbral"].includes(tipoCanonico(tipo));

const redondear5 = (minutos) => Math.max(0, Math.round(minutos / 5) * 5);

module.exports = {
  tipoBase,
  tipoCanonico,
  normalizarTexto,
  esIntensidad,
  redondear5,
  TIPOS_CANONICOS,
};
