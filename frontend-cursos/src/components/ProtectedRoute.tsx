import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Componente ProtectedRoute
 * 
 * Protege las rutas que requieren autenticación.
 * 
 * 🔹 Verifica si existe un token en `localStorage`.  
 * 🔹 Si no hay token, redirige al usuario hacia la página de inicio de sesión (`/login`).  
 * 🔹 Si el usuario está autenticado, renderiza el contenido hijo (`children`).  
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
