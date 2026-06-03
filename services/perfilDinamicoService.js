const generarPerfilDinamico = (sesionesPlanificadas, registrosDiarios) => {
  const conteoPlanificadas = {};
  const conteoRealizadas = {};

  sesionesPlanificadas.forEach((sesion) => {
    conteoPlanificadas[sesion.tipo] =
      (conteoPlanificadas[sesion.tipo] || 0) + 1;
  });

  registrosDiarios.forEach((registro) => {
    if (registro.entrenoRealizado && registro.entrenamientoRealizado) {
      conteoRealizadas[registro.entrenamientoRealizado] =
        (conteoRealizadas[registro.entrenamientoRealizado] || 0) + 1;
    }
  });

  let sesionMasCumplida = "Sin datos";
  let sesionMenosCumplida = "Sin datos";

  let mejorPorcentaje = -1;
  let peorPorcentaje = 999;

  Object.keys(conteoPlanificadas).forEach((tipo) => {
    const realizadas = conteoRealizadas[tipo] || 0;
    const planificadas = conteoPlanificadas[tipo];

    const porcentaje = (realizadas / planificadas) * 100;

    if (porcentaje > mejorPorcentaje) {
      mejorPorcentaje = porcentaje;
      sesionMasCumplida = tipo;
    }

    if (porcentaje < peorPorcentaje) {
      peorPorcentaje = porcentaje;
      sesionMenosCumplida = tipo;
    }
  });

  let tendencia = "Sin datos";

  const totalPlanificadas = Object.values(conteoPlanificadas).reduce(
    (total, cantidad) => total + cantidad,
    0,
  );

  const totalRealizadas = Object.values(conteoRealizadas).reduce(
    (total, cantidad) => total + cantidad,
    0,
  );

  const cumplimientoGeneral =
    totalPlanificadas > 0
      ? Math.round((totalRealizadas / totalPlanificadas) * 100)
      : 0;

  if (cumplimientoGeneral >= 85) {
    tendencia = "Cumplimiento consistente";
  } else if (cumplimientoGeneral >= 60) {
    tendencia = "Cumplimiento irregular";
  } else {
    tendencia = "Baja adherencia";
  }

  return {
    cumplimientoGeneral,
    sesionMasCumplida,
    sesionMenosCumplida,
    tendencia,
  };
};

module.exports = {
  generarPerfilDinamico,
};
