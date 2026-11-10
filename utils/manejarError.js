const mongoose = require("mongoose");

// Responde 400 para errores del cliente (datos inválidos o ID mal formado)
// y 500 para todo lo demás.
const manejarError = (res, error, mensaje = "Error interno del servidor") => {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: Object.fromEntries(
        Object.entries(error.errors).map(([campo, e]) => [campo, e.message]),
      ),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      mensaje: `Valor inválido para ${error.path}: ${error.value}`,
    });
  }

  console.error(error);

  return res.status(500).json({
    mensaje,
    error: error.message,
  });
};

const esIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = {
  manejarError,
  esIdValido,
};
