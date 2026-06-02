const express = require("express");
const router = express.Router();

const { generarSemanaPrueba } = require("../controllers/semanaController");

router.get("/prueba", generarSemanaPrueba);

router.get("/atleta/:id", generarSemanaPrueba);
module.exports = router;
