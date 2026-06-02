const PerfilAtleta = require("../models/PerfilAtleta");

const crearPerfil = async (req, res) => {
  try {
    const perfil = new PerfilAtleta(req.body);

    await perfil.save();

    res.status(201).json(perfil);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerPerfiles = async (req, res) => {
  try {
    const perfiles = await PerfilAtleta.find();

    res.json(perfiles);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerPerfilPorId = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findById(req.params.id);

    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado",
      });
    }

    res.json(perfil);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado",
      });
    }

    res.json(perfil);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  crearPerfil,
  obtenerPerfiles,
  obtenerPerfilPorId,
  actualizarPerfil,
};
