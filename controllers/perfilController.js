const PerfilAtleta = require("../models/PerfilAtleta");
const Objetivo = require("../models/Objetivo");
const RegistroDiario = require("../models/RegistroDiario");
const HistorialSemanal = require("../models/HistorialSemanal");
const Usuario = require("../models/Usuario");
const { manejarError } = require("../utils/manejarError");
const { elegirCampos, CAMPOS_PERFIL } = require("../utils/campos");

// El perfil se crea en POST /api/auth/registro. Aquí solo se lee,
// actualiza o borra el perfil propio (las rutas ya validan el dueño).

const obtenerMiPerfil = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findById(req.usuario.perfilId);

    if (!perfil) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    res.json(perfil);
  } catch (error) {
    manejarError(res, error, "Error al obtener el perfil");
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findByIdAndUpdate(
      req.usuario.perfilId,
      elegirCampos(req.body, CAMPOS_PERFIL),
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!perfil) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    res.json(perfil);
  } catch (error) {
    manejarError(res, error, "Error al actualizar el perfil");
  }
};

// Borra la cuenta completa: perfil, usuario, objetivos, registros e historial.
const eliminarPerfil = async (req, res) => {
  try {
    const atletaId = req.usuario.perfilId;
    const perfil = await PerfilAtleta.findByIdAndDelete(atletaId);

    if (!perfil) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    await Promise.all([
      Usuario.deleteOne({ perfilId: atletaId }),
      Objetivo.deleteMany({ atletaId }),
      RegistroDiario.deleteMany({ atletaId }),
      HistorialSemanal.deleteMany({ atletaId }),
    ]);

    res.json({ mensaje: "Cuenta eliminada", id: perfil._id });
  } catch (error) {
    manejarError(res, error, "Error al eliminar el perfil");
  }
};

module.exports = {
  obtenerMiPerfil,
  actualizarPerfil,
  eliminarPerfil,
};
