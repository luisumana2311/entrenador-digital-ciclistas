const express = require("express");

const {
  crearRegistroDiario,
  obtenerRegistrosPorAtleta,
  actualizarRegistroDiario,
  eliminarRegistroDiario,
} = require("../controllers/registroDiarioController");

const router = express.Router();

router.post("/", crearRegistroDiario);
router.get("/atleta/:atletaId", obtenerRegistrosPorAtleta);
router.patch("/:id", actualizarRegistroDiario);
router.delete("/:id", eliminarRegistroDiario);

module.exports = router;
