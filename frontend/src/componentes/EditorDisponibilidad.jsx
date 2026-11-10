import { DIAS } from "../utilidades";

// Horas disponibles por día (0 = no entrena ese día).
export default function EditorDisponibilidad({ valor, onChange, oscuro = false }) {
  const total = DIAS.reduce((suma, d) => suma + (Number(valor[d.clave]) || 0), 0);

  return (
    <div>
      <div className="disponibilidad-total">
        <span>Horas disponibles por día</span>
        <span>
          <span className="cifra">{total}</span> <span className={oscuro ? "" : "sutil"}>h / semana</span>
        </span>
      </div>
      <div className="disponibilidad-dias">
        {DIAS.map((d) => (
          <label key={d.clave} className={`dia-horas ${valor[d.clave] > 0 ? "activo" : ""}`}>
            {d.corto}
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              inputMode="decimal"
              aria-label={`Horas el ${d.nombre}`}
              value={valor[d.clave] ?? 0}
              onChange={(e) =>
                onChange({ ...valor, [d.clave]: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}
