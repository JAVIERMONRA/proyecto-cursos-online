import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  Calendar,
  Activity
} from "lucide-react";
import "./AdminDashboard.css";

interface Estadisticas {
  cursos: number;
  usuarios: number;
  inscripciones: number;
  cursosRecientes: Array<{
    id: number;
    titulo: string;
    inscripciones: number;
    createdAt: string;
  }>;
  usuariosRecientes: Array<{
    id: number;
    nombre: string;
    email: string;
    createdAt: string;
  }>;
}

function AdminEstadisticas() {
  const [stats, setStats] = useState<Estadisticas>({
    cursos: 0,
    usuarios: 0,
    inscripciones: 0,
    cursosRecientes: [],
    usuariosRecientes: [],
  });
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/estadisticas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout rol="admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout rol="admin">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">📊 Estadísticas Detalladas</h1>
            <p className="dashboard-subtitle">Análisis completo de la plataforma</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <BookOpen size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Cursos</p>
              <p className="stat-value">{stats.cursos}</p>
              <p className="stat-change positive">+12% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
              <Users size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Usuarios Totales</p>
              <p className="stat-value">{stats.usuarios}</p>
              <p className="stat-change positive">+8% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
              <TrendingUp size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Inscripciones</p>
              <p className="stat-value">{stats.inscripciones}</p>
              <p className="stat-change positive">+23% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
              <Award size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Promedio por Curso</p>
              <p className="stat-value">
                {stats.cursos > 0 ? Math.round(stats.inscripciones / stats.cursos) : 0}
              </p>
              <p className="stat-change positive">Estudiantes/curso</p>
            </div>
          </div>
        </div>

        {/* Cursos Recientes */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">📚 Cursos Más Populares</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Inscripciones</th>
                  <th>Fecha de Creación</th>
                </tr>
              </thead>
              <tbody>
                {stats.cursosRecientes && stats.cursosRecientes.length > 0 ? (
                  stats.cursosRecientes.map((curso) => (
                    <tr key={curso.id}>
                      <td>#{curso.id}</td>
                      <td>{curso.titulo}</td>
                      <td>
                        <span className="badge badge-active">
                          {curso.inscripciones} estudiantes
                        </span>
                      </td>
                      <td>
                        <Calendar size={16} style={{ marginRight: "8px" }} />
                        {new Date(curso.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usuarios Recientes */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">👥 Registros Recientes</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {stats.usuariosRecientes && stats.usuariosRecientes.length > 0 ? (
                  stats.usuariosRecientes.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>#{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <Activity size={16} style={{ marginRight: "8px" }} />
                        {new Date(usuario.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminEstadisticas;