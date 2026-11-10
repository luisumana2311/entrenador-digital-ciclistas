const express = require("express");
const router = express.Router();

const {
  obtenerMiPerfil,
  actualizarPerfil,
  eliminarPerfil,
} = require("../controllers/perfilController");
const { soloPropietario } = require("../middleware/auth");

// /yo es un atajo al perfil del usuario autenticado.
router.get("/yo", obtenerMiPerfil);
router.patch("/yo", actualizarPerfil);
router.delete("/yo", eliminarPerfil);

router.get("/:id", soloPropietario("id"), obtenerMiPerfil);
router.patch("/:id", soloPropietario("id"), actualizarPerfil);
router.delete("/:id", soloPropietario("id"), eliminarPerfil);

module.exports = router;
