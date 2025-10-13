import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  PlusCircle,
  BarChart3,
  UserCircle,
  List,
  Sun,
  Moon,
  Search
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  rol: "admin" | "estudiante";
}

const Sidebar: React.FC<SidebarProps> = ({ rol }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  // Aplicar tema al cargar
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      navigate("/login");
    }
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // Menús según el rol
  const menuItems = rol === "admin" 
    ? [
        { path: "/admin/cursos", icon: List, label: "Gestionar Cursos" },
        { path: "/admin/crear-curso", icon: PlusCircle, label: "Crear Curso" },
        { path: "/admin/estadisticas", icon: BarChart3, label: "Estadísticas" },
      ]
    : [
        { path: "/mis-cursos", icon: BookOpen, label: "Mis Cursos" },
        { path: "/explorar", icon: Search, label: "Explorar Cursos" },
        { path: "/perfil", icon: UserCircle, label: "Mi Perfil" },
      ];

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <GraduationCap size={32} className="brand-icon" />
            {!collapsed && <span className="brand-text">CursosOnline</span>}
          </div>
          <button 
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir" : "Contraer"}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {rol === "admin" ? "A" : "E"}
          </div>
          {!collapsed && (
            <div className="user-info">
              <p className="user-name">
                {rol === "admin" ? "Administrador" : "Estudiante"}
              </p>
              <p className="user-role">{rol}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <Icon size={20} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button 
            className="nav-item" 
            onClick={toggleTheme}
            title={darkMode ? "Modo claro" : "Modo oscuro"}
          >
            {darkMode ? <Sun size={20} className="nav-icon" /> : <Moon size={20} className="nav-icon" />}
            {!collapsed && <span className="nav-label">
              {darkMode ? "Modo Claro" : "Modo Oscuro"}
            </span>}
          </button>
          
          <button 
            className="nav-item logout-btn" 
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut size={20} className="nav-icon" />
            {!collapsed && <span className="nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {!collapsed && (
        <div 
          className="sidebar-overlay"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;