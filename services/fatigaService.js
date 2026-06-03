const calcularFatiga = (volumenGenerado, volumenObjetivo, sesiones) => {
  if (volumenObjetivo === 0) {
    return {
      fatigaEstimada: 0,
      estadoFatiga: "Fresco",
    };
  }

  let cargaSesiones = 0;

  sesiones.forEach((sesion) => {
    switch (sesion.tipo) {
      case "Recuperación":
        cargaSesiones += 5;
        break;

      case "Z2":
        cargaSesiones += 10;
        break;

      case "Umbral":
        cargaSesiones += 20;
        break;

      case "VO2":
        cargaSesiones += 30;
        break;

      case "Fondo Largo":
        cargaSesiones += 25;
        break;

      default:
        cargaSesiones += 10;
    }
  });

  const porcentajeCarga = (volumenGenerado / volumenObjetivo) * 100;

  let fatigaEstimada = Math.round(cargaSesiones * 0.6 + porcentajeCarga * 0.2);

  if (fatigaEstimada > 100) {
    fatigaEstimada = 100;
  }

  let estadoFatiga = "";

  if (fatigaEstimada <= 20) {
    estadoFatiga = "Fresco";
  } else if (fatigaEstimada <= 40) {
    estadoFatiga = "Ligera fatiga";
  } else if (fatigaEstimada <= 60) {
    estadoFatiga = "Fatiga moderada";
  } else if (fatigaEstimada <= 80) {
    estadoFatiga = "Fatiga alta";
  } else {
    estadoFatiga = "Sobrecarga";
  }

  return {
    fatigaEstimada,
    estadoFatiga,
  };
};

module.exports = {
  calcularFatiga,
};
