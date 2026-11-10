import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import "./estilos.css";
import { ProveedorSesion, useSesion } from "./sesion";
import Marco from "./componentes/Marco";
import Acceso from "./paginas/Acceso";
import MiSemana from "./paginas/MiSemana";
import RegistroDiario from "./paginas/RegistroDiario";
import Objetivos from "./paginas/Objetivos";
import Perfil from "./paginas/Perfil";
import Historial from "./paginas/Historial";

function Rutas() {
  const { usuario, cargando } = useSesion();

  if (cargando) {
    return <div className="cargando-pantalla">Cargando…</div>;
  }

  if (!usuario) {
    return (
      <Routes>
        <Route path="/acceso" element={<Acceso />} />
        <Route path="*" element={<Navigate to="/acceso" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Marco />}>
        <Route index element={<MiSemana />} />
        <Route path="hoy" element={<RegistroDiario />} />
        <Route path="objetivos" element={<Objetivos />} />
        <Route path="historial" element={<Historial />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <Rutas />
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
);
