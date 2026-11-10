const express = require("express");
const { rateLimit } = require("express-rate-limit");

const {
  registrar,
  iniciarSesion,
  obtenerUsuarioActual,
} = require("../controllers/authController");
const { requerirAuth } = require("../middleware/auth");

const router = express.Router();

// Frena ataques de fuerza bruta: 20 intentos cada 15 minutos por IP.
const limitarIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { mensaje: "Demasiados intentos, prueba de nuevo en unos minutos" },
});

router.post("/registro", limitarIntentos, registrar);
router.post("/login", limitarIntentos, iniciarSesion);
router.get("/yo", requerirAuth, obtenerUsuarioActual);

module.exports = router;
