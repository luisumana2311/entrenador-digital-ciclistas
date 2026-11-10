const express = require("express");
const router = express.Router();

const {
  crearPerfil,
  obtenerPerfiles,
  obtenerPerfilPorId,
  actualizarPerfil,
  eliminarPerfil,
} = require("../controllers/perfilController");

router.post("/", crearPerfil);
router.get("/", obtenerPerfiles);
router.get("/:id", obtenerPerfilPorId);
router.patch("/:id", actualizarPerfil);
router.delete("/:id", eliminarPerfil);

module.exports = router;
