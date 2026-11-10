const RegistroDiario = require("../models/RegistroDiario");
const { manejarError } = require("../utils/manejarError");
const { elegirCampos, CAMPOS_REGISTRO } = require("../utils/campos");
const {
  sincronizarPerfilConUltimoRegistro,
} = require("../services/estadoAtletaService");

// Todos los registros pertenecen al atleta autenticado; el atletaId del body se ignora.

const crearRegistroDiario = async (req, res) => {
  try {
    const atletaId = req.usuario.perfilId;

    const nuevoRegistro = await RegistroDiario.create({
      ...elegirCampos(req.body, CAMPOS_REGISTRO),
      atletaId,
    });

    await sincronizarPerfilConUltimoRegistro(atletaId);

    res.status(201).json(nuevoRegistro);
  } catch (error) {
    manejarError(res, error, "Error al crear el registro diario");
  }
};

const obtenerRegistros = async (req, res) => {
  try {
    const registros = await RegistroDiario.find({
      atletaId: req.usuario.perfilId,
    }).sort({ fecha: -1 });

    res.json(registros);
  } catch (error) {
    manejarError(res, error, "Error al obtener registros diarios");
  }
};

const actualizarRegistroDiario = async (req, res) => {
  try {
    const atletaId = req.usuario.perfilId;

    const registro = await RegistroDiario.findOneAndUpdate(
      { _id: req.params.id, atletaId },
      elegirCampos(req.body, CAMPOS_REGISTRO),
      { returnDocument: "after", runValidators: true },
    );

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    await sincronizarPerfilConUltimoRegistro(atletaId);

    res.json(registro);
  } catch (error) {
    manejarError(res, error, "Error al actualizar el registro diario");
  }
};

const eliminarRegistroDiario = async (req, res) => {
  try {
    const atletaId = req.usuario.perfilId;

    const registro = await RegistroDiario.findOneAndDelete({
      _id: req.params.id,
      atletaId,
    });

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    await sincronizarPerfilConUltimoRegistro(atletaId);

    res.json({ mensaje: "Registro eliminado", id: registro._id });
  } catch (error) {
    manejarError(res, error, "Error al eliminar el registro diario");
  }
};

module.exports = {
  crearRegistroDiario,
  obtenerRegistros,
  actualizarRegistroDiario,
  eliminarRegistroDiario,
};
