import { useState } from "react";
import { AlertCircle, CircleCheck, Zap } from "lucide-react";
import { api, mensajeDeError } from "../api";
import { useSesion } from "../sesion";
import EditorDisponibilidad from "../componentes/EditorDisponibilidad";
import Anillo from "../componentes/Anillo";
import { DISCIPLINAS, DISPONIBILIDAD_VACIA, ZONAS_FTP, iniciales } from "../utilidades";

const numeroONulo = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

const estadoFatiga = (f) => (f <= 3 ? "Fresco" : f <= 6 ? "Fatiga moderada" : "Fatiga alta");

function ZonasPotencia({ ftp }) {
  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>Tus zonas de potencia</h2>
        <Zap size={20} className="sutil" />
      </div>
      {ftp ? (
        <div className="zonas-ftp">
          {ZONAS_FTP.map((z) => (
            <div key={z.zona} className={`zona-ftp ${z.clase}`}>
              <b>{z.zona}</b>
              <span>{z.nombre}</span>
              <span className="cifra">
                {z.rango[0] === 0 ? "< " : `${Math.round((ftp * z.rango[0]) / 100)}–`}
                {Math.round((ftp * z.rango[1]) / 100)} W
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="sutil">Escribe tu FTP arriba y aquí verás los vatios de cada zona.</p>
      )}
    </section>
  );
}

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

  const ftp = numeroONulo(form.ftp);
  const wkg = ftp && form.peso ? (ftp / Number(form.peso)).toFixed(1) : null;

  return (
    <div className="pila-lg">
      <header className="tarjeta perfil-estado">
        <span className="avatar" style={{ width: 56, height: 56, fontSize: "1.4rem" }}>
          {iniciales(perfil.nombre)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{perfil.nombre}</h2>
          <p className="sutil" style={{ fontSize: "0.85rem" }}>
            {usuario.email}
          </p>
        </div>
        <Anillo valor={perfil.fatiga * 10} tamano={60} grosor={7}>
          <span className="cifra" style={{ fontSize: "1.2rem" }}>
            {perfil.fatiga}
          </span>
        </Anillo>
        <div style={{ fontSize: "0.8rem", lineHeight: 1.3 }}>
          <strong>{estadoFatiga(perfil.fatiga)}</strong>
          <div className="sutil">Fatiga /10, de tu último registro</div>
        </div>
      </header>

      <div className="columnas">
        <form className="tarjeta pila" onSubmit={guardar}>
          <h2>Tus datos</h2>

          <label>
            Nombre
            <input required value={form.nombre} onChange={cambiar("nombre")} />
          </label>

          <div className="campos">
            <label>
              FTP (vatios)
              <input type="number" min="50" max="600" placeholder="Ej. 230" value={form.ftp} onChange={cambiar("ftp")} />
            </label>
            <label>
              Peso (kg)
              <input type="number" min="30" max="200" step="0.1" value={form.peso} onChange={cambiar("peso")} />
            </label>
          </div>
          {wkg && (
            <p className="chip" style={{ alignSelf: "flex-start" }}>
              <span className="cifra" style={{ fontSize: "1rem" }}>{wkg}</span> W/kg
            </p>
          )}

          <div className="campos">
            <label>
              Edad
              <input type="number" min="10" max="100" value={form.edad} onChange={cambiar("edad")} />
            </label>
            <label>
              Estatura (cm)
              <input type="number" min="100" max="230" value={form.estatura} onChange={cambiar("estatura")} />
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
              <AlertCircle size={18} />
              {estado.error}
            </p>
          )}
          {estado.guardado && (
            <p className="alerta alerta-exito" role="status">
              <CircleCheck size={18} />
              Guardado. Tu próxima semana usará estos datos.
            </p>
          )}

          <button className="boton boton-lima" disabled={estado.enviando}>
            {estado.enviando ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>

        <div className="pila">
          <ZonasPotencia ftp={ftp} />
          <section className="tarjeta zona-peligro pila">
            <h3>Eliminar cuenta</h3>
            <p className="sutil" style={{ fontSize: "0.88rem" }}>
              Borra tu cuenta, objetivos, registros e historial. No se puede deshacer.
            </p>
            <button className="boton boton-peligro" style={{ alignSelf: "flex-start" }} onClick={eliminarCuenta}>
              Eliminar mi cuenta
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
