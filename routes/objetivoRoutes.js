const express = require("express");
const router = express.Router();

const {
  crearObjetivo,
  obtenerObjetivos,
} = require("../controllers/objetivoController");

router.post("/", crearObjetivo);

router.get("/", obtenerObjetivos);

module.exports = router;
