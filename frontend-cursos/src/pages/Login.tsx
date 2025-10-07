import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  // 🧩 Tipamos los estados
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rolSeleccionado, setRolSeleccionado] = useState<"admin" | "estudiante">("estudiante");

  const navigate = useNavigate();

  // 🧩 Tipamos el evento del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al iniciar sesión");
      return;
    }

    // ✅ Verificar que el rol coincida
    if (data.rol !== rolSeleccionado) {
      alert("El rol seleccionado no coincide con tu cuenta");
      return;
    }

    // 🧩 Guardar credenciales
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);

    // ✅ Redirigir según el rol
    if (data.rol === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/mis-cursos");
    }
  };

  // 🧩 Tipar los eventos de cambio
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleRolChange = (e: ChangeEvent<HTMLSelectElement>) => setRolSeleccionado(e.target.value as "admin" | "estudiante");

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="text-center mb-4">Iniciar Sesión</h3>
      <form onSubmit={handleSubmit}>
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
        <button className="btn btn-success w-100">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
