const calcularSemanasHastaObjetivo = (fechaObjetivo) => {
  const hoy = new Date();
  const objetivo = new Date(fechaObjetivo);

  const diferenciaMs = objetivo - hoy;
  const semanas = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24 * 7));

  return semanas > 0 ? semanas : 0;
};

const calcularVolumenDisponible = (disponibilidad) => {
  const disponibilidadLimpia = disponibilidad.toObject
    ? disponibilidad.toObject()
    : disponibilidad;

  return Object.values(disponibilidadLimpia).reduce(
    (total, horas) => total + horas * 60,
    0,
  );
};

const obtenerFactorDisciplina = (disciplina) => {
  const disciplinaNormalizada = disciplina.toLowerCase();

  if (disciplinaNormalizada.includes("mtb marathon")) return 0.75;
  if (disciplinaNormalizada.includes("mtb")) return 0.7;
  if (disciplinaNormalizada.includes("ruta")) return 0.75;
  if (disciplinaNormalizada.includes("gravel")) return 0.72;
  if (disciplinaNormalizada.includes("rodillo")) return 0.6;

  return 0.65;
};

const obtenerFactorObjetivo = (semanasHastaObjetivo) => {
  if (semanasHastaObjetivo > 16) return 0.65; // base
  if (semanasHastaObjetivo > 8) return 0.75; // construcción
  if (semanasHastaObjetivo > 3) return 0.8; // específico
  return 0.55; // descarga / taper
};

const calcularVolumenObjetivo = (perfil, objetivoPrincipal) => {
  const volumenDisponible = calcularVolumenDisponible(perfil.disponibilidad);

  const semanasHastaObjetivo = calcularSemanasHastaObjetivo(
    objetivoPrincipal.fechaObjetivo,
  );

  const factorDisciplina = obtenerFactorDisciplina(
    objetivoPrincipal.disciplina || perfil.disciplinaPrincipal,
  );

  const factorObjetivo = obtenerFactorObjetivo(semanasHastaObjetivo);

  const volumenObjetivo = Math.round(
    volumenDisponible * factorDisciplina * factorObjetivo,
  );

  return {
    volumenDisponible,
    volumenObjetivo,
    semanasHastaObjetivo,
    factorDisciplina,
    factorObjetivo,
  };
};

module.exports = {
  calcularVolumenDisponible,
  calcularVolumenObjetivo,
};
