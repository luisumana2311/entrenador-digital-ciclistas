const Objetivo = require("../models/Objetivo");

const crearObjetivo = async (req, res) => {
  try {
    const objetivo = new Objetivo(req.body);

    await objetivo.save();

    res.status(201).json(objetivo);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerObjetivos = async (req, res) => {
  try {
    const objetivos = await Objetivo.find();

    res.json(objetivos);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};
module.exports = {
  crearObjetivo,
  obtenerObjetivos,
};
