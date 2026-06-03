const express = require("express");

const {
  crearRegistroDiario,
  obtenerRegistrosPorAtleta,
} = require("../controllers/registroDiarioController");

const router = express.Router();

router.post("/", crearRegistroDiario);

router.get("/atleta/:atletaId", obtenerRegistrosPorAtleta);

module.exports = router;
