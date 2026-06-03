const generarMensajeEntrenador = (adaptacion, cumplimiento) => {
  let mensaje = "";

  switch (adaptacion.accion) {
    case "Descanso recomendado":
      mensaje = `Reducimos la carga porque detectamos: ${adaptacion.motivos.join(
        ", ",
      )}.`;
      break;

    case "Reducir carga":
      mensaje = `Se recomienda reducir la carga debido a: ${adaptacion.motivos.join(
        ", ",
      )}.`;
      break;

    case "Monitorear":
      mensaje = `Se recomienda monitorear tu estado debido a: ${adaptacion.motivos.join(
        ", ",
      )}.`;
      break;

    default:
      mensaje = "Tu estado actual permite mantener el plan programado.";
  }

  if (cumplimiento) {
    if (cumplimiento.cumplimiento < 60) {
      mensaje += ` Además, tu cumplimiento actual es de ${cumplimiento.cumplimiento}%, por lo que debemos mejorar la adherencia al plan.`;
    } else if (cumplimiento.cumplimiento >= 85) {
      mensaje += ` Excelente trabajo. Tu cumplimiento actual es de ${cumplimiento.cumplimiento}%.`;
    }
  }

  return mensaje;
};

module.exports = {
  generarMensajeEntrenador,
};
