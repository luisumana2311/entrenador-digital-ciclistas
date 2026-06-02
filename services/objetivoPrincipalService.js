const prioridades = {
  Alta: 3,
  Media: 2,
  Baja: 1,
};

const obtenerObjetivosActivos = (objetivos) => {
  return objetivos.filter((objetivo) => objetivo.estado === "Activo");
};

const ordenarObjetivosPorPrioridadYFecha = (objetivos) => {
  return objetivos.sort((a, b) => {
    const prioridadA = prioridades[a.prioridad] || 0;
    const prioridadB = prioridades[b.prioridad] || 0;

    if (prioridadA !== prioridadB) {
      return prioridadB - prioridadA;
    }

    return new Date(a.fechaObjetivo) - new Date(b.fechaObjetivo);
  });
};

const obtenerObjetivoPrincipal = (objetivos) => {
  const objetivosActivos = obtenerObjetivosActivos(objetivos);

  if (objetivosActivos.length === 0) {
    return null;
  }

  const objetivosOrdenados =
    ordenarObjetivosPorPrioridadYFecha(objetivosActivos);

  return objetivosOrdenados[0];
};

module.exports = {
  obtenerObjetivoPrincipal,
};
