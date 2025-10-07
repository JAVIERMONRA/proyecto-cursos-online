import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

interface RegisterResponse {
  message?: string;
  error?: string;
}

type RolType = "estudiante" | "admin";

function Register() {
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rol, setRol] = useState<RolType>("estudiante");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol }),
      });

      const data: RegisterResponse = await res.json();

      if (res.ok) {
        alert("Usuario registrado con éxito");
        navigate("/login");
      } else {
        alert(data.error || "Error en el registro");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error("Error en registro:", error);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="text-center mb-4">Registro</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            required
          />
        </div>
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
        <button className="btn btn-primary w-100">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;