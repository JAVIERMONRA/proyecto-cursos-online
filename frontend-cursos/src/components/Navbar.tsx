import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../index.css";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  if (user) return null; // oculta Navbar si hay sesión

  return (
    <nav className="navbar navbar-expand-lg fixed-top shadow-sm py-2">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold gradient-text" to="/">
          <i className="bi bi-mortarboard-fill me-2"></i>
          CursosOnline
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                <LogIn size={18} className="me-1" /> Iniciar sesión
              </Link>
            </li>
            <li className="nav-item ms-2">
              <Link className="btn btn-primary" to="/register">Registrarse</Link>
            </li>
            <li className="nav-item ms-3">
              <button className="btn-toggle-theme" onClick={toggleTheme} title="Cambiar tema">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
