const { tipoCanonico } = require("./sesionesUtil");

const PESOS_SESION = {
  Recuperación: 1,
  Z2: 2,
  "Fondo Largo": 4,
  Umbral: 5,
  VO2: 6,
};

const obtenerPesoSesion = (tipo) => PESOS_SESION[tipoCanonico(tipo)] || 1;

// Empareja cada entrenamiento realizado con una sesión planificada del mismo
// tipo base. Cada sesión cuenta una sola vez, así el resultado nunca pasa de 100%.
const emparejarSesiones = (sesionesPlanificadas, registros) => {
  const pendientes = sesionesPlanificadas.map((s) => tipoCanonico(s.tipo));
  const realizadas = [];

  registros.forEach((registro) => {
    if (!registro.entrenoRealizado || !registro.entrenamientoRealizado) {
      return;
    }

    const tipo = tipoCanonico(registro.entrenamientoRealizado);
    const indice = pendientes.indexOf(tipo);

    if (indice !== -1) {
      pendientes.splice(indice, 1);
      realizadas.push(tipo);
    }
  });

  return realizadas;
};

// registrosSemana: solo los registros de la semana que se evalúa.
const calcularCumplimiento = (sesionesPlanificadas, registrosSemana) => {
  const puntosPlanificados = sesionesPlanificadas.reduce(
    (total, sesion) => total + obtenerPesoSesion(sesion.tipo),
    0,
  );

  const puntosRealizados = emparejarSesiones(
    sesionesPlanificadas,
    registrosSemana,
  ).reduce((total, tipo) => total + obtenerPesoSesion(tipo), 0);

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
  emparejarSesiones,
  obtenerPesoSesion,
};
