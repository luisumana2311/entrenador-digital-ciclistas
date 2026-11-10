import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, Check, Flag, Mountain, Plus, RotateCcw, Route, Trash2 } from "lucide-react";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import { DISCIPLINAS, diasHasta, formatearFecha } from "../utilidades";

const PRIORIDADES = { Alta: 3, Media: 2, Baja: 1 };

// Misma regla que el backend: activo, mayor prioridad y fecha más cercana.
const idPrincipal = (objetivos) =>
  objetivos
    .filter((o) => o.estado === "Activo")
    .sort(
      (a, b) =>
        PRIORIDADES[b.prioridad] - PRIORIDADES[a.prioridad] ||
        new Date(a.fechaObjetivo) - new Date(b.fechaObjetivo),
    )[0]?._id;

function TarjetaObjetivo({ objetivo, principal, onEstado, onEliminar }) {
  const dias = diasHasta(objetivo.fechaObjetivo);
  const activo = objetivo.estado === "Activo";

  return (
    <article className={`tarjeta objetivo ${principal ? "principal" : ""} ${activo ? "" : "apagado"}`}>
      <div className="objetivo-cabecera">
        <div>
          <p className="sobretitulo">{objetivo.disciplina}</p>
          <h3>{objetivo.nombre}</h3>
        </div>
        {principal ? (
          <span className="chip chip-lima">Principal</span>
        ) : (
          <span className="chip">{activo ? `Prioridad ${objetivo.prioridad}` : objetivo.estado}</span>
        )}
      </div>

      <div className="objetivo-cuenta">
        {activo && dias >= 0 ? (
          <>
            <span className="cifra">{dias}</span>
            <span className="sutil">{dias === 1 ? "día" : "días"} · {formatearFecha(objetivo.fechaObjetivo, { day: "numeric", month: "long", year: "numeric" })}</span>
          </>
        ) : (
          <span className="sutil">{formatearFecha(objetivo.fechaObjetivo, { day: "numeric", month: "long", year: "numeric" })}</span>
        )}
      </div>

      {(objetivo.distancia > 0 || objetivo.desnivel > 0) && (
        <div className="objetivo-datos">
          {objetivo.distancia > 0 && (
            <span className="chip">
              <Route size={14} /> {objetivo.distancia} km
            </span>
          )}
          {objetivo.desnivel > 0 && (
            <span className="chip">
              <Mountain size={14} /> {objetivo.desnivel} m+
            </span>
          )}
        </div>
      )}

      <div className="objetivo-pie">
        {activo ? (
          <button className="boton boton-suave" onClick={() => onEstado(objetivo._id, "Completado")}>
            <Check size={16} /> Completado
          </button>
        ) : (
          <button className="boton boton-suave" onClick={() => onEstado(objetivo._id, "Activo")}>
            <RotateCcw size={16} /> Reactivar
          </button>
        )}
        <button className="boton-icono peligro" onClick={() => onEliminar(objetivo._id)} aria-label="Eliminar objetivo" title="Eliminar">
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}

export default function Objetivos() {
  const { perfil } = useSesion();
  const [objetivos, setObjetivos] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    disciplina: perfil?.disciplinaPrincipal || "MTB Marathon",
    fechaObjetivo: "",
    prioridad: "Alta",
    distancia: "",
    desnivel: "",
  });

  const cargar = () =>
    api
      .objetivos()
      .then(setObjetivos)
      .catch((e) => setError(mensajeDeError(e)));

  useEffect(() => {
    cargar();
  }, []);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await api.crearObjetivo({
        ...form,
        // Mediodía local: "2027-02-14" a secas se guarda como medianoche UTC
        // y en América se mostraría como el día anterior.
        fechaObjetivo: new Date(`${form.fechaObjetivo}T12:00:00`),
        distancia: Number(form.distancia) || 0,
        desnivel: Number(form.desnivel) || 0,
      });
      setForm({ ...form, nombre: "", fechaObjetivo: "", distancia: "", desnivel: "" });
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.actualizarObjetivo(id, { estado });
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este objetivo?")) return;
    try {
      await api.eliminarObjetivo(id);
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const principal = objetivos ? idPrincipal(objetivos) : null;

  return (
    <div className="pila-lg">
      <header className="encabezado-pagina">
        <div>
          <p className="sobretitulo">Objetivos</p>
          <h1>Tus carreras y retos</h1>
          <p>El plan se arma alrededor del objetivo principal: el activo de mayor prioridad y fecha más cercana.</p>
        </div>
        {principal && (
          <Link className="boton boton-suave" to="/">
            Ver mi semana
          </Link>
        )}
      </header>

      {objetivos && objetivos.length === 0 && (
        <section className="tarjeta vacio">
          <span className="vacio-icono">
            <Flag size={30} />
          </span>
          <h2>Sin objetivos todavía</h2>
          <p>Agrega tu próxima carrera abajo. Con la fecha sabemos en qué fase estás.</p>
        </section>
      )}

      {objetivos && objetivos.length > 0 && (
        <div className="objetivos">
          {objetivos.map((o) => (
            <TarjetaObjetivo
              key={o._id}
              objetivo={o}
              principal={o._id === principal}
              onEstado={cambiarEstado}
              onEliminar={eliminar}
            />
          ))}
        </div>
      )}

      <form className="tarjeta pila" onSubmit={crear}>
        <div className="tarjeta-titulo" style={{ marginBottom: 0 }}>
          <h2>Nuevo objetivo</h2>
          <Plus size={20} className="sutil" />
        </div>
        <label>
          Nombre
          <input required placeholder="Ej. Vuelta al Volcán" value={form.nombre} onChange={cambiar("nombre")} />
        </label>
        <div className="campos">
          <label>
            Disciplina
            <select value={form.disciplina} onChange={cambiar("disciplina")}>
              {DISCIPLINAS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input type="date" required value={form.fechaObjetivo} onChange={cambiar("fechaObjetivo")} />
          </label>
        </div>
        <label>
          Prioridad
          <div className="segmentado">
            {["Alta", "Media", "Baja"].map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={form.prioridad === p}
                onClick={() => setForm({ ...form, prioridad: p })}
              >
                {p}
              </button>
            ))}
          </div>
        </label>
        <div className="campos">
          <label>
            Distancia (km)
            <input type="number" min="0" placeholder="Opcional" value={form.distancia} onChange={cambiar("distancia")} />
          </label>
          <label>
            Desnivel (m)
            <input type="number" min="0" placeholder="Opcional" value={form.desnivel} onChange={cambiar("desnivel")} />
          </label>
        </div>
        {error && (
          <p className="alerta alerta-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </p>
        )}
        <button className="boton boton-lima" disabled={enviando}>
          {enviando ? "Guardando…" : "Agregar objetivo"}
        </button>
      </form>
    </div>
  );
}
