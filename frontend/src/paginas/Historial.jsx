import { useEffect, useState } from "react";
import { api, mensajeDeError } from "../api";
import { formatearFecha, formatearMinutos } from "../utilidades";

export default function Historial() {
  const [semanas, setSemanas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.historial().then(setSemanas).catch((e) => setError(mensajeDeError(e)));
  }, []);

  if (error) {
    return (
      <p className="alerta alerta-error" role="alert">
        {error}
      </p>
    );
  }

  if (!semanas) return <p className="sutil">Cargando historial…</p>;

  return (
    <div className="pila">
      <h1>Historial</h1>
      {semanas.length === 0 && (
        <p className="tarjeta sutil">Aún no hay semanas guardadas. Se guardan al abrir “Mi semana”.</p>
      )}
      {semanas.map((h) => {
        const s = h.semanaGenerada || {};
        return (
          <details key={h._id} className="tarjeta semana-historial">
            <summary>
              <span>
                <strong>Semana del {formatearFecha(h.fechaInicioSemana, { day: "numeric", month: "long" })}</strong>
                <span className="sutil"> · {s.fase || "—"}</span>
              </span>
              <span className="historial-datos">
                <span>{formatearMinutos(s.volumenGenerado)}</span>
                <span>Cumpl. {h.cumplimiento?.cumplimiento ?? 0}%</span>
                <span>Fatiga {h.fatiga?.fatigaEstimada ?? "—"}</span>
              </span>
            </summary>
            <p className="sutil">{h.mensajeEntrenador}</p>
            <ul className="lista">
              {(s.sesiones || []).map((sesion) => (
                <li key={sesion.dia} className="lista-item">
                  <span className="capitalizar">{sesion.dia}</span>
                  <span>
                    {sesion.tipo} · {formatearMinutos(sesion.duracion)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
