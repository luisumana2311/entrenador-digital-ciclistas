import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import { DISCIPLINAS, formatearFecha } from "../utilidades";

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

export default function Objetivos() {
  const { perfil } = useSesion();
  const [objetivos, setObjetivos] = useState([]);
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

  const cargar = () => api.objetivos().then(setObjetivos).catch((e) => setError(mensajeDeError(e)));

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

  const principal = idPrincipal(objetivos);

  return (
    <div className="pila">
      <section className="tarjeta">
        <h1>Mis objetivos</h1>
        {objetivos.length === 0 ? (
          <p className="sutil">Todavía no tienes objetivos. Agrega tu próxima competencia abajo.</p>
        ) : (
          <ul className="lista">
            {objetivos.map((o) => (
              <li key={o._id} className={`lista-item ${o.estado !== "Activo" ? "apagado" : ""}`}>
                <div>
                  <strong>{o.nombre}</strong>{" "}
                  {o._id === principal && <span className="insignia">Principal</span>}
                  {o.estado !== "Activo" && <span className="insignia insignia-gris">{o.estado}</span>}
                  <div className="sutil">
                    {o.disciplina} · {formatearFecha(o.fechaObjetivo, { day: "numeric", month: "long", year: "numeric" })} ·
                    Prioridad {o.prioridad}
                    {o.distancia > 0 && ` · ${o.distancia} km`}
                    {o.desnivel > 0 && ` · ${o.desnivel} m+`}
                  </div>
                </div>
                <div className="acciones">
                  {o.estado === "Activo" ? (
                    <button className="boton-texto" onClick={() => cambiarEstado(o._id, "Completado")}>
                      Completado
                    </button>
                  ) : (
                    <button className="boton-texto" onClick={() => cambiarEstado(o._id, "Activo")}>
                      Reactivar
                    </button>
                  )}
                  <button className="boton-texto peligro" onClick={() => eliminar(o._id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {principal && (
          <p>
            <Link to="/">Ver mi semana →</Link>
          </p>
        )}
      </section>

      <form className="tarjeta pila" onSubmit={crear}>
        <h2>Nuevo objetivo</h2>
        <label>
          Nombre
          <input required placeholder="Ej. Vuelta al Volcán" value={form.nombre} onChange={cambiar("nombre")} />
        </label>
        <div className="fila-campos">
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
          <label>
            Prioridad
            <select value={form.prioridad} onChange={cambiar("prioridad")}>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </label>
        </div>
        <div className="fila-campos">
          <label>
            Distancia (km)
            <input type="number" min="0" value={form.distancia} onChange={cambiar("distancia")} />
          </label>
          <label>
            Desnivel (m)
            <input type="number" min="0" value={form.desnivel} onChange={cambiar("desnivel")} />
          </label>
        </div>
        {error && (
          <p className="alerta alerta-error" role="alert">
            {error}
          </p>
        )}
        <button className="boton" disabled={enviando}>
          {enviando ? "Guardando…" : "Agregar objetivo"}
        </button>
      </form>
    </div>
  );
}
