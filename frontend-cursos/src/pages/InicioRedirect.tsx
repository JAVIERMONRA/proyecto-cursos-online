import { Navigate } from "react-router-dom";

/**
 * 🔸 Componente: InicioRedirect
 * Redirige automáticamente al usuario según su estado de autenticación y rol.
 * - Si no tiene token → va a /login
 * - Si es admin → va a /admin/dashboard
 * - Si es usuario normal → va a /dashboard
 */
const InicioRedirect: React.FC = () => {
  /** 🔹 Se obtienen el token y el rol desde el almacenamiento local */
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  /**
   * 🔒 Si el usuario no tiene un token guardado,
   * se le redirige al formulario de inicio de sesión.
   */
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  /**
   * 🧑‍💼 Si el usuario tiene rol de administrador,
   * se le redirige al panel de administración.
   */
  if (rol === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /**
   * 👤 En cualquier otro caso (usuario normal),
   * se le redirige al dashboard general.
   */
  return <Navigate to="/dashboard" replace />;
};

export default InicioRedirect;
