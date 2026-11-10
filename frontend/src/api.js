// Cliente de la API del backend. Guarda el token en localStorage.
const CLAVE_TOKEN = "entrenador.token";
const BASE = import.meta.env.VITE_API_URL || "/api";

export const leerToken = () => {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
};

export const guardarToken = (token) => {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Sin almacenamiento disponible: la sesión dura lo que la pestaña.
  }
};

export class ErrorApi extends Error {
  constructor(status, datos) {
    super(datos?.mensaje || `Error ${status}`);
    this.status = status;
    this.datos = datos;
  }
}

// Se llama cuando el backend responde 401 con un token (sesión vencida).
let alExpirarSesion = () => {};
export const configurarExpiracion = (fn) => {
  alExpirarSesion = fn;
};

const pedir = async (metodo, ruta, body) => {
  const token = leerToken();

  const respuesta = await fetch(BASE + ruta, {
    method: metodo,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alExpirarSesion();
    throw new ErrorApi(respuesta.status, datos);
  }

  return datos;
};

export const api = {
  registrar: (datos) => pedir("POST", "/auth/registro", datos),
  login: (email, password) => pedir("POST", "/auth/login", { email, password }),
  yo: () => pedir("GET", "/auth/yo"),

  actualizarPerfil: (cambios) => pedir("PATCH", "/perfiles/yo", cambios),
  eliminarCuenta: () => pedir("DELETE", "/perfiles/yo"),

  objetivos: () => pedir("GET", "/objetivos"),
  crearObjetivo: (datos) => pedir("POST", "/objetivos", datos),
  actualizarObjetivo: (id, cambios) => pedir("PATCH", `/objetivos/${id}`, cambios),
  eliminarObjetivo: (id) => pedir("DELETE", `/objetivos/${id}`),

  registros: () => pedir("GET", "/registros-diarios"),
  crearRegistro: (datos) => pedir("POST", "/registros-diarios", datos),
  eliminarRegistro: (id) => pedir("DELETE", `/registros-diarios/${id}`),

  semanaActual: () => pedir("GET", "/semanas/actual"),
  historial: () => pedir("GET", "/historial"),
};

// Mensaje legible a partir de un error de la API (incluye errores de validación).
export const mensajeDeError = (error) => {
  if (error instanceof ErrorApi) {
    const errores = error.datos?.errores;
    if (errores) return Object.values(errores).join(". ");
    return error.message;
  }
  return "No se pudo conectar con el servidor. ¿Está corriendo el backend?";
};
