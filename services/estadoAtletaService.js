const PerfilAtleta = require("../models/PerfilAtleta");
const RegistroDiario = require("../models/RegistroDiario");

// Fatiga subjetiva 0-10 a partir del registro diario:
// promedio entre la falta de energía y el dolor muscular.
const calcularFatigaSubjetiva = ({ energia, dolorMuscular }) => {
  return Math.round(((10 - energia) + dolorMuscular) / 2);
};

// Copia el estado del registro diario más reciente al perfil del atleta,
// para que el generador de la semana use datos actuales y no un valor fijo.
const sincronizarPerfilConUltimoRegistro = async (atletaId) => {
  const ultimo = await RegistroDiario.findOne({ atletaId }).sort({ fecha: -1 });

  if (!ultimo) {
    return null;
  }

  return PerfilAtleta.findByIdAndUpdate(
    atletaId,
    {
      fatiga: calcularFatigaSubjetiva(ultimo),
      sueno: ultimo.sueno,
      estres: ultimo.estres,
    },
    { returnDocument: "after" },
  );
};

module.exports = {
  calcularFatigaSubjetiva,
  sincronizarPerfilConUltimoRegistro,
};
