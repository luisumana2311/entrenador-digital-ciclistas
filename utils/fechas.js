const MS_DIA = 24 * 60 * 60 * 1000;

// Lunes 00:00 (hora local) de la semana que contiene la fecha.
const inicioDeSemana = (fecha = new Date()) => {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  const diasDesdeLunes = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - diasDesdeLunes);
  return inicio;
};

const sumarDias = (fecha, dias) => {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
};

const estaEnSemana = (fecha, inicioSemana) => {
  const f = new Date(fecha);
  return f >= inicioSemana && f < sumarDias(inicioSemana, 7);
};

module.exports = {
  MS_DIA,
  inicioDeSemana,
  sumarDias,
  estaEnSemana,
};
