const PerfilAtleta = require("../models/PerfilAtleta");
const Objetivo = require("../models/Objetivo");
const RegistroDiario = require("../models/RegistroDiario");
const HistorialSemanal = require("../models/HistorialSemanal");
const { manejarError } = require("../utils/manejarError");

const crearPerfil = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.create(req.body);

    res.status(201).json(perfil);
  } catch (error) {
    manejarError(res, error, "Error al crear el perfil");
  }
};

const obtenerPerfiles = async (req, res) => {
  try {
    const perfiles = await PerfilAtleta.find();

    res.json(perfiles);
  } catch (error) {
    manejarError(res, error, "Error al obtener perfiles");
  }
};

const obtenerPerfilPorId = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findById(req.params.id);

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
      req.params.id,
      req.body,
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

// Borra el perfil junto con sus objetivos, registros e historial.
const eliminarPerfil = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findByIdAndDelete(req.params.id);

    if (!perfil) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    await Promise.all([
      Objetivo.deleteMany({ atletaId: perfil._id }),
      RegistroDiario.deleteMany({ atletaId: perfil._id }),
      HistorialSemanal.deleteMany({ atletaId: perfil._id }),
    ]);

    res.json({ mensaje: "Perfil eliminado", id: perfil._id });
  } catch (error) {
    manejarError(res, error, "Error al eliminar el perfil");
  }
};

module.exports = {
  crearPerfil,
  obtenerPerfiles,
  obtenerPerfilPorId,
  actualizarPerfil,
  eliminarPerfil,
};
