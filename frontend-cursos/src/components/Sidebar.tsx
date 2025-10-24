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
  Search,
  Users
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  rol: "admin" | "estudiante";
}

interface UserData {
  nombre: string;
  fotoPerfil?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ rol }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });
  
  const [userData, setUserData] = useState<UserData>({
    nombre: rol === "admin" ? "Administrador" : "Estudiante",
    fotoPerfil: undefined,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Cargar datos al montar y cuando se actualice el perfil
  useEffect(() => {
    fetchUserData();
    
    // ✅ Escuchar eventos de actualización
    const handleUserUpdate = (event: any) => {
      console.log("🔄 Evento de actualización recibido:", event.detail);
      
      if (event.detail) {
        // Actualizar desde el evento
        setUserData({
          nombre: event.detail.nombre || userData.nombre,
          fotoPerfil: event.detail.fotoPerfil || undefined,
        });
      } else {
        // Recargar desde el servidor
        fetchUserData();
      }
    };
    
    window.addEventListener("userProfileUpdated", handleUserUpdate);
    
    return () => {
      window.removeEventListener("userProfileUpdated", handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchUserData = async () => {
    if (!token) return;
    
    try {
      const response = await fetch("http://localhost:4000/auth/perfil", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Datos de usuario cargados:", data);
        
        setUserData({
          nombre: data.nombre || (rol === "admin" ? "Administrador" : "Estudiante"),
          fotoPerfil: data.fotoPerfil || undefined,
        });
      }
    } catch (error) {
      console.error("❌ Error al cargar datos del usuario:", error);
    }
  };

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

  const menuItems = rol === "admin" 
    ? [
        { path: "/admin/cursos", icon: List, label: "Gestionar Cursos" },
        { path: "/admin/crear-curso", icon: PlusCircle, label: "Crear Curso" },
        { path: "/admin/estadisticas", icon: BarChart3, label: "Estadísticas" },
        { path: "/admin/usuarios", icon: Users, label: "Usuarios" },
        { path: "/admin/perfil", icon: UserCircle, label: "Mi Perfil" },
      ]
    : [
        { path: "/mis-cursos", icon: BookOpen, label: "Mis Cursos" },
        { path: "/explorar", icon: Search, label: "Explorar Cursos" },
        { path: "/perfil", icon: UserCircle, label: "Mi Perfil" },
      ];

  return (
    <>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
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

        {/* ✅ User Info con foto actualizada */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {userData.fotoPerfil ? (
              <img
                src={userData.fotoPerfil}
                alt="Perfil"
                className="avatar-image"
                title={userData.nombre}
                key={userData.fotoPerfil} // ✅ Forzar re-render cuando cambie
              />
            ) : (
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {userData.nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="user-info">
              <p className="user-name" title={userData.nombre}>
                {userData.nombre}
              </p>
              <p className="user-role">{rol}</p>
            </div>
          )}
        </div>

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