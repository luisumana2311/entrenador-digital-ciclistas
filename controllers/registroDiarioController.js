const RegistroDiario = require("../models/RegistroDiario");
const PerfilAtleta = require("../models/PerfilAtleta");
const { manejarError, esIdValido } = require("../utils/manejarError");
const {
  sincronizarPerfilConUltimoRegistro,
} = require("../services/estadoAtletaService");

const crearRegistroDiario = async (req, res) => {
  try {
    const { atletaId } = req.body;

    if (!atletaId || !esIdValido(atletaId)) {
      return res.status(400).json({ mensaje: "atletaId es requerido y debe ser válido" });
    }

    if (!(await PerfilAtleta.exists({ _id: atletaId }))) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    const nuevoRegistro = await RegistroDiario.create(req.body);
    await sincronizarPerfilConUltimoRegistro(atletaId);

    res.status(201).json(nuevoRegistro);
  } catch (error) {
    manejarError(res, error, "Error al crear el registro diario");
  }
};

const obtenerRegistrosPorAtleta = async (req, res) => {
  try {
    const registros = await RegistroDiario.find({
      atletaId: req.params.atletaId,
    }).sort({ fecha: -1 });

    res.json(registros);
  } catch (error) {
    manejarError(res, error, "Error al obtener registros diarios");
  }
};

const actualizarRegistroDiario = async (req, res) => {
  try {
    const { atletaId, ...cambios } = req.body;

    const registro = await RegistroDiario.findByIdAndUpdate(
      req.params.id,
      cambios,
      { returnDocument: "after", runValidators: true },
    );

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    await sincronizarPerfilConUltimoRegistro(registro.atletaId);

    res.json(registro);
  } catch (error) {
    manejarError(res, error, "Error al actualizar el registro diario");
  }
};

const eliminarRegistroDiario = async (req, res) => {
  try {
    const registro = await RegistroDiario.findByIdAndDelete(req.params.id);

    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    await sincronizarPerfilConUltimoRegistro(registro.atletaId);

    res.json({ mensaje: "Registro eliminado", id: registro._id });
  } catch (error) {
    manejarError(res, error, "Error al eliminar el registro diario");
  }
};

module.exports = {
  crearRegistroDiario,
  obtenerRegistrosPorAtleta,
  actualizarRegistroDiario,
  eliminarRegistroDiario,
};
