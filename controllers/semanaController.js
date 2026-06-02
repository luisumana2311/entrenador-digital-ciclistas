const { generarSemana } = require("../services/generadorSemanaService");

const PerfilAtleta = require("../models/PerfilAtleta");
const Objetivo = require("../models/Objetivo");

const generarSemanaPrueba = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findById(req.params.id);
    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado",
      });
    }

    const objetivo = await Objetivo.findOne({
      atletaId: perfil._id,
    });

    const semana = generarSemana(perfil, objetivo);

    res.json(semana);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  generarSemanaPrueba,
};
