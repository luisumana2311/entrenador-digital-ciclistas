const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const conectarDB = require("./config/db");
const perfilRoutes = require("./routes/perfilRoutes");
const objetivoRoutes = require("./routes/objetivoRoutes");
const semanaRoutes = require("./routes/semanaRoutes");

dotenv.config();

conectarDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/perfiles", perfilRoutes);
app.use("/api/objetivos", objetivoRoutes);
app.use("/api/semanas", semanaRoutes);

app.get("/", (req, res) => {
  res.send("Entrenador Digital para Ciclistas funcionando");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});