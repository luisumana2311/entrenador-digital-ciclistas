const { generarSemana } = require("../services/generadorSemanaService");
const {
  obtenerObjetivoPrincipal,
} = require("../services/objetivoPrincipalService");

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

    const objetivos = await Objetivo.find({
      atletaId: perfil._id,
    });

    if (objetivos.length === 0) {
      return res.status(404).json({
        mensaje: "El atleta no tiene objetivos registrados",
      });
    }

    const objetivoPrincipal = obtenerObjetivoPrincipal(objetivos);

    if (!objetivoPrincipal) {
      return res.status(404).json({
        mensaje: "No existe un objetivo activo",
      });
    }

    const semana = generarSemana(perfil, objetivoPrincipal);

    res.json({
      objetivoPrincipal,
      semana,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  generarSemanaPrueba,
};
