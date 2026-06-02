const express = require("express");
const router = express.Router();

const {
    crearPerfil,
    obtenerPerfiles,
    obtenerPerfilPorId,
} = require("../controllers/perfilController");

router.post("/", crearPerfil);

router.get("/", obtenerPerfiles);

router.get("/:id", obtenerPerfilPorId);

module.exports = router;