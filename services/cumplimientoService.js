const obtenerPesoSesion = (tipo) => {
  switch (tipo) {
    case "Recuperación":
      return 1;

    case "Z2":
      return 2;

    case "Fondo Largo":
      return 4;

    case "Umbral":
      return 5;

    case "VO2":
      return 6;

    default:
      return 1;
  }
};

const calcularCumplimiento = (sesionesPlanificadas, registrosDiarios) => {
  let puntosPlanificados = 0;
  let puntosRealizados = 0;

  sesionesPlanificadas.forEach((sesion) => {
    puntosPlanificados += obtenerPesoSesion(sesion.tipo);
  });

  registrosDiarios.forEach((registro) => {
    if (registro.entrenoRealizado && registro.entrenamientoRealizado) {
      puntosRealizados += obtenerPesoSesion(registro.entrenamientoRealizado);
    }
  });

  const cumplimiento =
    puntosPlanificados > 0
      ? Math.round((puntosRealizados / puntosPlanificados) * 100)
      : 0;

  let estado = "Sin datos";

  if (cumplimiento >= 85) {
    estado = "Excelente";
  } else if (cumplimiento >= 60) {
    estado = "Aceptable";
  } else if (cumplimiento > 0) {
    estado = "Bajo";
  }

  return {
    cumplimiento,
    puntosPlanificados,
    puntosRealizados,
    estado,
  };
};

module.exports = {
  calcularCumplimiento,
};
