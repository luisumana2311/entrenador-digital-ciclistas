const express = require("express");
const router = express.Router();

const { generarSemanaAtleta } = require("../controllers/semanaController");

router.get("/atleta/:id", generarSemanaAtleta);

module.exports = router;
