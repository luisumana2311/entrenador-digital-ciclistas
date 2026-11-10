import { useState } from "react";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import EditorDisponibilidad from "../componentes/EditorDisponibilidad";
import { DISCIPLINAS, DISPONIBILIDAD_VACIA } from "../utilidades";

const numeroONulo = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

export default function Perfil() {
  const { perfil, setPerfil, usuario, cerrarSesion } = useSesion();
  const [estado, setEstado] = useState({ enviando: false, error: "", guardado: false });
  const [form, setForm] = useState(() => ({
    nombre: perfil.nombre || "",
    edad: perfil.edad ?? "",
    peso: perfil.peso ?? "",
    estatura: perfil.estatura ?? "",
    ftp: perfil.ftp ?? "",
    disciplinaPrincipal: perfil.disciplinaPrincipal || "MTB Marathon",
    disponibilidad: { ...DISPONIBILIDAD_VACIA, ...perfil.disponibilidad },
  }));

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setEstado({ enviando: true, error: "", guardado: false });
    try {
      const actualizado = await api.actualizarPerfil({
        ...form,
        edad: numeroONulo(form.edad),
        peso: numeroONulo(form.peso),
        estatura: numeroONulo(form.estatura),
        ftp: numeroONulo(form.ftp),
      });
      setPerfil(actualizado);
      setEstado({ enviando: false, error: "", guardado: true });
    } catch (err) {
      setEstado({ enviando: false, error: mensajeDeError(err), guardado: false });
    }
  };

  const eliminarCuenta = async () => {
    const ok = confirm(
      "Se borrarán tu cuenta, objetivos, registros e historial. Esto no se puede deshacer. ¿Continuar?",
    );
    if (!ok) return;
    try {
      await api.eliminarCuenta();
      cerrarSesion();
    } catch (err) {
      setEstado((s) => ({ ...s, error: mensajeDeError(err) }));
    }
  };

  return (
    <div className="pila">
      <form className="tarjeta pila" onSubmit={guardar}>
        <div className="fila-titulo">
          <h1>Mi perfil</h1>
          <span className="sutil">{usuario.email}</span>
        </div>

        <div className="estado-actual">
          <span>
            Fatiga actual: <strong>{perfil.fatiga}/10</strong>
          </span>
          <span className="sutil">Se calcula con tu último registro diario.</span>
        </div>

        <label>
          Nombre
          <input required value={form.nombre} onChange={cambiar("nombre")} />
        </label>

        <div className="fila-campos">
          <label>
            Edad
            <input type="number" min="10" max="100" value={form.edad} onChange={cambiar("edad")} />
          </label>
          <label>
            Peso (kg)
            <input type="number" min="30" max="200" step="0.1" value={form.peso} onChange={cambiar("peso")} />
          </label>
          <label>
            Estatura (cm)
            <input type="number" min="100" max="230" value={form.estatura} onChange={cambiar("estatura")} />
          </label>
          <label>
            FTP (W)
            <input type="number" min="50" max="600" value={form.ftp} onChange={cambiar("ftp")} />
          </label>
        </div>

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

        {estado.error && (
          <p className="alerta alerta-error" role="alert">
            {estado.error}
          </p>
        )}
        {estado.guardado && (
          <p className="alerta alerta-exito" role="status">
            Perfil actualizado. Tu próxima semana usará estos datos.
          </p>
        )}

        <button className="boton" disabled={estado.enviando}>
          {estado.enviando ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      <section className="tarjeta zona-peligro">
        <h2>Eliminar cuenta</h2>
        <p className="sutil">Borra tu cuenta y todos tus datos de forma permanente.</p>
        <button className="boton boton-peligro" onClick={eliminarCuenta}>
          Eliminar mi cuenta
        </button>
      </section>
    </div>
  );
}
