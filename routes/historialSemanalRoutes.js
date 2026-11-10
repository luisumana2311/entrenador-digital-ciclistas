const express = require("express");

const {
  obtenerHistorialPorAtleta,
  crearHistorialSemanal,
} = require("../controllers/historialSemanalController");
const { soloPropietario } = require("../middleware/auth");

const router = express.Router();

router.post("/", crearHistorialSemanal);
router.get("/", obtenerHistorialPorAtleta);
router.get("/:atletaId", soloPropietario("atletaId"), obtenerHistorialPorAtleta);

module.exports = router;
