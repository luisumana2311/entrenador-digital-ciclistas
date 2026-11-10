const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const firmarToken = (usuario) =>
  jwt.sign(
    { perfilId: String(usuario.perfilId) },
    process.env.JWT_SECRET,
    {
      subject: String(usuario._id),
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );

// Exige "Authorization: Bearer <token>" y deja el usuario en req.usuario.
const requerirAuth = async (req, res, next) => {
  const [esquema, token] = (req.headers.authorization || "").split(" ");

  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ mensaje: "Token requerido" });
  }

  let datos;

  try {
    datos = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }

  try {
    // Si la cuenta se borró, sus tokens dejan de servir.
    const usuario = await Usuario.findById(datos.sub);

    if (!usuario) {
      return res.status(401).json({ mensaje: "La cuenta ya no existe" });
    }

    req.usuario = {
      id: String(usuario._id),
      perfilId: String(usuario.perfilId),
      email: usuario.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Solo deja pasar si el parámetro de la ruta es el perfil del usuario.
const soloPropietario = (parametro) => (req, res, next) => {
  if (req.params[parametro] !== req.usuario.perfilId) {
    return res.status(403).json({ mensaje: "No tienes acceso a este atleta" });
  }

  next();
};

module.exports = {
  firmarToken,
  requerirAuth,
  soloPropietario,
};
