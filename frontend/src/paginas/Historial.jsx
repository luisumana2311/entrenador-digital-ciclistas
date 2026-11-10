import { useEffect, useState } from "react";
import { AlertCircle, ChartLine, ChevronRight } from "lucide-react";
import { api, mensajeDeError } from "../api";
import { DIAS, formatearFecha, formatearMinutos, horas, infoSesion } from "../utilidades";

export default function Historial() {
  const [semanas, setSemanas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .historial()
      .then(setSemanas)
      .catch((e) => setError(mensajeDeError(e)));
  }, []);

  if (error) {
    return (
      <p className="alerta alerta-error" role="alert">
        <AlertCircle size={18} />
        {error}
      </p>
    );
  }

  if (!semanas) {
    return <div className="esqueleto" style={{ height: 300 }} aria-busy="true" />;
  }

  // La gráfica va de la semana más antigua a la más reciente (máx. 12).
  const ultimas = [...semanas].slice(0, 12).reverse();
  const maximo = Math.max(60, ...ultimas.map((h) => h.semanaGenerada?.volumenGenerado || 0));

  return (
    <div className="pila-lg">
      <header className="encabezado-pagina">
        <div>
          <p className="sobretitulo">Historial</p>
          <h1>Tu progreso</h1>
          <p>Cada semana que generas queda guardada aquí.</p>
        </div>
      </header>

      {semanas.length === 0 ? (
        <section className="tarjeta vacio">
          <span className="vacio-icono">
            <ChartLine size={30} />
          </span>
          <h2>Aún no hay semanas</h2>
          <p>Se guardan automáticamente cada vez que abres “Mi semana”.</p>
        </section>
      ) : (
        <>
          <section className="tarjeta">
            <div className="tarjeta-titulo">
              <h2>Volumen por semana</h2>
              <span className="chip">{semanas.length} {semanas.length === 1 ? "semana" : "semanas"}</span>
            </div>
            <div className="grafica-historial" role="img" aria-label="Horas de entrenamiento por semana">
              {ultimas.map((h, i) => {
                const volumen = h.semanaGenerada?.volumenGenerado || 0;
                return (
                  <div key={h._id} className={`grafica-col ${i === ultimas.length - 1 ? "actual" : ""}`}>
                    <span className="grafica-valor cifra">{horas(volumen)}h</span>
                    <div className="grafica-barra" style={{ height: `${(volumen / maximo) * 70}%` }} />
                    <span className="grafica-dia">{formatearFecha(h.fechaInicioSemana, { day: "numeric", month: "numeric" })}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="pila">
            {semanas.map((h) => {
              const s = h.semanaGenerada || {};
              return (
                <details key={h._id} className="tarjeta semana-historial">
                  <summary>
                    <ChevronRight size={18} className="chevron sutil" />
                    <div>
                      <strong>Semana del {formatearFecha(h.fechaInicioSemana, { day: "numeric", month: "long" })}</strong>
                      <div className="sutil" style={{ fontSize: "0.82rem" }}>
                        {s.fase || "—"} · {h.objetivoPrincipal?.nombre}
                      </div>
                    </div>
                    <div className="semana-historial-datos">
                      <div>
                        <span className="cifra">{horas(s.volumenGenerado)}h</span>
                        <span>volumen</span>
                      </div>
                      <div>
                        <span className="cifra">{h.cumplimiento?.cumplimiento ?? 0}%</span>
                        <span>cumplido</span>
                      </div>
                      <div>
                        <span className="cifra">{h.fatiga?.fatigaEstimada ?? "—"}</span>
                        <span>fatiga</span>
                      </div>
                    </div>
                  </summary>
                  {h.mensajeEntrenador && (
                    <p className="sutil" style={{ marginBottom: "0.75rem" }}>
                      {h.mensajeEntrenador}
                    </p>
                  )}
                  <div className="dias">
                    {DIAS.filter((d) => (s.sesiones || []).some((x) => x.dia === d.clave)).map((d) => {
                      const sesion = s.sesiones.find((x) => x.dia === d.clave);
                      const info = infoSesion(sesion.tipo);
                      const { Icono } = info;
                      return (
                        <div key={d.clave} className={`dia-fila ${info.clase}`}>
                          <span className="icono-zona">
                            <Icono size={18} />
                          </span>
                          <div className="dia-cuerpo">
                            <div className="dia-tipo">{sesion.tipo}</div>
                            <div className="dia-detalle">{d.nombre}</div>
                          </div>
                          <span className="cifra dia-duracion">{formatearMinutos(sesion.duracion)}</span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
