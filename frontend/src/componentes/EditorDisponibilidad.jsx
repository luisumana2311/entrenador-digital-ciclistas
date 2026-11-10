import { DIAS } from "../utilidades";

// Horas disponibles por día (0 = no entrena ese día).
export default function EditorDisponibilidad({ valor, onChange }) {
  const total = DIAS.reduce((suma, d) => suma + (Number(valor[d.clave]) || 0), 0);

  return (
    <fieldset className="disponibilidad">
      <legend>
        Horas disponibles por día <span className="sutil">· {total} h por semana</span>
      </legend>
      <div className="disponibilidad-dias">
        {DIAS.map((d) => (
          <label key={d.clave} className="dia-horas">
            <span>{d.corto}</span>
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              inputMode="decimal"
              value={valor[d.clave] ?? 0}
              onChange={(e) =>
                onChange({ ...valor, [d.clave]: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
