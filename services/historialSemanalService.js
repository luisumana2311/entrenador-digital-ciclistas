const HistorialSemanal = require("../models/HistorialSemanal");

const guardarHistorialSemanal = async ({
  atletaId,
  fechaInicioSemana,
  objetivoPrincipal,
  semanaGenerada,
  adaptacion,
  fatiga,
  cumplimiento,
  perfilDinamico,
  mensajeEntrenador,
}) => {
  const historial = new HistorialSemanal({
    atletaId,
    fechaInicioSemana,
    objetivoPrincipal,
    semanaGenerada,
    adaptacion,
    fatiga,
    cumplimiento,
    perfilDinamico,
    mensajeEntrenador,
  });

  await historial.save();

  return historial;
};

const obtenerHistorialPorAtleta = async (atletaId) => {
  const historial = await HistorialSemanal.find({ atletaId }).sort({
    fechaInicioSemana: -1,
  });

  return historial;
};

const obtenerUltimaSemana = async (atletaId) => {
  const ultimaSemana = await HistorialSemanal.findOne({ atletaId }).sort({
    fechaInicioSemana: -1,
  });

  return ultimaSemana;
};

module.exports = {
  guardarHistorialSemanal,
  obtenerHistorialPorAtleta,
  obtenerUltimaSemana,
};
