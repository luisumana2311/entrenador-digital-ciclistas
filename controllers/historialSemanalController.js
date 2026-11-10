const HistorialSemanal = require("../models/HistorialSemanal");
const { manejarError } = require("../utils/manejarError");
const { elegirCampos } = require("../utils/campos");

const {
  guardarHistorialSemanal,
} = require("../services/historialSemanalService");

const CAMPOS_HISTORIAL = [
  "fechaInicioSemana",
  "objetivoPrincipal",
  "semanaGenerada",
  "adaptacion",
  "fatiga",
  "cumplimiento",
  "perfilDinamico",
  "mensajeEntrenador",
];

const obtenerHistorialPorAtleta = async (req, res) => {
  try {
    const historial = await HistorialSemanal.find({
      atletaId: req.usuario.perfilId,
    }).sort({ fechaInicioSemana: -1 });

    res.json(historial);
  } catch (error) {
    manejarError(res, error, "Error obteniendo historial semanal");
  }
};

const crearHistorialSemanal = async (req, res) => {
  try {
    const historial = await guardarHistorialSemanal({
      ...elegirCampos(req.body, CAMPOS_HISTORIAL),
      atletaId: req.usuario.perfilId,
    });

    res.status(201).json(historial);
  } catch (error) {
    manejarError(res, error, "Error guardando historial semanal");
  }
};

module.exports = {
  obtenerHistorialPorAtleta,
  crearHistorialSemanal,
};
