import { NavLink, Outlet } from "react-router";
import { Bike, CalendarDays, ChartLine, Flag, LogOut, PenLine, User } from "lucide-react";
import { useSesion } from "../sesion";
import { iniciales } from "../utilidades";

const ENLACES = [
  { a: "/", texto: "Mi semana", Icono: CalendarDays, fin: true },
  { a: "/hoy", texto: "Hoy", Icono: PenLine },
  { a: "/objetivos", texto: "Objetivos", Icono: Flag },
  { a: "/historial", texto: "Historial", Icono: ChartLine },
  { a: "/perfil", texto: "Perfil", Icono: User },
];

export function Marca() {
  return (
    <span className="marca">
      <span className="marca-icono">
        <Bike size={20} strokeWidth={2.4} />
      </span>
      Entrenador Digital
    </span>
  );
}

// Barra lateral en escritorio; barra superior + navegación flotante en móvil.
export default function Marco() {
  const { perfil, usuario, cerrarSesion } = useSesion();

  return (
    <div className="marco">
      <aside className="lateral">
        <Marca />
        <nav className="nav-lateral" aria-label="Principal">
          {ENLACES.map(({ a, texto, Icono, fin }) => (
            <NavLink key={a} to={a} end={fin}>
              <Icono size={19} />
              {texto}
            </NavLink>
          ))}
        </nav>
        <div className="lateral-usuario">
          <span className="avatar">{iniciales(perfil?.nombre)}</span>
          <div className="lateral-usuario-datos">
            {perfil?.nombre}
            <span>{usuario?.email}</span>
          </div>
          <button className="boton-icono" onClick={cerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <header className="barra-movil">
        <Marca />
        <button className="boton-icono" onClick={cerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </header>

      <main className="contenido">
        <Outlet />
      </main>

      <nav className="nav-movil" aria-label="Principal">
        {ENLACES.map(({ a, texto, Icono, fin }) => (
          <NavLink key={a} to={a} end={fin}>
            <Icono size={20} />
            {texto}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
