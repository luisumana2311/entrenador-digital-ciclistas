const mongoose = require("mongoose");

const objetivoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
        },

        disciplina: {
            type: String,
            required: true,
        },

        fechaObjetivo: {
            type: Date,
            required: true,
        },

        prioridad: {
            type: String,
            enum: ["Alta", "Media", "Baja"],
            default: "Media",
        },

        distancia: {
            type: Number,
            default: 0,
        },

        desnivel: {
            type: Number,
            default: 0,
        },

        estado: {
            type: String,
            enum: ["Activo", "Completado", "Cancelado"],
            default: "Activo",
        },

        atletaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PerfilAtleta",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Objetivo",
    objetivoSchema
);