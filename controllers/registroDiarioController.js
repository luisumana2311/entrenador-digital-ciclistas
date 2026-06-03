const RegistroDiario = require("../models/RegistroDiario");

const crearRegistroDiario = async (req, res) => {
  try {
    const nuevoRegistro = await RegistroDiario.create(req.body);

    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear el registro diario",
      error: error.message,
    });
  }
};

const obtenerRegistrosPorAtleta = async (req, res) => {
  try {
    const registros = await RegistroDiario.find({
      atletaId: req.params.atletaId,
    }).sort({ fecha: -1 });

    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener registros diarios",
      error: error.message,
    });
  }
};

module.exports = {
  crearRegistroDiario,
  obtenerRegistrosPorAtleta,
};
