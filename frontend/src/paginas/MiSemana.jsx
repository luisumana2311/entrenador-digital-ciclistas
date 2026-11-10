import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CalendarDays,
  Flag,
  Gauge,
  Megaphone,
  PenLine,
  RefreshCw,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { api, ErrorApi, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import Anillo from "../componentes/Anillo";
import {
  DIAS,
  FASES,
  INFO_DESCANSO,
  INFO_SESION,
  fechaDelDia,
  formatearFecha,
  formatearMinutos,
  horas,
  infoSesion,
  mismoDia,
  vatios,
} from "../utilidades";

const FASES_CORTAS = ["Base", "Constr.", "Espec.", "Afinar"];

const TONO_ACCION = {
  "Descanso recomendado": "tono-descanso",
  "Reducir carga": "tono-reducir",
  Monitorear: "tono-monitorear",
  "Mantener plan": "tono-mantener",
};

function Hero({ semana, objetivo, onRecalcular, cargando }) {
  const indiceFase = FASES.indexOf(semana.fase);
  const semanas = semana.semanasHastaObjetivo;

  return (
    <section className="hero">
      <div>
        <p className="sobretitulo">
          Semana del {formatearFecha(semana.fechaInicioSemana, { day: "numeric", month: "long" })}
        </p>
        <h1>{semana.mision}</h1>
        <p className="hero-objetivo">
          <Flag size={16} />
          {objetivo.nombre} · {objetivo.disciplina}
        </p>
        <div className="hero-acciones">
          <Link className="boton boton-lima" to="/hoy">
            <PenLine size={17} />
            Registrar hoy
          </Link>
          <button className="boton boton-suave" onClick={onRecalcular} disabled={cargando}>
            <RefreshCw size={17} className={cargando ? "girando" : ""} />
            {cargando ? "Calculando…" : "Recalcular"}
          </button>
        </div>
      </div>

      <div className="hero-lado">
        <div className="cuenta-atras">
          <span className="cifra cuenta-atras-numero">{semanas}</span>
          <span className="cuenta-atras-texto">
            {semanas === 0 ? (
              <>
                ¡Es esta semana!
                <br />A disfrutarla.
              </>
            ) : (
              <>
                {semanas === 1 ? "semana" : "semanas"} para
                <br />
                {objetivo.nombre}
              </>
            )}
          </span>
        </div>
        <div className="fases" aria-label={`Fase actual: ${semana.fase}`}>
          {FASES.map((fase, i) => (
            <span
              key={fase}
              className={`fase ${i < indiceFase ? "pasada" : ""} ${i === indiceFase ? "actual" : ""}`}
            >
              <span className="fase-largo">{fase}</span>
              <span className="fase-corto" aria-hidden="true">
                {FASES_CORTAS[i]}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function MensajeEntrenador({ semana }) {
  const accion = semana.adaptacion.accion;
  const tono = TONO_ACCION[accion] || "";

  return (
    <section className={`tarjeta entrenador ${tono}`}>
      <span className="entrenador-avatar">
        <Megaphone size={22} />
      </span>
      <div className="entrenador-mensaje">
        <span className="chip">{accion === "Sin datos" ? "Tu entrenador" : accion}</span>
        <p>
          {semana.mensajeEntrenador}
          {accion === "Sin datos" && (
            <>
              {" "}
              <Link to="/hoy">Cuéntame cómo te sientes hoy</Link> y ajusto el plan.
            </>
          )}
        </p>
      </div>
    </section>
  );
}

function SesionDeHoy({ sesion, ftp }) {
  if (!sesion) {
    const { clase, Icono, resumen } = INFO_DESCANSO;
    return (
      <section className={`tarjeta hoy ${clase}`}>
        <p className="sobretitulo">Hoy</p>
        <div className="hoy-cabecera">
          <span className="icono-zona">
            <Icono size={26} />
          </span>
          <div>
            <div className="hoy-tipo">Descanso</div>
            <p className="sutil">{resumen}</p>
          </div>
        </div>
      </section>
    );
  }

  const info = infoSesion(sesion.tipo);
  const { Icono } = info;
  const objetivoVatios = vatios(ftp, info.rango);

  return (
    <section className={`tarjeta hoy ${info.clase}`}>
      <p className="sobretitulo">Hoy toca</p>
      <div className="hoy-cabecera">
        <span className="icono-zona">
          <Icono size={26} />
        </span>
        <div>
          <div className="hoy-tipo">{sesion.tipo}</div>
          <p className="sutil">{info.resumen}</p>
        </div>
      </div>

      <div className="hoy-datos">
        <div className="dato">
          <span className="cifra">{formatearMinutos(sesion.duracion)}</span>
          <span>Duración</span>
        </div>
        <div className="dato">
          <span className="cifra">{info.zona}</span>
          <span>Zona</span>
        </div>
        <div className="dato">
          <span className="cifra">{objetivoVatios || `${info.rango[0]}–${info.rango[1]}%`}</span>
          <span>{objetivoVatios ? "Potencia objetivo" : "del FTP"}</span>
        </div>
      </div>

      <p className="estructura">{info.estructura}</p>

      {sesion.bloques && (
        <p className="sutil" style={{ fontSize: "0.85rem" }}>
          Sesión extendida:{" "}
          {sesion.bloques.map((b) => `${b.tipo} ${formatearMinutos(b.duracion)}`).join(" + ")}.
        </p>
      )}

      {!ftp && (
        <p className="sutil" style={{ fontSize: "0.85rem" }}>
          <Link to="/perfil">Agrega tu FTP</Link> para ver tus vatios objetivo.
        </p>
      )}
    </section>
  );
}

function Indicadores({ semana }) {
  const { cumplimiento, perfilDinamico } = semana;
  const menos = perfilDinamico.sesionMenosCumplida;

  return (
    <section className="indicadores" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
      <div className="tarjeta indicador">
        <div className="indicador-fila">
          <span className="sobretitulo">Volumen</span>
          <Timer size={18} className="sutil" />
        </div>
        <span className="cifra indicador-valor">
          {horas(semana.volumenGenerado)} <small>h</small>
        </span>
        <div className="barra">
          <div className="barra-relleno" style={{ width: `${Math.min(100, semana.utilizacion)}%` }} />
        </div>
        <span className="indicador-detalle">{semana.utilizacion}% de tu tiempo libre</span>
      </div>

      <div className="tarjeta indicador">
        <div className="indicador-fila">
          <span className="sobretitulo">Fatiga</span>
          <Gauge size={18} className="sutil" />
        </div>
        <span className="cifra indicador-valor">
          {semana.fatigaEstimada}
          <small>/100</small>
        </span>
        <div className="barra barra-fatiga">
          <span className="barra-marcador" style={{ left: `${semana.fatigaEstimada}%` }} />
        </div>
        <span className="indicador-detalle">{semana.estadoFatiga}</span>
      </div>

      <div className="tarjeta indicador">
        <div className="indicador-fila">
          <span className="sobretitulo">Cumplimiento</span>
          <Target size={18} className="sutil" />
        </div>
        <div className="indicador-fila" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
          <Anillo valor={cumplimiento.cumplimiento} tamano={52} grosor={6} />
          <span className="cifra indicador-valor">
            {cumplimiento.cumplimiento}
            <small>%</small>
          </span>
        </div>
        <span className="indicador-detalle">
          {cumplimiento.estado === "Sin datos" ? "Aún sin sesiones registradas" : cumplimiento.estado}
        </span>
      </div>

      <div className="tarjeta indicador">
        <div className="indicador-fila">
          <span className="sobretitulo">Tendencia</span>
          <TrendingUp size={18} className="sutil" />
        </div>
        <span className="cifra" style={{ fontSize: "1.35rem", lineHeight: 1.1 }}>
          {perfilDinamico.tendencia}
        </span>
        <span className="indicador-detalle">
          {!["Sin datos", "Ninguna"].includes(menos) ? `Te cuesta más: ${menos}` : "Últimas 4 semanas"}
        </span>
      </div>
    </section>
  );
}

function CargaSemanal({ semana }) {
  const hoy = new Date();
  const maximo = Math.max(60, ...semana.sesiones.map((s) => s.duracion));

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>Carga de la semana</h2>
        <span className="chip">
          <span className="cifra">{horas(semana.volumenGenerado)} h</span>
        </span>
      </div>
      <div className="grafica" role="img" aria-label="Minutos de entrenamiento por día">
        {DIAS.map((dia, i) => {
          const sesion = semana.sesiones.find((s) => s.dia === dia.clave);
          const info = sesion ? infoSesion(sesion.tipo) : INFO_DESCANSO;
          const esHoy = mismoDia(fechaDelDia(semana.fechaInicioSemana, i), hoy);
          return (
            <div key={dia.clave} className={`grafica-col ${info.clase} ${esHoy ? "es-hoy" : ""}`}>
              <span className="grafica-valor cifra">{sesion ? horas(sesion.duracion) : ""}</span>
              <div
                className="grafica-barra"
                style={{ height: sesion ? `${(sesion.duracion / maximo) * 75}%` : "6px" }}
                title={sesion ? `${sesion.tipo} · ${formatearMinutos(sesion.duracion)}` : "Descanso"}
              />
              <span className="grafica-dia">{dia.corto}</span>
            </div>
          );
        })}
      </div>
      <div className="leyenda">
        {Object.entries(INFO_SESION).map(([tipo, info]) => (
          <span key={tipo} className={info.clase}>
            <i />
            {tipo}
          </span>
        ))}
      </div>
    </section>
  );
}

function ListaDias({ semana, ftp }) {
  const hoy = new Date();

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>Día a día</h2>
        <CalendarDays size={20} className="sutil" />
      </div>
      <div className="dias">
        {DIAS.map((dia, i) => {
          const fecha = fechaDelDia(semana.fechaInicioSemana, i);
          const sesion = semana.sesiones.find((s) => s.dia === dia.clave);
          const info = sesion ? infoSesion(sesion.tipo) : INFO_DESCANSO;
          const { Icono } = info;
          const esHoy = mismoDia(fecha, hoy);
          const potencia = sesion ? vatios(ftp, info.rango) : null;

          return (
            <article key={dia.clave} className={`dia-fila ${info.clase} ${esHoy ? "es-hoy" : ""}`}>
              <div className="dia-fecha">
                <span>{esHoy ? "Hoy" : dia.corto}</span>
                <span className="cifra">{fecha.getDate()}</span>
              </div>
              <span className="icono-zona">
                <Icono size={20} />
              </span>
              <div className="dia-cuerpo">
                <div className="dia-tipo">{sesion ? sesion.tipo : "Descanso"}</div>
                <div className="dia-detalle">
                  {sesion ? [info.zona, potencia || info.resumen].join(" · ") : "Recupera"}
                </div>
              </div>
              {sesion && <span className="cifra dia-duracion">{formatearMinutos(sesion.duracion)}</span>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function MiSemana() {
  const { perfil } = useSesion();
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
    return (
      <div className="pila" aria-busy="true">
        <div className="esqueleto" style={{ height: 220 }} />
        <div className="esqueleto" style={{ height: 90 }} />
        <div className="esqueleto" style={{ height: 260 }} />
      </div>
    );
  }

  if (error instanceof ErrorApi && error.status === 404) {
    return (
      <section className="tarjeta vacio">
        <span className="vacio-icono">
          <Flag size={30} />
        </span>
        <h2>Primero, tu objetivo</h2>
        <p>Tu plan se arma alrededor de tu próxima carrera o reto. Agrega uno y tu semana aparece aquí.</p>
        <Link className="boton boton-lima" to="/objetivos">
          Crear objetivo
        </Link>
      </section>
    );
  }

  if (error) {
    return (
      <p className="alerta alerta-error" role="alert">
        <AlertCircle size={18} />
        {mensajeDeError(error)}
      </p>
    );
  }

  const { semana, objetivoPrincipal } = datos;
  const indiceHoy = DIAS.findIndex((_, i) =>
    mismoDia(fechaDelDia(semana.fechaInicioSemana, i), new Date()),
  );
  const sesionHoy = semana.sesiones.find((s) => s.dia === DIAS[indiceHoy]?.clave);

  return (
    <div className="pila">
      <Hero semana={semana} objetivo={objetivoPrincipal} onRecalcular={cargar} cargando={cargando} />
      <MensajeEntrenador semana={semana} />
      <div className="columnas">
        <SesionDeHoy sesion={sesionHoy} ftp={perfil?.ftp} />
        <Indicadores semana={semana} />
      </div>
      <div className="columnas">
        <CargaSemanal semana={semana} />
        <ListaDias semana={semana} ftp={perfil?.ftp} />
      </div>
    </div>
  );
}
