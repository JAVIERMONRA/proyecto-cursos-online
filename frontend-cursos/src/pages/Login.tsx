import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // <-- importamos contexto
import "./Auth.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<"admin" | "estudiante">("estudiante");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();
  const { login } = useAuth(); // <-- usamos login del contexto

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      if (data.rol !== rolSeleccionado) {
        setError("El rol seleccionado no coincide con tu cuenta");
        setLoading(false);
        return;
      }

      // 🔹 Guardamos sesión en AuthContext
      login(data.token, data.rol);

      // Navegamos según rol
      if (data.rol === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/mis-cursos");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <LogIn size={32} />
          </div>
          <h2 className="auth-title">Iniciar Sesión</h2>
          <p className="auth-subtitle">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Cuenta</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${rolSeleccionado === "estudiante" ? "active" : ""}`}
                onClick={() => setRolSeleccionado("estudiante")}
                disabled={loading}
              >
                <div className="role-icon">👨‍🎓</div>
                <span>Estudiante</span>
              </button>
              <button
                type="button"
                className={`role-option ${rolSeleccionado === "admin" ? "active" : ""}`}
                onClick={() => setRolSeleccionado("admin")}
                disabled={loading}
              >
                <div className="role-icon">👨‍💼</div>
                <span>Administrador</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
