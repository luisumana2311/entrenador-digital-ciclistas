import { useState } from "react";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import EditorDisponibilidad from "../componentes/EditorDisponibilidad";
import { DISCIPLINAS, DISPONIBILIDAD_VACIA } from "../utilidades";

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
        modo === "login"
          ? await api.login(form.email, form.password)
          : await api.registrar(form);
      await iniciar(respuesta);
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  };

  const esRegistro = modo === "registro";

  return (
    <div className="acceso">
      <div className="acceso-intro">
        <img src="/icono.svg" alt="" width="56" height="56" />
        <h1>Entrenador Digital</h1>
        <p>Tu plan semanal de ciclismo, adaptado al tiempo que tienes y a cómo te sientes.</p>
      </div>

      <form className="tarjeta acceso-form" onSubmit={enviar}>
        <div className="pestanas" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!esRegistro}
            className={!esRegistro ? "activa" : ""}
            onClick={() => setModo("login")}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={esRegistro}
            className={esRegistro ? "activa" : ""}
            onClick={() => setModo("registro")}
          >
            Crear cuenta
          </button>
        </div>

        {esRegistro && (
          <label>
            Nombre
            <input required value={form.nombre} onChange={cambiar("nombre")} autoComplete="name" />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={cambiar("email")}
            autoComplete="email"
          />
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
          />
          {esRegistro && <small className="sutil">Mínimo 8 caracteres</small>}
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
            {error}
          </p>
        )}

        <button className="boton" disabled={enviando}>
          {enviando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
