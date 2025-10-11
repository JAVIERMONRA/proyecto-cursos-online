import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 🔐 Componente: Login
 * Permite que el usuario (admin o estudiante) inicie sesión,
 * valide su rol y sea redirigido al dashboard correspondiente.
 */
const Login: React.FC = () => {
  /** 🧩 Estados del formulario */
  const [email, setEmail] = useState<string>(""); // Guarda el correo del usuario
  const [password, setPassword] = useState<string>(""); // Guarda la contraseña
  const [rolSeleccionado, setRolSeleccionado] = useState<"admin" | "estudiante">("estudiante"); // Rol elegido en el formulario

  const navigate = useNavigate(); // Hook para redirigir entre rutas

  /**
   * 🧩 Maneja el envío del formulario.
   * Envía los datos de login al backend, valida el rol
   * y redirige al usuario según su perfil.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita el recargo de la página

    // 🔹 Enviar solicitud al servidor para iniciar sesión
    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 🚫 Si hay un error, mostrar alerta
    if (!res.ok) {
      alert(data.error || "Error al iniciar sesión");
      return;
    }

    // 🔍 Verificar que el rol coincida con el seleccionado
    if (data.rol !== rolSeleccionado) {
      alert("El rol seleccionado no coincide con tu cuenta");
      return;
    }

    // ✅ Guardar credenciales en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);

    // 🔁 Redirigir según el rol
    if (data.rol === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard"); // El estudiante va a su panel
    }
  };

  /** ✏️ Manejadores de cambios en los campos del formulario */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleRolChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setRolSeleccionado(e.target.value as "admin" | "estudiante");

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="text-center mb-4">Iniciar Sesión</h3>

      {/* 🧾 Formulario de inicio de sesión */}
      <form onSubmit={handleSubmit}>
        {/* Campo: Email */}
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>

        {/* Campo: Contraseña */}
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>

        {/* Selector: Rol del usuario */}
        <div className="mb-3">
          <label>Rol</label>
          <select
            className="form-select"
            value={rolSeleccionado}
            onChange={handleRolChange}
          >
            <option value="estudiante">Estudiante</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Botón de envío */}
        <button className="btn btn-success w-100">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
