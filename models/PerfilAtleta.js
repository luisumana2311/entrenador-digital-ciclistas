const mongoose = require("mongoose");

const perfilAtletaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },

    edad: {
      type: Number,
    },

    peso: {
      type: Number,
    },

    estatura: {
      type: Number,
    },

    ftp: {
      type: Number,
      default: null,
    },

    disciplinaPrincipal: {
      type: String,
      default: "",
    },

    disponibilidad: {
      lunes: {
        type: Number,
        default: 0,
      },

      martes: {
        type: Number,
        default: 0,
      },

      miercoles: {
        type: Number,
        default: 0,
      },

      jueves: {
        type: Number,
        default: 0,
      },

      viernes: {
        type: Number,
        default: 0,
      },

      sabado: {
        type: Number,
        default: 0,
      },

      domingo: {
        type: Number,
        default: 0,
      },
    },

    estadoActual: {
      type: String,
      default: "Normal",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PerfilAtleta",
  perfilAtletaSchema
);