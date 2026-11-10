const mongoose = require("mongoose");

const historialSemanalSchema = new mongoose.Schema(
  {
    atletaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerfilAtleta",
      required: true,
    },

    fechaInicioSemana: {
      type: Date,
      required: true,
    },

    objetivoPrincipal: {
      type: Object,
      required: true,
    },

    semanaGenerada: {
      type: Object,
      required: true,
    },

    adaptacion: {
      type: Object,
      default: {},
    },

    fatiga: {
      type: Object,
      default: {},
    },

    cumplimiento: {
      type: Object,
      default: {},
    },

    perfilDinamico: {
      type: Object,
      default: {},
    },

    mensajeEntrenador: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Una sola semana guardada por atleta (fechaInicioSemana = lunes 00:00).
historialSemanalSchema.index(
  { atletaId: 1, fechaInicioSemana: 1 },
  { unique: true },
);

module.exports = mongoose.model("HistorialSemanal", historialSemanalSchema);
