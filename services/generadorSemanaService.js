const { reglasEntrenador } = require("./motorReglasService");

const ordenDias = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const limpiarDisponibilidad = (disponibilidad) => {
  return disponibilidad.toObject ? disponibilidad.toObject() : disponibilidad;
};

const obtenerIndiceDia = (dia) => {
  return ordenDias.indexOf(dia);
};

const obtenerDiaMasLargo = (disponibilidad) => {
  const disponibilidadLimpia = limpiarDisponibilidad(disponibilidad);

  let diaMasLargo = null;
  let horasMaximas = 0;

  for (const dia of ordenDias) {
    const horas = disponibilidadLimpia[dia] || 0;

    if (horas > horasMaximas) {
      horasMaximas = horas;
      diaMasLargo = dia;
    }
  }

  return diaMasLargo;
};

const obtenerDiasDisponibles = (disponibilidad) => {
  const disponibilidadLimpia = limpiarDisponibilidad(disponibilidad);

  return ordenDias
    .map((dia) => [dia, disponibilidadLimpia[dia] || 0])
    .filter(([, horas]) => horas > 0)
    .sort((a, b) => b[1] - a[1]);
};

const sonConsecutivos = (dia1, dia2) => {
  return Math.abs(obtenerIndiceDia(dia1) - obtenerIndiceDia(dia2)) === 1;
};

const esDiaAnteriorAlFondo = (dia, diaFondo) => {
  return obtenerIndiceDia(dia) === obtenerIndiceDia(diaFondo) - 1;
};

const diaYaTieneSesion = (sesiones, dia) => {
  return sesiones.some((sesion) => sesion.dia === dia);
};

const obtenerSesionPorDia = (sesiones, dia) => {
  return sesiones.find((sesion) => sesion.dia === dia);
};

const obtenerMinutosDisponiblesDia = (disponibilidad, dia) => {
  const disponibilidadLimpia = limpiarDisponibilidad(disponibilidad);
  return (disponibilidadLimpia[dia] || 0) * 60;
};

const calcularVolumenSemanal = (sesiones) => {
  return sesiones.reduce((total, sesion) => total + sesion.duracion, 0);
};

const calcularTiempoDisponible = (disponibilidad) => {
  const disponibilidadLimpia = limpiarDisponibilidad(disponibilidad);

  return ordenDias.reduce((total, dia) => {
    return total + (disponibilidadLimpia[dia] || 0) * 60;
  }, 0);
};

const calcularUtilizacion = (volumenGenerado, volumenDisponible) => {
  if (volumenDisponible === 0) {
    return 0;
  }

  return Math.round((volumenGenerado / volumenDisponible) * 100);
};

const ordenarSesionesPorDia = (sesiones) => {
  return sesiones.sort(
    (a, b) => obtenerIndiceDia(a.dia) - obtenerIndiceDia(b.dia),
  );
};

const elegirVO2yUmbral = (diasDisponibles, diaFondo) => {
  const candidatos = diasDisponibles
    .map(([dia]) => dia)
    .filter((dia) => dia !== diaFondo && !esDiaAnteriorAlFondo(dia, diaFondo));

  for (let i = 0; i < candidatos.length; i++) {
    for (let j = i + 1; j < candidatos.length; j++) {
      if (!sonConsecutivos(candidatos[i], candidatos[j])) {
        return {
          diaVO2: candidatos[i],
          diaUmbral: candidatos[j],
        };
      }
    }
  }

  return {
    diaVO2: "martes",
    diaUmbral: "jueves",
  };
};

const elegirDiaRecuperacion = (diasDisponibles, sesiones) => {
  const candidatos = diasDisponibles.map(([dia]) => dia);

  for (const dia of candidatos) {
    if (!diaYaTieneSesion(sesiones, dia)) {
      return dia;
    }
  }

  return null;
};

const agregarSesion = (sesiones, disponibilidad, nuevaSesion) => {
  if (diaYaTieneSesion(sesiones, nuevaSesion.dia)) {
    return;
  }

  const minutosDisponibles = obtenerMinutosDisponiblesDia(
    disponibilidad,
    nuevaSesion.dia,
  );

  if (nuevaSesion.duracion > minutosDisponibles) {
    nuevaSesion.duracion = minutosDisponibles;
  }

  if (nuevaSesion.duracion > 0) {
    sesiones.push(nuevaSesion);
  }
};

const rellenarDiasLibresConZ2 = (sesiones, disponibilidad) => {
  const diasDisponibles = obtenerDiasDisponibles(disponibilidad);

  for (const [dia, horasDisponibles] of diasDisponibles) {
    if (diaYaTieneSesion(sesiones, dia)) {
      continue;
    }

    const minutosDisponibles = horasDisponibles * 60;

    if (minutosDisponibles >= 60) {
      sesiones.push({
        dia,
        tipo: "Z2",
        duracion: minutosDisponibles,
      });
    }
  }

  return sesiones;
};
const extenderSesionesExistentes = (sesiones, disponibilidad) => {
  for (const dia of ordenDias) {
    const sesion = obtenerSesionPorDia(sesiones, dia);

    if (!sesion) {
      continue;
    }

    const minutosDisponibles = obtenerMinutosDisponiblesDia(
      disponibilidad,
      dia,
    );

    const minutosLibres = minutosDisponibles - sesion.duracion;

    if (minutosLibres <= 0) {
      continue;
    }

    if (sesion.tipo === "VO2" || sesion.tipo === "Umbral") {
      sesion.bloques = [
        {
          tipo: sesion.tipo,
          duracion: sesion.duracion,
        },
        {
          tipo: "Z2 Complementario",
          duracion: minutosLibres,
        },
      ];

      sesion.tipo = `${sesion.tipo} + Z2`;
      sesion.duracion += minutosLibres;
      continue;
    }

    if (
      sesion.tipo === "Recuperación" ||
      sesion.tipo === "Z2" ||
      sesion.tipo === "Fondo Largo"
    ) {
      sesion.duracion += minutosLibres;
    }
  }

  return sesiones;
};

const generarSemana = (perfil, objetivo) => {
  let mision = "";
  let sesiones = [];

  if (objetivo.disciplina === "MTB Marathon") {
    mision = "Construir resistencia aeróbica";

    const diaFondo = reglasEntrenador.fondoEnDiaMasLargo
      ? obtenerDiaMasLargo(perfil.disponibilidad)
      : "domingo";

    const diasDisponibles = obtenerDiasDisponibles(perfil.disponibilidad);

    const { diaVO2, diaUmbral } = elegirVO2yUmbral(diasDisponibles, diaFondo);

    agregarSesion(sesiones, perfil.disponibilidad, {
      dia: diaFondo,
      tipo: "Fondo Largo",
      duracion: 270,
    });

    agregarSesion(sesiones, perfil.disponibilidad, {
      dia: diaVO2,
      tipo: "VO2",
      duracion: 90,
    });

    agregarSesion(sesiones, perfil.disponibilidad, {
      dia: diaUmbral,
      tipo: "Umbral",
      duracion: 90,
    });

    const diaRecuperacion = elegirDiaRecuperacion(diasDisponibles, sesiones);

    if (diaRecuperacion) {
      agregarSesion(sesiones, perfil.disponibilidad, {
        dia: diaRecuperacion,
        tipo: "Recuperación",
        duracion: 60,
      });
    }

    sesiones = rellenarDiasLibresConZ2(sesiones, perfil.disponibilidad);
    sesiones = extenderSesionesExistentes(sesiones, perfil.disponibilidad);
  }

  sesiones = ordenarSesionesPorDia(sesiones);

  const volumenGenerado = calcularVolumenSemanal(sesiones);
  const volumenDisponible = calcularTiempoDisponible(perfil.disponibilidad);
  const utilizacion = calcularUtilizacion(volumenGenerado, volumenDisponible);

  return {
    mision,
    volumenGenerado,
    volumenDisponible,
    utilizacion,
    sesiones,
  };
};

module.exports = {
  generarSemana,
};
