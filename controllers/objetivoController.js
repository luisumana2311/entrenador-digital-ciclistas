const Objetivo = require("../models/Objetivo");
const PerfilAtleta = require("../models/PerfilAtleta");
const { manejarError, esIdValido } = require("../utils/manejarError");

const crearObjetivo = async (req, res) => {
  try {
    const { atletaId } = req.body;

    if (!atletaId || !esIdValido(atletaId)) {
      return res.status(400).json({ mensaje: "atletaId es requerido y debe ser válido" });
    }

    if (!(await PerfilAtleta.exists({ _id: atletaId }))) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    const objetivo = await Objetivo.create(req.body);

    res.status(201).json(objetivo);
  } catch (error) {
    manejarError(res, error, "Error al crear el objetivo");
  }
};

// GET /api/objetivos?atletaId=... filtra por atleta.
const obtenerObjetivos = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.atletaId) {
      filtro.atletaId = req.query.atletaId;
    }

    const objetivos = await Objetivo.find(filtro).sort({ fechaObjetivo: 1 });

    res.json(objetivos);
  } catch (error) {
    manejarError(res, error, "Error al obtener objetivos");
  }
};

const actualizarObjetivo = async (req, res) => {
  try {
    const { atletaId, ...cambios } = req.body;

    const objetivo = await Objetivo.findByIdAndUpdate(req.params.id, cambios, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!objetivo) {
      return res.status(404).json({ mensaje: "Objetivo no encontrado" });
    }

    res.json(objetivo);
  } catch (error) {
    manejarError(res, error, "Error al actualizar el objetivo");
  }
};

const eliminarObjetivo = async (req, res) => {
  try {
    const objetivo = await Objetivo.findByIdAndDelete(req.params.id);

    if (!objetivo) {
      return res.status(404).json({ mensaje: "Objetivo no encontrado" });
    }

    res.json({ mensaje: "Objetivo eliminado", id: objetivo._id });
  } catch (error) {
    manejarError(res, error, "Error al eliminar el objetivo");
  }
};

module.exports = {
  crearObjetivo,
  obtenerObjetivos,
  actualizarObjetivo,
  eliminarObjetivo,
};
