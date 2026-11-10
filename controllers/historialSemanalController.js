const HistorialSemanal = require("../models/HistorialSemanal");
const { manejarError } = require("../utils/manejarError");

const {
  guardarHistorialSemanal,
} = require("../services/historialSemanalService");

const obtenerHistorialPorAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const historial = await HistorialSemanal.find({ atletaId }).sort({
      fechaInicioSemana: -1,
    });

    res.json(historial);
  } catch (error) {
    manejarError(res, error, "Error obteniendo historial semanal");
  }
};

const crearHistorialSemanal = async (req, res) => {
  try {
    const historial = await guardarHistorialSemanal(req.body);

    res.status(201).json(historial);
  } catch (error) {
    manejarError(res, error, "Error guardando historial semanal");
  }
};

module.exports = {
  obtenerHistorialPorAtleta,
  crearHistorialSemanal,
};
