import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Componente RutaPrivada
 * 
 * Protege las rutas de la aplicación que requieren autenticación.
 * 
 * Verifica si el usuario posee un token válido en `localStorage`.  
 * Si no existe el token, redirige automáticamente al login (`/login`).  
 * Si existe, renderiza los componentes hijos protegidos (`children`).  
 */
interface RutaPrivadaProps {
  children: React.ReactNode;
}

const RutaPrivada: React.FC<RutaPrivadaProps> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RutaPrivada;
