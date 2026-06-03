const mongoose = require("mongoose");

const registroDiarioSchema = new mongoose.Schema(
  {
    atletaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerfilAtleta",
      required: true,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },

    sueno: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    energia: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    estres: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    dolorMuscular: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    entrenoRealizado: {
      type: Boolean,
      default: false,
    },
    entrenamientoRealizado: {
      type: String,
      default: "",
    },

    duracionRealizada: {
      type: Number,
      default: 0,
    },
    comentario: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("RegistroDiario", registroDiarioSchema);
