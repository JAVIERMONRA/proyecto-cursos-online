import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Activity,
} from "lucide-react";
import "./AdminDashboard.css";

interface Estadisticas {
  cursos: number;
  usuarios: number;
  inscripciones: number;
  cursosPopulares: Array<{
    cursoId: number;
    titulo: string;
    inscripciones: number;
  }>;
  usuariosRecientes: Array<{
    id: number;
    nombre: string;
    email: string;
    fechaRegistro: string;
  }>;
  inscripcionesMensuales: Array<{
    mes: string;
    total: number;
  }>;
  tasaCompletado: number;
  promedioEstudiantesPorCurso: number;
}

const AdminEstadisticas: React.FC = () => {
  const [stats, setStats] = useState<Estadisticas>({
    cursos: 0,
    usuarios: 0,
    inscripciones: 0,
    cursosPopulares: [],
    usuariosRecientes: [],
    inscripcionesMensuales: [],
    tasaCompletado: 0,
    promedioEstudiantesPorCurso: 0,
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

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

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
            <p className="dashboard-subtitle">
              Análisis completo de la plataforma
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <BookOpen size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Cursos</p>
              <p className="stat-value">{stats.cursos}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <Users size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Usuarios Totales</p>
              <p className="stat-value">{stats.usuarios}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <TrendingUp size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Inscripciones</p>
              <p className="stat-value">{stats.inscripciones}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              }}
            >
              <Award size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Tasa Completado</p>
              <p className="stat-value">{stats.tasaCompletado}%</p>
            </div>
          </div>
        </div>

        {/* Gráficas */}
        <div className="graficas-grid">
          {/* Gráfica 1: Inscripciones por Mes */}
          <div className="grafica-card">
            <h3 className="grafica-titulo">📈 Inscripciones por Mes</h3>
            {stats.inscripcionesMensuales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.inscripcionesMensuales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Inscripciones"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No hay datos disponibles</p>
            )}
          </div>

          {/* Gráfica 2: Cursos Populares */}
          <div className="grafica-card">
            <h3 className="grafica-titulo">⭐ Cursos Más Populares</h3>
            {stats.cursosPopulares.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.cursosPopulares}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="titulo" width={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="inscripciones"
                    fill="#8b5cf6"
                    name="Inscripciones"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No hay datos disponibles</p>
            )}
          </div>

          {/* Gráfica 3: Distribución de Inscripciones */}
          <div className="grafica-card">
            <h3 className="grafica-titulo">🎯 Distribución General</h3>
            {stats.cursosPopulares.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.cursosPopulares.slice(0, 5)}
                    dataKey="inscripciones"
                    nameKey="titulo"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.cursosPopulares.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No hay datos disponibles</p>
            )}
          </div>

          {/* Estadísticas Clave */}
          <div className="grafica-card stats-card-large">
            <h3 className="grafica-titulo">📊 Estadísticas Clave</h3>
            <div className="stats-details">
              <div className="stat-detail">
                <span className="stat-detail-label">Promedio Estudiantes/Curso</span>
                <span className="stat-detail-value">
                  {stats.promedioEstudiantesPorCurso}
                </span>
              </div>
              <div className="stat-detail">
                <span className="stat-detail-label">Tasa de Completado</span>
                <span className="stat-detail-value">{stats.tasaCompletado}%</span>
              </div>
              <div className="stat-detail">
                <span className="stat-detail-label">Total Inscripciones</span>
                <span className="stat-detail-value">{stats.inscripciones}</span>
              </div>
              <div className="stat-detail">
                <span className="stat-detail-label">Cursos Activos</span>
                <span className="stat-detail-value">{stats.cursos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Cursos Populares */}
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
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {stats.cursosPopulares.length > 0 ? (
                  stats.cursosPopulares.map((curso) => (
                    <tr key={curso.cursoId}>
                      <td>#{curso.cursoId}</td>
                      <td>{curso.titulo}</td>
                      <td>
                        <span className="badge badge-active">
                          {curso.inscripciones} estudiantes
                        </span>
                      </td>
                      <td>
                        {(
                          (curso.inscripciones / stats.inscripciones) *
                          100
                        ).toFixed(1)}
                        %
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

        {/* Tabla de Usuarios Recientes */}
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
                {stats.usuariosRecientes.length > 0 ? (
                  stats.usuariosRecientes.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>#{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <Activity size={16} style={{ marginRight: "8px" }} />
                        {new Date(usuario.fechaRegistro).toLocaleDateString()}
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
};

export default AdminEstadisticas;