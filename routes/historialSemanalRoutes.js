const express = require("express");

const {
  obtenerHistorialPorAtleta,
  crearHistorialSemanal,
} = require("../controllers/historialSemanalController");

const router = express.Router();

router.post("/", crearHistorialSemanal);
router.get("/:atletaId", obtenerHistorialPorAtleta);

module.exports = router;
