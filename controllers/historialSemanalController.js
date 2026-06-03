const HistorialSemanal = require("../models/HistorialSemanal");

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
    res.status(500).json({
      mensaje: "Error obteniendo historial semanal",
      error: error.message,
    });
  }
};

const crearHistorialSemanal = async (req, res) => {
  try {
    const historial = await guardarHistorialSemanal(req.body);

    res.status(201).json(historial);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error guardando historial semanal",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerHistorialPorAtleta,
  crearHistorialSemanal,
};
