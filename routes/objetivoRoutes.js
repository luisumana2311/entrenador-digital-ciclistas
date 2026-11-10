const express = require("express");
const router = express.Router();

const {
  crearObjetivo,
  obtenerObjetivos,
  actualizarObjetivo,
  eliminarObjetivo,
} = require("../controllers/objetivoController");

router.post("/", crearObjetivo);
router.get("/", obtenerObjetivos);
router.patch("/:id", actualizarObjetivo);
router.delete("/:id", eliminarObjetivo);

module.exports = router;
