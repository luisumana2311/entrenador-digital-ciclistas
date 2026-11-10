const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const objetivoRoutes = require("./routes/objetivoRoutes");
const semanaRoutes = require("./routes/semanaRoutes");
const registroDiarioRoutes = require("./routes/registroDiarioRoutes");
const historialSemanalRoutes = require("./routes/historialSemanalRoutes");
const { requerirAuth } = require("./middleware/auth");

// CORS_ORIGIN="http://localhost:5173,https://mi-app.com" limita los orígenes.
// Sin definir, se permite cualquiera (cómodo en desarrollo).
const opcionesCors = () => {
  const origenes = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  return origenes.length > 0 ? { origin: origenes } : {};
};

const crearApp = () => {
  const app = express();

  app.use(cors(opcionesCors()));
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (req, res) => {
    res.send("Entrenador Digital para Ciclistas funcionando");
  });

  app.use("/api/auth", authRoutes);

  // Todo lo demás requiere un token válido.
  app.use("/api", requerirAuth);
  app.use("/api/perfiles", perfilRoutes);
  app.use("/api/objetivos", objetivoRoutes);
  app.use("/api/semanas", semanaRoutes);
  app.use("/api/registros-diarios", registroDiarioRoutes);
  app.use("/api/historial", historialSemanalRoutes);

  app.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ mensaje: "JSON inválido" });
    }

    if (error.type === "entity.too.large") {
      return res.status(413).json({ mensaje: "Solicitud demasiado grande" });
    }

    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  });

  return app;
};

module.exports = { crearApp };
