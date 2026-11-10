import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import { Marca } from "../componentes/Marco";
import EditorDisponibilidad from "../componentes/EditorDisponibilidad";
import { DIAS, DISCIPLINAS, DISPONIBILIDAD_VACIA, INFO_SESION } from "../utilidades";

// Semana de ejemplo para el panel de bienvenida (solo decorativa).
const DEMO = [
  { tipo: null, min: 0 },
  { tipo: "VO2", min: 90 },
  { tipo: null, min: 0 },
  { tipo: "Umbral", min: 90 },
  { tipo: "Z2", min: 60 },
  { tipo: "Fondo Largo", min: 240 },
  { tipo: "Recuperación", min: 60 },
];

function SemanaDemo() {
  return (
    <div className="acceso-demo" aria-hidden="true">
      <p className="sobretitulo" style={{ color: "var(--lima)" }}>
        Así se ve tu semana
      </p>
      <div className="grafica" style={{ height: 140, marginTop: "1rem" }}>
        {DEMO.map((d, i) => {
          const info = d.tipo ? INFO_SESION[d.tipo] : null;
          return (
            <div key={i} className={`grafica-col ${info ? info.clase : "zona-descanso"}`}>
              <div className="grafica-barra" style={{ height: `${Math.max(5, (d.min / 240) * 100)}%` }} />
              <span className="grafica-dia" style={{ color: "var(--bosque-sutil)" }}>
                {DIAS[i].corto}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Acceso() {
  const { iniciar } = useSesion();
  const [modo, setModo] = useState("login");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    disciplinaPrincipal: "MTB Marathon",
    disponibilidad: { ...DISPONIBILIDAD_VACIA, martes: 1.5, jueves: 1.5, sabado: 4, domingo: 3 },
  });

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const respuesta =
        modo === "login" ? await api.login(form.email, form.password) : await api.registrar(form);
      await iniciar(respuesta);
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  };

  const esRegistro = modo === "registro";

  return (
    <div className="acceso">
      <section className="acceso-panel">
        <Marca />
        <div>
          <h1>
            Entrena con lo
            <br />
            que <em>realmente</em>
            <br />
            tienes.
          </h1>
          <p>
            Un plan semanal de ciclismo que se ajusta a tus horas libres, a tu próxima carrera y a
            cómo amaneciste hoy.
          </p>
        </div>
        <SemanaDemo />
      </section>

      <section className="acceso-formulario">
        <form onSubmit={enviar}>
          <div>
            <h2>{esRegistro ? "Crea tu cuenta" : "Bienvenido de vuelta"}</h2>
            <p className="sutil" style={{ marginTop: "0.35rem" }}>
              {esRegistro
                ? "Dos minutos y tienes tu primera semana."
                : "Entra para ver lo que toca hoy."}
            </p>
          </div>

          <div className="segmentado" role="tablist">
            <button type="button" role="tab" aria-selected={!esRegistro} onClick={() => setModo("login")}>
              Iniciar sesión
            </button>
            <button type="button" role="tab" aria-selected={esRegistro} onClick={() => setModo("registro")}>
              Crear cuenta
            </button>
          </div>

          {esRegistro && (
            <label>
              Nombre
              <input required value={form.nombre} onChange={cambiar("nombre")} autoComplete="name" placeholder="¿Cómo te llamas?" />
            </label>
          )}

          <label>
            Email
            <input type="email" required value={form.email} onChange={cambiar("email")} autoComplete="email" placeholder="tu@correo.com" />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              required
              minLength={esRegistro ? 8 : undefined}
              value={form.password}
              onChange={cambiar("password")}
              autoComplete={esRegistro ? "new-password" : "current-password"}
              placeholder={esRegistro ? "Mínimo 8 caracteres" : ""}
            />
          </label>

          {esRegistro && (
            <>
              <label>
                Disciplina principal
                <select value={form.disciplinaPrincipal} onChange={cambiar("disciplinaPrincipal")}>
                  {DISCIPLINAS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <EditorDisponibilidad
                valor={form.disponibilidad}
                onChange={(disponibilidad) => setForm({ ...form, disponibilidad })}
              />
            </>
          )}

          {error && (
            <p className="alerta alerta-error" role="alert">
              <AlertCircle size={18} />
              {error}
            </p>
          )}

          <button className="boton boton-lima boton-ancho" disabled={enviando}>
            {enviando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Entrar"}
            {!enviando && <ArrowRight size={18} />}
          </button>
        </form>
      </section>
    </div>
  );
}
