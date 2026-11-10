const { esIntensidad, tipoCanonico, redondear5 } = require("./sesionesUtil");

const evaluarAdaptacion = (registroDiario, fatigaEstimada) => {
  const { sueno, energia, estres, dolorMuscular } = registroDiario;

  let puntajeRiesgo = 0;
  const motivos = [];

  if (sueno <= 5) {
    puntajeRiesgo += 25;
    motivos.push("Sueño bajo");
  }

  if (energia <= 4) {
    puntajeRiesgo += 25;
    motivos.push("Energía baja");
  }

  if (estres >= 7) {
    puntajeRiesgo += 20;
    motivos.push("Estrés alto");
  }

  if (dolorMuscular >= 7) {
    puntajeRiesgo += 20;
    motivos.push("Dolor muscular alto");
  }

  if (fatigaEstimada >= 80) {
    puntajeRiesgo += 30;
    motivos.push("Fatiga estimada muy alta");
  } else if (fatigaEstimada >= 60) {
    puntajeRiesgo += 15;
    motivos.push("Fatiga estimada alta");
  }

  let accion = "Mantener plan";

  if (puntajeRiesgo >= 80) {
    accion = "Descanso recomendado";
  } else if (puntajeRiesgo >= 50) {
    accion = "Reducir carga";
  } else if (puntajeRiesgo >= 25) {
    accion = "Monitorear";
  }

  return {
    accion,
    puntajeRiesgo,
    motivos,
  };
};

// Quita el bloque Z2 complementario: "VO2 + Z2" vuelve a ser "VO2".
const quitarComplemento = (sesion) => {
  if (!sesion.bloques) {
    return { ...sesion };
  }

  const [bloquePrincipal] = sesion.bloques;

  return {
    dia: sesion.dia,
    tipo: bloquePrincipal.tipo,
    duracion: bloquePrincipal.duracion,
  };
};

const reducirDuracion = (sesion, factor) => ({
  ...sesion,
  duracion: redondear5(sesion.duracion * factor),
});

// Aplica la acción de adaptación al plan.
// - Descanso recomendado: elimina VO2 y Umbral (aunque estén extendidas con Z2)
//   y recorta un 40% el resto.
// - Reducir carga: mantiene las sesiones clave sin complementos y recorta
//   un 25% las sesiones aeróbicas.
const aplicarAdaptacion = (sesiones, accion) => {
  if (accion === "Descanso recomendado") {
    return sesiones
      .filter((sesion) => !esIntensidad(sesion.tipo))
      .map((sesion) => reducirDuracion(sesion, 0.6))
      .filter((sesion) => sesion.duracion > 0);
  }

  if (accion === "Reducir carga") {
    return sesiones
      .map(quitarComplemento)
      .map((sesion) =>
        esIntensidad(sesion.tipo) ? sesion : reducirDuracion(sesion, 0.75),
      )
      .map((sesion) => ({ ...sesion, tipo: tipoCanonico(sesion.tipo) }))
      .filter((sesion) => sesion.duracion > 0);
  }

  return sesiones;
};

module.exports = {
  evaluarAdaptacion,
  aplicarAdaptacion,
};
