const { normalizarTexto } = require("./sesionesUtil");
const { MS_DIA } = require("../utils/fechas");

const calcularSemanasHastaObjetivo = (fechaObjetivo, hoy = new Date()) => {
  const diferenciaMs = new Date(fechaObjetivo) - hoy;
  const semanas = Math.ceil(diferenciaMs / (MS_DIA * 7));

  return semanas > 0 ? semanas : 0;
};

const calcularVolumenDisponible = (disponibilidad = {}) => {
  const disponibilidadLimpia = disponibilidad.toObject
    ? disponibilidad.toObject()
    : disponibilidad;

  return Object.values(disponibilidadLimpia).reduce(
    (total, horas) => total + (Number(horas) || 0) * 60,
    0,
  );
};

const obtenerFactorDisciplina = (disciplina) => {
  const d = normalizarTexto(disciplina);

  if (d.includes("mtb marathon")) return 0.75;
  if (d.includes("xco") || d.includes("mtb")) return 0.7;
  if (d.includes("ruta")) return 0.75;
  if (d.includes("gravel")) return 0.72;
  if (d.includes("rodillo") || d.includes("indoor")) return 0.6;

  return 0.65;
};

// Una sola definición de fases para misión, volumen y fondo largo.
const obtenerFase = (semanasHastaObjetivo) => {
  if (semanasHastaObjetivo > 16) {
    return {
      fase: "Base",
      mision: "Construir base aeróbica",
      factorObjetivo: 0.65,
      factorFondo: 0.85,
    };
  }

  if (semanasHastaObjetivo > 8) {
    return {
      fase: "Construcción",
      mision: "Desarrollar resistencia específica",
      factorObjetivo: 0.75,
      factorFondo: 1,
    };
  }

  if (semanasHastaObjetivo > 3) {
    return {
      fase: "Especialización",
      mision: "Preparación específica para competencia",
      factorObjetivo: 0.8,
      factorFondo: 1,
    };
  }

  return {
    fase: "Puesta a punto",
    mision: "Afinar rendimiento para competencia",
    factorObjetivo: 0.55,
    factorFondo: 0.6,
  };
};

const calcularVolumenObjetivo = (
  perfil,
  objetivoPrincipal,
  hoy = new Date(),
) => {
  const volumenDisponible = calcularVolumenDisponible(perfil.disponibilidad);

  const semanasHastaObjetivo = calcularSemanasHastaObjetivo(
    objetivoPrincipal.fechaObjetivo,
    hoy,
  );

  const factorDisciplina = obtenerFactorDisciplina(
    objetivoPrincipal.disciplina || perfil.disciplinaPrincipal,
  );

  const fase = obtenerFase(semanasHastaObjetivo);

  const volumenObjetivo = Math.round(
    volumenDisponible * factorDisciplina * fase.factorObjetivo,
  );

  return {
    volumenDisponible,
    volumenObjetivo,
    semanasHastaObjetivo,
    factorDisciplina,
    factorObjetivo: fase.factorObjetivo,
    fase,
  };
};

module.exports = {
  calcularSemanasHastaObjetivo,
  calcularVolumenDisponible,
  calcularVolumenObjetivo,
  obtenerFactorDisciplina,
  obtenerFase,
};
