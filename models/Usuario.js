const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email inválido"],
    },

    // Nunca se devuelve en las consultas salvo que se pida con select("+passwordHash").
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    perfilId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerfilAtleta",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Usuario", usuarioSchema);
