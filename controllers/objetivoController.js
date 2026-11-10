const Objetivo = require("../models/Objetivo");
const { manejarError } = require("../utils/manejarError");
const { elegirCampos, CAMPOS_OBJETIVO } = require("../utils/campos");

// Todos los objetivos pertenecen al atleta autenticado; el atletaId del body se ignora.

const crearObjetivo = async (req, res) => {
  try {
    const objetivo = await Objetivo.create({
      ...elegirCampos(req.body, CAMPOS_OBJETIVO),
      atletaId: req.usuario.perfilId,
    });

    res.status(201).json(objetivo);
  } catch (error) {
    manejarError(res, error, "Error al crear el objetivo");
  }
};

const obtenerObjetivos = async (req, res) => {
  try {
    const objetivos = await Objetivo.find({
      atletaId: req.usuario.perfilId,
    }).sort({ fechaObjetivo: 1 });

    res.json(objetivos);
  } catch (error) {
    manejarError(res, error, "Error al obtener objetivos");
  }
};

const actualizarObjetivo = async (req, res) => {
  try {
    const objetivo = await Objetivo.findOneAndUpdate(
      { _id: req.params.id, atletaId: req.usuario.perfilId },
      elegirCampos(req.body, CAMPOS_OBJETIVO),
      { returnDocument: "after", runValidators: true },
    );

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
    const objetivo = await Objetivo.findOneAndDelete({
      _id: req.params.id,
      atletaId: req.usuario.perfilId,
    });

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
