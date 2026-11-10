import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, configurarExpiracion, guardarToken, leerToken } from "./api";

const ContextoSesion = createContext(null);

export function ProveedorSesion({ children }) {
  const [perfil, setPerfil] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(leerToken()));

  const cerrarSesion = useCallback(() => {
    guardarToken(null);
    setUsuario(null);
    setPerfil(null);
  }, []);

  useEffect(() => {
    configurarExpiracion(cerrarSesion);
  }, [cerrarSesion]);

  // Al abrir la app con un token guardado, recupera el usuario.
  useEffect(() => {
    if (!leerToken()) return;

    api
      .yo()
      .then(({ usuario, perfil }) => {
        setUsuario(usuario);
        setPerfil(perfil);
      })
      .catch(() => cerrarSesion())
      .finally(() => setCargando(false));
  }, [cerrarSesion]);

  const iniciar = useCallback(async ({ token }) => {
    guardarToken(token);
    const datos = await api.yo();
    setUsuario(datos.usuario);
    setPerfil(datos.perfil);
  }, []);

  const valor = useMemo(
    () => ({ usuario, perfil, setPerfil, cargando, iniciar, cerrarSesion }),
    [usuario, perfil, cargando, iniciar, cerrarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export const useSesion = () => useContext(ContextoSesion);
