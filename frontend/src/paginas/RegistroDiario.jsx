import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import { TIPOS_SESION, fechaInput, formatearFecha, formatearMinutos } from "../utilidades";

// Escalas 0-10. "invertida" = un valor alto es malo (se colorea distinto).
const ESCALAS = [
  { campo: "sueno", titulo: "¿Cómo dormiste?", bajo: "Fatal", alto: "Excelente" },
  { campo: "energia", titulo: "Energía", bajo: "Sin energía", alto: "A tope" },
  { campo: "estres", titulo: "Estrés", bajo: "Tranquilo", alto: "Muy estresado", invertida: true },
  { campo: "dolorMuscular", titulo: "Dolor muscular", bajo: "Nada", alto: "Mucho", invertida: true },
];

const formInicial = () => ({
  fecha: fechaInput(),
  sueno: 7,
  energia: 7,
  estres: 3,
  dolorMuscular: 3,
  entrenoRealizado: false,
  entrenamientoRealizado: "Z2",
  duracionRealizada: 60,
  comentario: "",
});

function Escala({ escala, valor, onChange }) {
  const bueno = escala.invertida ? valor <= 3 : valor >= 7;
  const malo = escala.invertida ? valor >= 7 : valor <= 4;

  return (
    <label className="escala">
      <span className="escala-titulo">
        {escala.titulo}
        <output className={`escala-valor ${bueno ? "bien" : malo ? "mal" : ""}`}>{valor}</output>
      </span>
      <input
        type="range"
        min="0"
        max="10"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="escala-extremos">
        <span>{escala.bajo}</span>
        <span>{escala.alto}</span>
      </span>
    </label>
  );
}

export default function RegistroDiario() {
  const { setPerfil } = useSesion();
  const [form, setForm] = useState(formInicial);
  const [registros, setRegistros] = useState([]);
  const [estado, setEstado] = useState({ enviando: false, error: "", guardado: false });

  const cargarRegistros = () => api.registros().then(setRegistros).catch(() => {});

  useEffect(() => {
    cargarRegistros();
  }, []);

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const enviar = async (e) => {
    e.preventDefault();
    setEstado({ enviando: true, error: "", guardado: false });

    try {
      const datos = { ...form, fecha: new Date(`${form.fecha}T12:00:00`) };
      if (!datos.entrenoRealizado) {
        datos.entrenamientoRealizado = "";
        datos.duracionRealizada = 0;
      }

      await api.crearRegistro(datos);
      // La fatiga del perfil cambia con cada registro.
      api.yo().then(({ perfil }) => setPerfil(perfil)).catch(() => {});
      await cargarRegistros();
      setForm(formInicial());
      setEstado({ enviando: false, error: "", guardado: true });
    } catch (err) {
      setEstado({ enviando: false, error: mensajeDeError(err), guardado: false });
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await api.eliminarRegistro(id);
      await cargarRegistros();
    } catch (err) {
      setEstado((s) => ({ ...s, error: mensajeDeError(err) }));
    }
  };

  return (
    <div className="pila">
      <form className="tarjeta pila" onSubmit={enviar}>
        <div className="fila-titulo">
          <h1>¿Cómo te sientes hoy?</h1>
          <input
            type="date"
            aria-label="Fecha"
            value={form.fecha}
            max={fechaInput()}
            onChange={(e) => cambiar("fecha", e.target.value)}
          />
        </div>

        <div className="escalas">
          {ESCALAS.map((escala) => (
            <Escala
              key={escala.campo}
              escala={escala}
              valor={form[escala.campo]}
              onChange={(v) => cambiar(escala.campo, v)}
            />
          ))}
        </div>

        <label className="casilla">
          <input
            type="checkbox"
            checked={form.entrenoRealizado}
            onChange={(e) => cambiar("entrenoRealizado", e.target.checked)}
          />
          Entrené hoy
        </label>

        {form.entrenoRealizado && (
          <div className="fila-campos">
            <label>
              Sesión
              <select
                value={form.entrenamientoRealizado}
                onChange={(e) => cambiar("entrenamientoRealizado", e.target.value)}
              >
                {TIPOS_SESION.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Duración (min)
              <input
                type="number"
                min="0"
                max="900"
                step="5"
                value={form.duracionRealizada}
                onChange={(e) => cambiar("duracionRealizada", Number(e.target.value))}
              />
            </label>
          </div>
        )}

        <label>
          Comentario <span className="sutil">(opcional)</span>
          <textarea
            rows="2"
            maxLength="500"
            value={form.comentario}
            onChange={(e) => cambiar("comentario", e.target.value)}
          />
        </label>

        {estado.error && (
          <p className="alerta alerta-error" role="alert">
            {estado.error}
          </p>
        )}
        {estado.guardado && (
          <p className="alerta alerta-exito" role="status">
            Registro guardado. <Link to="/">Ver cómo se ajustó tu semana</Link>.
          </p>
        )}

        <button className="boton" disabled={estado.enviando}>
          {estado.enviando ? "Guardando…" : "Guardar registro"}
        </button>
      </form>

      {registros.length > 0 && (
        <section className="tarjeta">
          <h2>Últimos registros</h2>
          <ul className="lista">
            {registros.slice(0, 10).map((r) => (
              <li key={r._id} className="lista-item">
                <div>
                  <strong>{formatearFecha(r.fecha, { weekday: "short", day: "numeric", month: "short" })}</strong>
                  <span className="sutil">
                    {" "}
                    · Sueño {r.sueno} · Energía {r.energia} · Estrés {r.estres} · Dolor {r.dolorMuscular}
                  </span>
                  <div className="sutil">
                    {r.entrenoRealizado
                      ? `${r.entrenamientoRealizado} · ${formatearMinutos(r.duracionRealizada)}`
                      : "Sin entrenamiento"}
                    {r.comentario && ` · “${r.comentario}”`}
                  </div>
                </div>
                <button className="boton-texto peligro" onClick={() => eliminar(r._id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
