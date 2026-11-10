const { reglasEntrenador } = require("./motorReglasService");
const { calcularVolumenObjetivo } = require("./volumenSemanalService");
const { calcularFatiga } = require("./fatigaService");
const { evaluarAdaptacion, aplicarAdaptacion } = require("./adaptacionService");
const { generarMensajeEntrenador } = require("./mensajeEntrenadorService");
const { calcularCumplimiento } = require("./cumplimientoService");
const { generarPerfilDinamico } = require("./perfilDinamicoService");
const { normalizarTexto, redondear5 } = require("./sesionesUtil");
const { inicioDeSemana, estaEnSemana } = require("../utils/fechas");

const ordenDias = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

// Duración base (minutos) de las sesiones clave por disciplina.
const PLANTILLAS_DISCIPLINA = {
  "mtb marathon": { fondo: 270, vo2: 90, umbral: 90 },
  xco: { fondo: 180, vo2: 90, umbral: 75 },
  ruta: { fondo: 240, vo2: 90, umbral: 90 },
  gravel: { fondo: 240, vo2: 90, umbral: 90 },
  indoor: { fondo: 120, vo2: 75, umbral: 75 },
  mixto: { fondo: 210, vo2: 90, umbral: 90 },
};

const obtenerPlantilla = (disciplina) => {
  const d = normalizarTexto(disciplina);

  if (d.includes("marathon")) return PLANTILLAS_DISCIPLINA["mtb marathon"];
  if (d.includes("xco") || d.includes("mtb")) return PLANTILLAS_DISCIPLINA.xco;
  if (d.includes("ruta")) return PLANTILLAS_DISCIPLINA.ruta;
  if (d.includes("gravel")) return PLANTILLAS_DISCIPLINA.gravel;
  if (d.includes("indoor") || d.includes("rodillo")) {
    return PLANTILLAS_DISCIPLINA.indoor;
  }

  return PLANTILLAS_DISCIPLINA.mixto;
};

const limpiarDisponibilidad = (disponibilidad = {}) => {
  return disponibilidad.toObject ? disponibilidad.toObject() : disponibilidad;
};

const obtenerIndiceDia = (dia) => ordenDias.indexOf(dia);

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
  return [...sesiones].sort(
    (a, b) => obtenerIndiceDia(a.dia) - obtenerIndiceDia(b.dia),
  );
};

// Regla 001: VO2 y Umbral nunca en días consecutivos ni el día antes del fondo.
// Si no hay un par válido, se programa solo VO2 en vez de romper la regla.
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
    diaVO2: candidatos[0] || null,
    diaUmbral: null,
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
  if (!nuevaSesion.dia || diaYaTieneSesion(sesiones, nuevaSesion.dia)) {
    return;
  }

  const minutosDisponibles = obtenerMinutosDisponiblesDia(
    disponibilidad,
    nuevaSesion.dia,
  );

  const duracion = Math.min(nuevaSesion.duracion, minutosDisponibles);

  if (duracion > 0) {
    sesiones.push({ ...nuevaSesion, duracion });
  }
};

// maxMinutos limita la duración de cada Z2 (fatiga moderada).
const rellenarDiasLibresConZ2 = (sesiones, disponibilidad, maxMinutos) => {
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
        duracion: Math.min(minutosDisponibles, maxMinutos),
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

    const minutosLibres =
      obtenerMinutosDisponiblesDia(disponibilidad, dia) - sesion.duracion;

    if (minutosLibres <= 0) {
      continue;
    }

    if (sesion.tipo === "VO2" || sesion.tipo === "Umbral") {
      sesion.bloques = [
        { tipo: sesion.tipo, duracion: sesion.duracion },
        { tipo: "Z2 Complementario", duracion: minutosLibres },
      ];

      sesion.tipo = `${sesion.tipo} + Z2`;
      sesion.duracion += minutosLibres;
      continue;
    }

    sesion.duracion += minutosLibres;
  }

  return sesiones;
};

// Regla 017: la fatiga subjetiva del perfil (0-10) limita la expansión de volumen.
const expandirVolumenSegunFatiga = (sesiones, disponibilidad, fatiga = 0) => {
  if (fatiga <= 3) {
    rellenarDiasLibresConZ2(sesiones, disponibilidad, Infinity);
    return extenderSesionesExistentes(sesiones, disponibilidad);
  }

  if (fatiga <= 6) {
    return rellenarDiasLibresConZ2(sesiones, disponibilidad, 60);
  }

  return sesiones;
};

/**
 * Genera la semana de entrenamiento. Es una función pura: recibe los datos
 * ya cargados de la base de datos, así se puede probar sin MongoDB.
 *
 * @param perfil              PerfilAtleta
 * @param objetivo            objetivo principal activo
 * @param registrosDiarios    registros del atleta (cualquier orden)
 * @param opciones.fecha      fecha de referencia (por defecto hoy)
 * @param opciones.semanasPrevias [{ sesiones, fechaInicioSemana }] del historial
 */
const generarSemana = (perfil, objetivo, registrosDiarios = [], opciones = {}) => {
  const fecha = opciones.fecha || new Date();
  const semanasPrevias = opciones.semanasPrevias || [];
  const fechaInicioSemana = inicioDeSemana(fecha);

  const datosVolumen = calcularVolumenObjetivo(perfil, objetivo, fecha);
  const { fase } = datosVolumen;
  const plantilla = obtenerPlantilla(
    objetivo.disciplina || perfil.disciplinaPrincipal,
  );

  let sesiones = [];

  const diaFondo = reglasEntrenador.fondoEnDiaMasLargo
    ? obtenerDiaMasLargo(perfil.disponibilidad)
    : "domingo";

  const diasDisponibles = obtenerDiasDisponibles(perfil.disponibilidad);
  const { diaVO2, diaUmbral } = elegirVO2yUmbral(diasDisponibles, diaFondo);

  agregarSesion(sesiones, perfil.disponibilidad, {
    dia: diaFondo,
    tipo: "Fondo Largo",
    duracion: redondear5(plantilla.fondo * fase.factorFondo),
  });

  agregarSesion(sesiones, perfil.disponibilidad, {
    dia: diaVO2,
    tipo: "VO2",
    duracion: plantilla.vo2,
  });

  agregarSesion(sesiones, perfil.disponibilidad, {
    dia: diaUmbral,
    tipo: "Umbral",
    duracion: plantilla.umbral,
  });

  agregarSesion(sesiones, perfil.disponibilidad, {
    dia: elegirDiaRecuperacion(diasDisponibles, sesiones),
    tipo: "Recuperación",
    duracion: 60,
  });

  sesiones = expandirVolumenSegunFatiga(
    sesiones,
    perfil.disponibilidad,
    perfil.fatiga,
  );

  const volumenDisponible = calcularTiempoDisponible(perfil.disponibilidad);

  // La adaptación usa el último registro diario y la fatiga del plan sin ajustar.
  const fatigaInicial = calcularFatiga(
    calcularVolumenSemanal(sesiones),
    datosVolumen.volumenObjetivo,
    sesiones,
  );

  const registrosOrdenados = [...registrosDiarios].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  );
  const ultimoRegistro = registrosOrdenados[0];

  let adaptacion = {
    accion: "Sin datos",
    puntajeRiesgo: 0,
    motivos: [],
  };

  if (ultimoRegistro) {
    adaptacion = evaluarAdaptacion(
      ultimoRegistro,
      fatigaInicial.fatigaEstimada,
    );
  }

  sesiones = ordenarSesionesPorDia(
    aplicarAdaptacion(sesiones, adaptacion.accion),
  );

  const volumenGenerado = calcularVolumenSemanal(sesiones);
  const utilizacion = calcularUtilizacion(volumenGenerado, volumenDisponible);
  const datosFatiga = calcularFatiga(
    volumenGenerado,
    datosVolumen.volumenObjetivo,
    sesiones,
  );

  const registrosDeSemana = (inicio) =>
    registrosOrdenados.filter((r) => estaEnSemana(r.fecha, inicio));

  const cumplimiento = calcularCumplimiento(
    sesiones,
    registrosDeSemana(fechaInicioSemana),
  );

  const perfilDinamico = generarPerfilDinamico([
    ...semanasPrevias.map((semana) => ({
      sesiones: semana.sesiones || [],
      registros: registrosDeSemana(inicioDeSemana(semana.fechaInicioSemana)),
    })),
    { sesiones, registros: registrosDeSemana(fechaInicioSemana) },
  ]);

  const mensajeEntrenador = generarMensajeEntrenador(adaptacion, cumplimiento);

  return {
    fechaInicioSemana,
    fase: fase.fase,
    mision: fase.mision,
    volumenGenerado,
    volumenDisponible,
    volumenObjetivo: datosVolumen.volumenObjetivo,
    semanasHastaObjetivo: datosVolumen.semanasHastaObjetivo,
    factorDisciplina: datosVolumen.factorDisciplina,
    factorObjetivo: datosVolumen.factorObjetivo,
    utilizacion,
    sesiones,
    fatigaEstimada: datosFatiga.fatigaEstimada,
    estadoFatiga: datosFatiga.estadoFatiga,
    adaptacion,
    mensajeEntrenador,
    cumplimiento,
    perfilDinamico,
  };
};

module.exports = {
  generarSemana,
  obtenerPlantilla,
  elegirVO2yUmbral,
};
