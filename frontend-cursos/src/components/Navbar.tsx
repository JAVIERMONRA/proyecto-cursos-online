import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";

interface Usuario {
  rol: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [modoOscuro, setModoOscuro] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    if (token && rol) setUsuario({ rol });
  }, []);

  const toggleModo = () => {
    setModoOscuro(!modoOscuro);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        modoOscuro ? "navbar-dark bg-dark" : "navbar-light bg-light"
      }`}
    >
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-mortarboard-fill me-2"></i> CursosOnline
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!usuario ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <i className="bi bi-person-plus me-1"></i> Registrarse
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={cerrarSesion}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                  </button>
                </li>
              </>
            )}
            <li className="nav-item">
              <button
                onClick={toggleModo}
                className="btn btn-outline-secondary btn-sm ms-3"
              >
                <i className={`bi ${modoOscuro ? "bi-sun" : "bi-moon"} me-1`}></i>
                {modoOscuro ? "Modo Claro" : "Modo Oscuro"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
