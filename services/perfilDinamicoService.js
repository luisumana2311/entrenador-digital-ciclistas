const { tipoCanonico } = require("./sesionesUtil");
const { emparejarSesiones } = require("./cumplimientoService");

// semanas: [{ sesiones, registros }] con los registros de cada semana.
// Compara lo planificado con lo realizado semana a semana.
const generarPerfilDinamico = (semanas) => {
  const conteoPlanificadas = {};
  const conteoRealizadas = {};

  semanas.forEach(({ sesiones = [], registros = [] }) => {
    sesiones.forEach((sesion) => {
      const tipo = tipoCanonico(sesion.tipo);
      conteoPlanificadas[tipo] = (conteoPlanificadas[tipo] || 0) + 1;
    });

    emparejarSesiones(sesiones, registros).forEach((tipo) => {
      conteoRealizadas[tipo] = (conteoRealizadas[tipo] || 0) + 1;
    });
  });

  const totalPlanificadas = Object.values(conteoPlanificadas).reduce(
    (total, cantidad) => total + cantidad,
    0,
  );

  const totalRealizadas = Object.values(conteoRealizadas).reduce(
    (total, cantidad) => total + cantidad,
    0,
  );

  if (totalRealizadas === 0) {
    return {
      cumplimientoGeneral: 0,
      sesionMasCumplida: "Sin datos",
      sesionMenosCumplida: "Sin datos",
      tendencia: "Sin datos",
      semanasAnalizadas: semanas.length,
    };
  }

  let sesionMasCumplida = "Sin datos";
  let sesionMenosCumplida = "Sin datos";
  let mejorPorcentaje = -1;
  let peorPorcentaje = Infinity;

  Object.keys(conteoPlanificadas).forEach((tipo) => {
    const porcentaje =
      ((conteoRealizadas[tipo] || 0) / conteoPlanificadas[tipo]) * 100;

    if (porcentaje > mejorPorcentaje) {
      mejorPorcentaje = porcentaje;
      sesionMasCumplida = tipo;
    }

    if (porcentaje < peorPorcentaje) {
      peorPorcentaje = porcentaje;
      sesionMenosCumplida = tipo;
    }
  });

  // Si todo se cumplió, no hay una sesión que "cueste más".
  if (peorPorcentaje >= 100) {
    sesionMenosCumplida = "Ninguna";
  }

  const cumplimientoGeneral = Math.round(
    (totalRealizadas / totalPlanificadas) * 100,
  );

  let tendencia = "Baja adherencia";

  if (cumplimientoGeneral >= 85) {
    tendencia = "Cumplimiento consistente";
  } else if (cumplimientoGeneral >= 60) {
    tendencia = "Cumplimiento irregular";
  }

  return {
    cumplimientoGeneral,
    sesionMasCumplida,
    sesionMenosCumplida,
    tendencia,
    semanasAnalizadas: semanas.length,
  };
};

module.exports = {
  generarPerfilDinamico,
};
