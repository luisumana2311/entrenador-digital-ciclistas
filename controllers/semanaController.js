const { generarSemana } = require("../services/generadorSemanaService");
const {
  obtenerObjetivoPrincipal,
} = require("../services/objetivoPrincipalService");
const {
  guardarHistorialSemanal,
  obtenerSemanasPrevias,
} = require("../services/historialSemanalService");
const PerfilAtleta = require("../models/PerfilAtleta");
const Objetivo = require("../models/Objetivo");
const RegistroDiario = require("../models/RegistroDiario");
const { manejarError } = require("../utils/manejarError");

// Genera (o regenera) la semana actual del atleta y la guarda en el historial.
// Llamarlo varias veces en la misma semana actualiza el mismo registro.
const generarSemanaAtleta = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findById(req.params.id);

    if (!perfil) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    const objetivos = await Objetivo.find({ atletaId: perfil._id });

    if (objetivos.length === 0) {
      return res.status(404).json({
        mensaje: "El atleta no tiene objetivos registrados",
      });
    }

    const objetivoPrincipal = obtenerObjetivoPrincipal(objetivos);

    if (!objetivoPrincipal) {
      return res.status(404).json({ mensaje: "No existe un objetivo activo" });
    }

    const hoy = new Date();

    const [registros, previas] = await Promise.all([
      RegistroDiario.find({ atletaId: perfil._id }).sort({ fecha: -1 }),
      obtenerSemanasPrevias(perfil._id, hoy, 3),
    ]);

    const semana = generarSemana(perfil, objetivoPrincipal, registros, {
      fecha: hoy,
      semanasPrevias: previas.map((h) => ({
        fechaInicioSemana: h.fechaInicioSemana,
        sesiones: h.semanaGenerada?.sesiones || [],
      })),
    });

    const historial = await guardarHistorialSemanal({
      atletaId: perfil._id,
      fechaInicioSemana: semana.fechaInicioSemana,
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
    });
  } catch (error) {
    manejarError(res, error, "Error al generar la semana");
  }
};

module.exports = {
  generarSemanaAtleta,
};
