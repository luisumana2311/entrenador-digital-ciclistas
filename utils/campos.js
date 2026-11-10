// Copia solo los campos permitidos del body. Evita que el cliente modifique
// atletaId, _id, timestamps o claves raras como "__proto__".
const elegirCampos = (origen = {}, permitidos = []) => {
  const resultado = {};

  for (const campo of permitidos) {
    if (Object.prototype.hasOwnProperty.call(origen, campo)) {
      resultado[campo] = origen[campo];
    }
  }

  return resultado;
};

const CAMPOS_PERFIL = [
  "nombre",
  "edad",
  "peso",
  "estatura",
  "ftp",
  "disciplinaPrincipal",
  "disponibilidad",
  "fatiga",
  "motivacion",
  "sueno",
  "estres",
  "estadoActual",
];

const CAMPOS_OBJETIVO = [
  "nombre",
  "disciplina",
  "fechaObjetivo",
  "prioridad",
  "distancia",
  "desnivel",
  "estado",
];

const CAMPOS_REGISTRO = [
  "fecha",
  "sueno",
  "energia",
  "estres",
  "dolorMuscular",
  "entrenoRealizado",
  "entrenamientoRealizado",
  "duracionRealizada",
  "comentario",
];

module.exports = {
  elegirCampos,
  CAMPOS_PERFIL,
  CAMPOS_OBJETIVO,
  CAMPOS_REGISTRO,
};
