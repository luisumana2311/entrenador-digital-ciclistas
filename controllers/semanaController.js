const { generarSemana } = require("../services/generadorSemanaService");

const {
  obtenerObjetivoPrincipal,
} = require("../services/objetivoPrincipalService");

const PerfilAtleta = require("../models/PerfilAtleta");

const Objetivo = require("../models/Objetivo");

const {
  guardarHistorialSemanal,
} = require("../services/historialSemanalService");

const {
  generarPerfilDinamicoV2,
} = require("../services/perfilDinamicoV2Service");

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

    const semana = await generarSemana(perfil, objetivoPrincipal);
    const perfilDinamicoV2 = await generarPerfilDinamicoV2(perfil._id);
    const historial = await guardarHistorialSemanal({
      atletaId: perfil._id,
      fechaInicioSemana: new Date(),
      objetivoPrincipal,
      semanaGenerada: semana,
      adaptacion: semana.adaptacion,
      fatiga: {
        fatigaEstimada: semana.fatigaEstimada,
        estadoFatiga: semana.estadoFatiga,
      },
      cumplimiento: semana.cumplimiento,
      perfilDinamico: semana.perfilDinamico,
      mensajeEntrenador: semana.mensajeEntrenador,
    });
    res.json({
      objetivoPrincipal,
      semana,
      historial,
      perfilDinamicoV2,
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
