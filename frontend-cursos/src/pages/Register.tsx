import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 📘 Interface RegisterResponse
 * Define el tipo de respuesta esperada desde el backend tras un registro.
 */
interface RegisterResponse {
  message?: string; // Mensaje opcional de éxito
  error?: string;   // Mensaje de error (si ocurre)
}

/**
 * 📗 Tipo RolType
 * Define los roles posibles que puede tener un usuario en la aplicación.
 */
type RolType = "estudiante" | "admin";

/**
 * 🧩 Componente: Register
 * Formulario de registro de usuario (nombre, correo, contraseña y rol).
 * Envía los datos al backend y redirige al login tras un registro exitoso.
 */
function Register() {
  /** 🧠 Estados del formulario */
  const [nombre, setNombre] = useState<string>("");      // Nombre del usuario
  const [email, setEmail] = useState<string>("");        // Correo electrónico
  const [password, setPassword] = useState<string>("");  // Contraseña
  const [rol, setRol] = useState<RolType>("estudiante"); // Rol seleccionado (por defecto: estudiante)

  /** 🧭 Hook de navegación para redirigir al login tras el registro */
  const navigate = useNavigate();

  /**
   * 📝 handleSubmit:
   * Maneja el envío del formulario de registro.
   * Envía los datos al backend (`/auth/register`) y maneja las respuestas.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    try {
      // 🔹 Envío de datos al backend
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol }),
      });

      // 📩 Se obtiene la respuesta en formato JSON
      const data: RegisterResponse = await res.json();

      // ✅ Si el registro fue exitoso
      if (res.ok) {
        alert("Usuario registrado con éxito");
        navigate("/login"); // Redirige al login
      } else {
        // ❌ Si hay error del servidor o validación
        alert(data.error || "Error en el registro");
      }
    } catch (error) {
      // 🚨 Manejo de errores de conexión
      alert("Error de conexión con el servidor");
      console.error("Error en registro:", error);
    }
  };

  /**
   * 🧱 Renderizado del formulario de registro
   * Incluye campos de nombre, correo, contraseña y rol.
   */
  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="text-center mb-4">Registro</h3>
      <form onSubmit={handleSubmit}>
        {/* Campo de nombre */}
        <div className="mb-3">
          <label>Nombre</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* Campo de correo electrónico */}
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Campo de contraseña */}
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Selección de rol */}
        <div className="mb-3">
          <label>Rol</label>
          <select
            className="form-select"
            value={rol}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRol(e.target.value as RolType)}
          >
            <option value="estudiante">Estudiante</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Botón de envío */}
        <button className="btn btn-primary w-100">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;
