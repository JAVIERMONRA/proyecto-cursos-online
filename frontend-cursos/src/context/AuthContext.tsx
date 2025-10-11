import React, { createContext, useState, useEffect, ReactNode } from "react";

/**
 * Contexto de Autenticación (AuthContext)
 * 
 * Este contexto centraliza la gestión del estado de autenticación en la aplicación.
 * Permite compartir la información del usuario (rol, sesión activa) entre componentes.
 * 
 * Funcionalidades principales:
 * 🔹 `login(token, rol)` — Guarda el token y rol en `localStorage` y actualiza el estado global.  
 * 🔹 `logout()` — Elimina los datos de sesión del almacenamiento local y limpia el estado.  
 * 🔹 Se inicializa verificando si ya existe una sesión previa almacenada.  
 */

interface User {
  rol: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, rol: string) => void;
  logout: () => void;
}

// Contexto por defecto (sin sesión)
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// Proveedor de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Verifica sesión almacenada en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    if (token && rol) setUser({ rol });
  }, []);

  // 🔹 Inicia sesión y almacena datos
  const login = (token: string, rol: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("rol", rol);
    setUser({ rol });
  };

  // 🔹 Cierra sesión y limpia almacenamiento
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
