import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import React from "react";

/**
 * Componente Navbar
 *
 * Barra de navegación principal de la aplicación.
 * Gestiona:
 * - Sesión del usuario (inicio, cierre y rol).
 * - Cambio de modo oscuro / claro.
 * - Menú desplegable responsivo con animación tipo "hamburguesa".
 * 
 * Comportamiento:
 * - Si no hay sesión, muestra botones de "Iniciar Sesión" y "Registrarse".
 * - Si hay sesión activa, muestra avatar, menú de usuario y opciones dinámicas según el rol.
 * - Cambia dinámicamente los estilos según el modo oscuro o claro.
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();

  // 🔹 Estados de UI y sesión
  const [modoOscuro, setModoOscuro] = useState(false);
  const [usuario, setUsuario] = useState<{ rol: string } | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  /**
   * useEffect - Carga inicial de la sesión almacenada.
   * Recupera token y rol del usuario desde localStorage al montar el componente.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    if (token && rol) {
      setUsuario({ rol });
    }
  }, []);

  /**
   * Alterna entre modo claro y modo oscuro.
   * Cambia clases en el <body> para aplicar estilos globales.
   */
  const toggleModo = () => {
    setModoOscuro(!modoOscuro);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  /**
   * Cierra la sesión del usuario actual.
   * Elimina token y rol de localStorage y redirige al login.
   */
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setUsuario(null);
    navigate("/login");
  };

  /**
   * Alterna el estado del menú hamburguesa.
   */
  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top shadow-sm ${
        modoOscuro ? "navbar-dark bg-dark" : "navbar-light bg-light"
      }`}
    >
      <div className="container d-flex justify-content-between align-items-center">
        {/* 🔸 Marca / logo de la plataforma */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-mortarboard-fill me-2"></i> CursosOnline
        </Link>

        <div className="d-flex align-items-center gap-2">
          {/* 🌙 Botón modo oscuro/claro */}
          <button
            onClick={toggleModo}
            className={`btn btn-outline-${modoOscuro ? "light" : "dark"} btn-sm me-2`}
          >
            <i className={`bi ${modoOscuro ? "bi-sun" : "bi-moon"} me-1`}></i>
            {modoOscuro ? "Modo Claro" : "Modo Oscuro"}
          </button>

          {/* 🔹 Usuario NO autenticado */}
          {!usuario && (
            <>
              <Link className="btn btn-outline-primary btn-sm me-2" to="/login">
                Iniciar Sesión
              </Link>
              <Link className="btn btn-success btn-sm" to="/register">
                Registrarse
              </Link>
            </>
          )}

          {/* 🔹 Usuario autenticado */}
          {usuario && (
            <div className="position-relative">
              <div className="d-flex align-items-center gap-2">
                {/* 🧍 Avatar del usuario */}
                <div
                  className={`rounded-circle d-flex justify-content-center align-items-center border ${
                    modoOscuro ? "bg-secondary text-light" : "bg-light text-dark"
                  }`}
                  style={{
                    width: "35px",
                    height: "35px",
                    fontSize: "18px",
                  }}
                  title={usuario.rol === "admin" ? "Administrador" : "Estudiante"}
                >
                  <i className="bi bi-person-fill"></i>
                </div>

                {/* 🍔 Botón menú hamburguesa */}
                <button
                  className="hamburger-btn"
                  onClick={toggleMenu}
                  aria-label="Menú"
                >
                  <span className="bar"></span>
                  <span className="bar"></span>
                  <span className="bar"></span>
                </button>
              </div>

              {/* 📋 Menú desplegable */}
              <div
                className={`menu-desplegable position-absolute end-0 mt-2 p-3 rounded-3 shadow ${
                  menuAbierto ? "activo" : "d-none"
                } ${modoOscuro ? "bg-dark text-light" : "bg-white"}`}
                style={{ minWidth: "190px", zIndex: 1000 }}
              >
                <p className="fw-bold mb-2 text-center">
                  👤 {usuario.rol === "admin" ? "Administrador" : "Estudiante"}
                </p>
                <hr className="my-2" />
                <ul className="list-unstyled mb-2">
                  {/* 📘 Mis cursos */}
                  <li>
                    <button
                      className="dropdown-item w-100 text-start"
                      onClick={() => {
                        navigate("/");
                        setMenuAbierto(false);
                      }}
                    >
                      📘 Mis Cursos
                    </button>
                  </li>

                  {/* 🧭 Panel Admin (solo para rol admin) */}
                  {usuario.rol === "admin" && (
                    <li>
                      <button
                        className="dropdown-item w-100 text-start"
                        onClick={() => {
                          navigate("/admin/dashboard");
                          setMenuAbierto(false);
                        }}
                      >
                        🧭 Panel Admin
                      </button>
                    </li>
                  )}

                  {/* 🚪 Cerrar sesión */}
                  <li>
                    <button
                      className="dropdown-item text-danger w-100 text-start"
                      onClick={() => {
                        cerrarSesion();
                        setMenuAbierto(false);
                      }}
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
