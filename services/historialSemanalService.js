const HistorialSemanal = require("../models/HistorialSemanal");
const { inicioDeSemana } = require("../utils/fechas");

// Guarda o reemplaza la semana del atleta. Generar la misma semana varias
// veces actualiza el mismo documento en vez de crear duplicados.
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
  const inicio = inicioDeSemana(fechaInicioSemana || new Date());

  return HistorialSemanal.findOneAndUpdate(
    { atletaId, fechaInicioSemana: inicio },
    {
      atletaId,
      fechaInicioSemana: inicio,
      objetivoPrincipal,
      semanaGenerada,
      adaptacion,
      fatiga,
      cumplimiento,
      perfilDinamico,
      mensajeEntrenador,
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

const obtenerHistorialPorAtleta = async (atletaId) => {
  return HistorialSemanal.find({ atletaId }).sort({ fechaInicioSemana: -1 });
};

// Semanas anteriores a la indicada, de la más reciente a la más antigua.
const obtenerSemanasPrevias = async (atletaId, antesDe, limite = 3) => {
  return HistorialSemanal.find({
    atletaId,
    fechaInicioSemana: { $lt: inicioDeSemana(antesDe) },
  })
    .sort({ fechaInicioSemana: -1 })
    .limit(limite);
};

module.exports = {
  guardarHistorialSemanal,
  obtenerHistorialPorAtleta,
  obtenerSemanasPrevias,
};
