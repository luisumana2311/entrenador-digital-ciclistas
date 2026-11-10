const express = require("express");
const router = express.Router();

const { generarSemanaAtleta } = require("../controllers/semanaController");
const { soloPropietario } = require("../middleware/auth");

router.get("/actual", generarSemanaAtleta);
router.get("/atleta/:id", soloPropietario("id"), generarSemanaAtleta);

module.exports = router;
