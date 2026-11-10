const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const PerfilAtleta = require("../models/PerfilAtleta");
const { firmarToken } = require("../middleware/auth");
const { manejarError } = require("../utils/manejarError");
const { elegirCampos, CAMPOS_PERFIL } = require("../utils/campos");

const LARGO_MINIMO_PASSWORD = 8;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizarEmail = (email) => String(email || "").trim().toLowerCase();

// POST /api/auth/registro { email, password, nombre, ...datos del perfil }
// Crea la cuenta y su perfil de atleta en un solo paso.
const registrar = async (req, res) => {
  const email = normalizarEmail(req.body.email);
  const { password } = req.body;

  if (!email || typeof password !== "string") {
    return res.status(400).json({ mensaje: "Email y contraseña son requeridos" });
  }

  if (!EMAIL_VALIDO.test(email)) {
    return res.status(400).json({ mensaje: "Email inválido" });
  }

  if (password.length < LARGO_MINIMO_PASSWORD) {
    return res.status(400).json({
      mensaje: `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres`,
    });
  }

  let perfil;

  try {
    if (await Usuario.exists({ email })) {
      return res.status(409).json({ mensaje: "Ese email ya está registrado" });
    }

    perfil = await PerfilAtleta.create(elegirCampos(req.body, CAMPOS_PERFIL));

    const usuario = await Usuario.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      perfilId: perfil._id,
    });

    res.status(201).json({
      token: firmarToken(usuario),
      usuario: { id: usuario._id, email: usuario.email },
      perfil,
    });
  } catch (error) {
    if (perfil) {
      await PerfilAtleta.deleteOne({ _id: perfil._id });
    }

    if (error.code === 11000) {
      return res.status(409).json({ mensaje: "Ese email ya está registrado" });
    }

    manejarError(res, error, "Error al registrar la cuenta");
  }
};

// POST /api/auth/login { email, password }
const iniciarSesion = async (req, res) => {
  try {
    const email = normalizarEmail(req.body.email);
    const { password } = req.body;

    const usuario = email
      ? await Usuario.findOne({ email }).select("+passwordHash")
      : null;

    const valido =
      usuario &&
      typeof password === "string" &&
      (await bcrypt.compare(password, usuario.passwordHash));

    if (!valido) {
      // Mismo mensaje para email o contraseña incorrectos.
      return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
    }

    res.json({
      token: firmarToken(usuario),
      usuario: { id: usuario._id, email: usuario.email },
      perfilId: usuario.perfilId,
    });
  } catch (error) {
    manejarError(res, error, "Error al iniciar sesión");
  }
};

// GET /api/auth/yo (requiere token)
const obtenerUsuarioActual = async (req, res) => {
  try {
    const perfil = await PerfilAtleta.findById(req.usuario.perfilId);

    res.json({
      usuario: { id: req.usuario.id, email: req.usuario.email },
      perfil,
    });
  } catch (error) {
    manejarError(res, error, "Error al obtener el usuario");
  }
};

module.exports = {
  registrar,
  iniciarSesion,
  obtenerUsuarioActual,
};
