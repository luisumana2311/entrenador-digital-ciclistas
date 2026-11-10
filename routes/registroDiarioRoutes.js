const express = require("express");

const {
  crearRegistroDiario,
  obtenerRegistros,
  actualizarRegistroDiario,
  eliminarRegistroDiario,
} = require("../controllers/registroDiarioController");
const { soloPropietario } = require("../middleware/auth");

const router = express.Router();

router.post("/", crearRegistroDiario);
router.get("/", obtenerRegistros);
router.get("/atleta/:atletaId", soloPropietario("atletaId"), obtenerRegistros);
router.patch("/:id", actualizarRegistroDiario);
router.delete("/:id", eliminarRegistroDiario);

module.exports = router;
