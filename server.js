const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const conectarDB = require("./config/db");
const { crearApp } = require("./app");

const faltantes = ["MONGO_URI", "JWT_SECRET"].filter((v) => !process.env[v]);

if (faltantes.length > 0) {
  console.error(
    `Faltan variables de entorno: ${faltantes.join(", ")}. Revisa .env.example.`,
  );
  process.exit(1);
}

conectarDB();

const PORT = process.env.PORT || 4000;

crearApp().listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
