import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { Users, UserCheck, Shield, Trash2, Search } from "lucide-react";
import "./AdminDashboard.css";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "estudiante";
  createdAt: string;
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    
    try {
      await axios.delete(`http://localhost:4000/admin/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(usuarios.filter((u) => u.id !== id));
      alert("✅ Usuario eliminado correctamente");
    } catch (error) {
      alert("❌ Error al eliminar usuario");
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout rol="admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout rol="admin">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">👥 Gestión de Usuarios</h1>
            <p className="dashboard-subtitle">Administra los usuarios de la plataforma</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <Users size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Usuarios</p>
              <p className="stat-value">{usuarios.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
              <UserCheck size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Estudiantes</p>
              <p className="stat-value">{usuarios.filter(u => u.rol === "estudiante").length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
              <Shield size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Administradores</p>
              <p className="stat-value">{usuarios.filter(u => u.rol === "admin").length}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">Lista de Usuarios</h2>
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="table-search"
                placeholder="Buscar usuarios..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <div className="empty-state">
                        <Users size={48} />
                        <p>No se encontraron usuarios</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>#{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`badge ${usuario.rol === "admin" ? "badge-active" : ""}`}>
                          {usuario.rol === "admin" ? "🛡️ Admin" : "👨‍🎓 Estudiante"}
                        </span>
                      </td>
                      <td>{new Date(usuario.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-delete"
                            onClick={() => eliminarUsuario(usuario.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminUsuarios;