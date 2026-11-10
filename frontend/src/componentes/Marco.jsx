import { NavLink, Outlet } from "react-router";
import { useSesion } from "../sesion";

const ENLACES = [
  { a: "/", texto: "Mi semana", icono: "📅", fin: true },
  { a: "/hoy", texto: "Hoy", icono: "✍️" },
  { a: "/objetivos", texto: "Objetivos", icono: "🏁" },
  { a: "/historial", texto: "Historial", icono: "📈" },
  { a: "/perfil", texto: "Perfil", icono: "👤" },
];

// Encabezado + navegación (barra inferior en móvil, superior en escritorio).
export default function Marco() {
  const { perfil, cerrarSesion } = useSesion();

  return (
    <div className="marco">
      <header className="encabezado">
        <div className="marca">
          <img src="/icono.svg" alt="" width="28" height="28" />
          <span>Entrenador Digital</span>
        </div>
        <nav className="nav-escritorio" aria-label="Principal">
          {ENLACES.map((e) => (
            <NavLink key={e.a} to={e.a} end={e.fin}>
              {e.texto}
            </NavLink>
          ))}
        </nav>
        <div className="usuario">
          <span className="usuario-nombre">{perfil?.nombre}</span>
          <button className="boton-texto" onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </header>

      <main className="contenido">
        <Outlet />
      </main>

      <nav className="nav-movil" aria-label="Principal">
        {ENLACES.map((e) => (
          <NavLink key={e.a} to={e.a} end={e.fin}>
            <span aria-hidden="true">{e.icono}</span>
            {e.texto}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
