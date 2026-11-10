import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { api, ErrorApi, mensajeDeError } from "../api";
import {
  DIAS,
  INFO_SESION,
  fechaDelDia,
  formatearFecha,
  formatearMinutos,
  mismoDia,
  tipoBase,
} from "../utilidades";

const CLASE_ACCION = {
  "Descanso recomendado": "alerta-error",
  "Reducir carga": "alerta-aviso",
  Monitorear: "alerta-aviso",
};

function TarjetaSesion({ sesion }) {
  const info = INFO_SESION[tipoBase(sesion.tipo)] || {};

  return (
    <div className={`sesion sesion-${info.clase || "z2"}`}>
      <div className="sesion-tipo">{sesion.tipo}</div>
      <div className="sesion-duracion">{formatearMinutos(sesion.duracion)}</div>
      {sesion.bloques ? (
        <ul className="sesion-bloques">
          {sesion.bloques.map((b, i) => (
            <li key={i}>
              {b.tipo}: {formatearMinutos(b.duracion)}
            </li>
          ))}
        </ul>
      ) : (
        info.detalle && <p className="sesion-detalle">{info.detalle}</p>
      )}
    </div>
  );
}

function Indicador({ titulo, valor, detalle }) {
  return (
    <div className="indicador">
      <span className="indicador-titulo">{titulo}</span>
      <span className="indicador-valor">{valor}</span>
      {detalle && <span className="indicador-detalle">{detalle}</span>}
    </div>
  );
}

export default function MiSemana() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await api.semanaActual());
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando && !datos) {
    return <p className="sutil">Preparando tu semana…</p>;
  }

  // Sin objetivos activos, el motor no puede planificar.
  if (error instanceof ErrorApi && error.status === 404) {
    return (
      <div className="tarjeta vacio">
        <h2>Primero, define tu objetivo</h2>
        <p>
          El plan se arma alrededor de tu próxima competencia o reto. Agrega uno y vuelve aquí.
        </p>
        <Link className="boton" to="/objetivos">
          Crear objetivo
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <p className="alerta alerta-error" role="alert">
        {mensajeDeError(error)}
      </p>
    );
  }

  const { semana, objetivoPrincipal } = datos;
  const hoy = new Date();
  const accion = semana.adaptacion.accion;

  return (
    <div className="pila">
      <section className="tarjeta resumen-semana">
        <div>
          <p className="etiqueta">
            Semana del {formatearFecha(semana.fechaInicioSemana)} · Fase {semana.fase}
          </p>
          <h1>{semana.mision}</h1>
          <p className="sutil">
            {objetivoPrincipal.nombre} ({objetivoPrincipal.disciplina}) ·{" "}
            {semana.semanasHastaObjetivo === 0
              ? "¡es esta semana!"
              : `faltan ${semana.semanasHastaObjetivo} semanas`}
          </p>
        </div>
        <button className="boton boton-secundario" onClick={cargar} disabled={cargando}>
          {cargando ? "Actualizando…" : "Recalcular"}
        </button>
      </section>

      <p className={`alerta ${CLASE_ACCION[accion] || "alerta-info"}`}>
        <strong>Tu entrenador: </strong>
        {semana.mensajeEntrenador}
        {accion === "Sin datos" && (
          <>
            {" "}
            <Link to="/hoy">Cuéntame cómo te sientes hoy</Link> para ajustar el plan.
          </>
        )}
      </p>

      <section className="indicadores">
        <Indicador
          titulo="Volumen"
          valor={formatearMinutos(semana.volumenGenerado)}
          detalle={`${semana.utilizacion}% de tu tiempo disponible`}
        />
        <Indicador
          titulo="Fatiga estimada"
          valor={`${semana.fatigaEstimada}/100`}
          detalle={semana.estadoFatiga}
        />
        <Indicador
          titulo="Cumplimiento"
          valor={`${semana.cumplimiento.cumplimiento}%`}
          detalle={semana.cumplimiento.estado}
        />
        <Indicador
          titulo="Tendencia"
          valor={semana.perfilDinamico.tendencia}
          detalle={
            !["Sin datos", "Ninguna"].includes(semana.perfilDinamico.sesionMenosCumplida)
              ? `Te cuesta más: ${semana.perfilDinamico.sesionMenosCumplida}`
              : "Últimas 4 semanas"
          }
        />
      </section>

      <section className="calendario" aria-label="Sesiones de la semana">
        {DIAS.map((dia, i) => {
          const fecha = fechaDelDia(semana.fechaInicioSemana, i);
          const sesion = semana.sesiones.find((s) => s.dia === dia.clave);
          const esHoy = mismoDia(fecha, hoy);

          return (
            <article key={dia.clave} className={`dia ${esHoy ? "dia-hoy" : ""}`}>
              <header className="dia-encabezado">
                <span className="dia-nombre">{dia.nombre}</span>
                <span className="dia-fecha">{esHoy ? "Hoy" : formatearFecha(fecha)}</span>
              </header>
              {sesion ? (
                <TarjetaSesion sesion={sesion} />
              ) : (
                <div className="sesion sesion-descanso">Descanso</div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
