const { obtenerHistorialPorAtleta } = require("./historialSemanalService");

const calcularCumplimientoPromedio = (historial) => {
  if (!historial || historial.length === 0) {
    return 0;
  }

  const semanasConCumplimiento = historial.filter(
    (semana) =>
      semana.cumplimiento &&
      typeof semana.cumplimiento.cumplimiento === "number",
  );

  if (semanasConCumplimiento.length === 0) {
    return 0;
  }

  const total = semanasConCumplimiento.reduce((acumulado, semana) => {
    return acumulado + semana.cumplimiento.cumplimiento;
  }, 0);

  return Math.round(total / semanasConCumplimiento.length);
};

const calcularTendenciaCumplimiento = (historial) => {
  const semanasConCumplimiento = historial.filter(
    (semana) =>
      semana.cumplimiento &&
      typeof semana.cumplimiento.cumplimiento === "number",
  );

  if (semanasConCumplimiento.length < 2) {
    return "Sin datos suficientes";
  }

  const historialOrdenado = [...semanasConCumplimiento].sort(
    (a, b) => new Date(a.fechaInicioSemana) - new Date(b.fechaInicioSemana),
  );

  const primeraSemana = historialOrdenado[0];
  const ultimaSemana = historialOrdenado[historialOrdenado.length - 1];

  const cumplimientoInicial = primeraSemana.cumplimiento.cumplimiento;
  const cumplimientoFinal = ultimaSemana.cumplimiento.cumplimiento;

  const diferencia = cumplimientoFinal - cumplimientoInicial;

  if (diferencia >= 10) {
    return "Mejorando";
  }

  if (diferencia <= -10) {
    return "Empeorando";
  }

  return "Estable";
};

const calcularTendenciaFatiga = (historial) => {
  const semanasConFatiga = historial.filter(
    (semana) =>
      semana.fatiga && typeof semana.fatiga.fatigaEstimada === "number",
  );

  if (semanasConFatiga.length < 2) {
    return "Sin datos suficientes";
  }

  const historialOrdenado = [...semanasConFatiga].sort(
    (a, b) => new Date(a.fechaInicioSemana) - new Date(b.fechaInicioSemana),
  );

  const primeraSemana = historialOrdenado[0];
  const ultimaSemana = historialOrdenado[historialOrdenado.length - 1];

  const fatigaInicial = primeraSemana.fatiga.fatigaEstimada;
  const fatigaFinal = ultimaSemana.fatiga.fatigaEstimada;

  const diferencia = fatigaFinal - fatigaInicial;

  if (diferencia >= 10) {
    return "Aumentando";
  }

  if (diferencia <= -10) {
    return "Disminuyendo";
  }

  return "Estable";
};

const calcularPreferenciasSesiones = (historial) => {
  const contador = {};

  historial.forEach((semana) => {
    const perfil = semana.perfilDinamico;

    if (!perfil) return;

    if (perfil.sesionMasCumplida) {
      contador[perfil.sesionMasCumplida] =
        (contador[perfil.sesionMasCumplida] || 0) + 1;
    }
  });

  const sesiones = Object.entries(contador);

  if (sesiones.length === 0) {
    return [];
  }

  sesiones.sort((a, b) => b[1] - a[1]);

  return [sesiones[0][0]];
};

const calcularSesionesEvitadas = (historial) => {
  const contador = {};

  historial.forEach((semana) => {
    const perfil = semana.perfilDinamico;

    if (!perfil) return;

    if (perfil.sesionMenosCumplida) {
      contador[perfil.sesionMenosCumplida] =
        (contador[perfil.sesionMenosCumplida] || 0) + 1;
    }
  });

  const sesiones = Object.entries(contador);

  if (sesiones.length === 0) {
    return [];
  }

  sesiones.sort((a, b) => b[1] - a[1]);

  return [sesiones[0][0]];
};

const generarPerfilDinamicoV2 = async (atletaId) => {
  const historial = await obtenerHistorialPorAtleta(atletaId);

  const cumplimientoPromedio = calcularCumplimientoPromedio(historial);
  const tendenciaCumplimiento = calcularTendenciaCumplimiento(historial);
  const tendenciaFatiga = calcularTendenciaFatiga(historial);
  const sesionesPreferidas = calcularPreferenciasSesiones(historial);
  const sesionesEvitadas = calcularSesionesEvitadas(historial);

  return {
    cumplimientoPromedio,
    tendenciaCumplimiento,
    tendenciaFatiga,
    sesionesPreferidas,
    sesionesEvitadas,
  };
};

module.exports = {
  generarPerfilDinamicoV2,
  calcularCumplimientoPromedio,
  calcularTendenciaCumplimiento,
  calcularTendenciaFatiga,
  calcularPreferenciasSesiones,
  calcularSesionesEvitadas,
};
