import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CircleCheck, Trash2 } from "lucide-react";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import {
  INFO_SESION,
  TIPOS_SESION,
  fechaInput,
  formatearFecha,
  formatearMinutos,
  infoSesion,
  INFO_DESCANSO,
} from "../utilidades";

// invertida = un valor alto es malo (estrés, dolor).
// caras: [bien, regular, mal], en el mismo orden que nivel().
const ESCALAS = [
  { campo: "sueno", titulo: "¿Cómo dormiste?", bajo: "Fatal", alto: "Excelente", caras: ["😴", "😐", "😫"] },
  { campo: "energia", titulo: "Energía", bajo: "Sin pilas", alto: "A tope", caras: ["⚡", "🙂", "🪫"] },
  { campo: "estres", titulo: "Estrés", bajo: "Tranquilo", alto: "Al límite", invertida: true, caras: ["😌", "😕", "🤯"] },
  { campo: "dolorMuscular", titulo: "Dolor muscular", bajo: "Nada", alto: "Mucho", invertida: true, caras: ["💪", "😬", "🥵"] },
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

// 0 = bien, 1 = regular, 2 = mal
const nivel = (valor, invertida) => {
  const bueno = invertida ? valor <= 3 : valor >= 7;
  const malo = invertida ? valor >= 7 : valor <= 4;
  return bueno ? 0 : malo ? 2 : 1;
};

const COLORES = ["var(--exito)", "var(--z-umbral)", "var(--peligro)"];

function Escala({ escala, valor, onChange }) {
  const n = nivel(valor, escala.invertida);

  return (
    <label className="escala">
      <span className="escala-cabecera">
        <span className="escala-emoji" aria-hidden="true">
          {escala.caras[n]}
        </span>
        <strong>{escala.titulo}</strong>
        <output className={`cifra escala-valor ${n === 0 ? "bien" : n === 2 ? "mal" : ""}`}>{valor}</output>
      </span>
      <input
        type="range"
        min="0"
        max="10"
        value={valor}
        aria-label={escala.titulo}
        style={{ "--progreso": `${valor * 10}%`, "--relleno": COLORES[n] }}
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
      api.yo().then(({ perfil }) => setPerfil(perfil)).catch(() => {});
      await cargarRegistros();
      setForm(formInicial());
      setEstado({ enviando: false, error: "", guardado: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="pila-lg">
      <header className="encabezado-pagina">
        <div>
          <p className="sobretitulo">Registro diario</p>
          <h1>¿Cómo te sientes hoy?</h1>
          <p>Diez segundos. Con esto el plan se ajusta a tu día.</p>
        </div>
        <input
          type="date"
          aria-label="Fecha del registro"
          value={form.fecha}
          max={fechaInput()}
          onChange={(e) => cambiar("fecha", e.target.value)}
          style={{ width: "auto" }}
        />
      </header>

      {estado.guardado && (
        <p className="alerta alerta-exito" role="status">
          <CircleCheck size={18} />
          <span>
            Registro guardado. <Link to="/">Mira cómo se ajustó tu semana →</Link>
          </span>
        </p>
      )}

      <form className="pila" onSubmit={enviar}>
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

        <label className="interruptor">
          <span>
            <strong>Entrené hoy</strong>
            <span className="ayuda" style={{ display: "block" }}>
              Cuenta para tu cumplimiento semanal
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={form.entrenoRealizado}
            onChange={(e) => cambiar("entrenoRealizado", e.target.checked)}
          />
        </label>

        {form.entrenoRealizado && (
          <section className="tarjeta pila">
            <h3>¿Qué hiciste?</h3>
            <div className="opciones-sesion" role="group" aria-label="Tipo de sesión">
              {TIPOS_SESION.map((tipo) => {
                const { clase, Icono } = INFO_SESION[tipo];
                return (
                  <button
                    key={tipo}
                    type="button"
                    className={`opcion-sesion ${clase}`}
                    aria-pressed={form.entrenamientoRealizado === tipo}
                    onClick={() => cambiar("entrenamientoRealizado", tipo)}
                  >
                    <span className="icono-zona">
                      <Icono size={17} />
                    </span>
                    {tipo}
                  </button>
                );
              })}
            </div>
            <label style={{ maxWidth: 220 }}>
              Duración (minutos)
              <input
                type="number"
                min="0"
                max="900"
                step="5"
                value={form.duracionRealizada}
                onChange={(e) => cambiar("duracionRealizada", Number(e.target.value))}
              />
            </label>
          </section>
        )}

        <label>
          <span>
            Comentario <span className="ayuda">(opcional)</span>
          </span>
          <textarea
            rows="2"
            maxLength="500"
            placeholder="Viento en contra, piernas pesadas, buen día…"
            value={form.comentario}
            onChange={(e) => cambiar("comentario", e.target.value)}
          />
        </label>

        {estado.error && (
          <p className="alerta alerta-error" role="alert">
            <AlertCircle size={18} />
            {estado.error}
          </p>
        )}

        <button className="boton boton-lima boton-ancho" disabled={estado.enviando}>
          {estado.enviando ? "Guardando…" : "Guardar registro"}
        </button>
      </form>

      {registros.length > 0 && (
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Últimos días</h2>
          </div>
          <div>
            {registros.slice(0, 10).map((r) => {
              const info = r.entrenoRealizado ? infoSesion(r.entrenamientoRealizado) : INFO_DESCANSO;
              const { Icono } = info;
              return (
                <div key={r._id} className={`registro-item ${info.clase}`}>
                  <span className="icono-zona">
                    <Icono size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong className="capitalizar">
                      {formatearFecha(r.fecha, { weekday: "long", day: "numeric", month: "short" })}
                    </strong>
                    <span className="sutil">
                      {" · "}
                      {r.entrenoRealizado
                        ? `${r.entrenamientoRealizado} ${formatearMinutos(r.duracionRealizada)}`
                        : "Sin entrenar"}
                    </span>
                    <div className="registro-puntos">
                      <span>😴 {r.sueno}</span>
                      <span>⚡ {r.energia}</span>
                      <span>🧠 {r.estres}</span>
                      <span>🦵 {r.dolorMuscular}</span>
                    </div>
                    {r.comentario && (
                      <p className="sutil" style={{ fontSize: "0.82rem", marginTop: "0.25rem" }}>
                        “{r.comentario}”
                      </p>
                    )}
                  </div>
                  <button
                    className="boton-icono peligro"
                    onClick={() => eliminar(r._id)}
                    aria-label="Eliminar registro"
                    title="Eliminar"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
