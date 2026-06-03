const evaluarAdaptacion = (registroDiario, fatigaEstimada) => {
  const { sueno, energia, estres, dolorMuscular } = registroDiario;

  let puntajeRiesgo = 0;
  let motivos = [];

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

module.exports = {
  evaluarAdaptacion,
};
