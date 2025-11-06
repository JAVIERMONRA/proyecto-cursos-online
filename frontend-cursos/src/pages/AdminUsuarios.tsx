import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { Users, UserCheck, Search, TrendingUp, AlertCircle, BookOpen } from "lucide-react";
import "./AdminUsuarios.css";

interface InscripcionDetallada {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  fotoPerfil?: string;
  cursoId: number;
  cursoTitulo: string;
  progreso: number;
  completado: boolean;
  fechaInscripcion: string;
}

interface EstadisticasResumen {
  totalEstudiantes: number;
  totalInscripciones: number;
  promedioProgreso: number;
  cursosCompletados: number;
}

function AdminUsuarios() {
  const [inscripciones, setInscripciones] = useState<InscripcionDetallada[]>([]);
  const [stats, setStats] = useState<EstadisticasResumen>({
    totalEstudiantes: 0,
    totalInscripciones: 0,
    promedioProgreso: 0,
    cursosCompletados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      const response = await axios.get("http://localhost:4000/admin/inscripciones-detalladas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInscripciones(response.data.inscripciones);
      setStats(response.data.estadisticas);
    } catch (error) {
      console.error("Error al cargar inscripciones:", error);
      setMensaje({ tipo: "error", texto: "Error al cargar las inscripciones" });
    } finally {
      setLoading(false);
    }
  };

  const inscripcionesFiltradas = inscripciones.filter(
    (insc) =>
      insc.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      insc.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      insc.cursoTitulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getProgresoColor = (porcentaje: number) => {
    if (porcentaje >= 75) return "#10b981"; // Verde
    if (porcentaje >= 50) return "#3b82f6"; // Azul
    if (porcentaje >= 25) return "#f59e0b"; // Amarillo
    return "#ef4444"; // Rojo
  };

  const getProgresoBadgeClass = (porcentaje: number) => {
    if (porcentaje >= 75) return "badge-progreso-alto";
    if (porcentaje >= 50) return "badge-progreso-medio";
    if (porcentaje >= 25) return "badge-progreso-bajo";
    return "badge-progreso-muy-bajo";
  };

  if (loading) {
    return (
      <DashboardLayout rol="admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando inscripciones...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout rol="admin">
      <div className="admin-usuarios-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">👥 Inscripciones de Estudiantes</h1>
            <p className="page-subtitle">Monitorea el progreso de cada estudiante en sus cursos</p>
          </div>
        </div>

        {mensaje && (
          <div className={`alert alert-${mensaje.tipo}`}>
            <AlertCircle size={20} />
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <Users size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Estudiantes</p>
              <p className="stat-value">{stats.totalEstudiantes}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
              <BookOpen size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Inscripciones</p>
              <p className="stat-value">{stats.totalInscripciones}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
              <TrendingUp size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Progreso Promedio</p>
              <p className="stat-value">{stats.promedioProgreso}%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
              <UserCheck size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Cursos Completados</p>
              <p className="stat-value">{stats.cursosCompletados}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Inscripciones */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">Inscripciones Activas</h2>
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="table-search"
                placeholder="Buscar por estudiante o curso..."
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
                  <th>Estudiante</th>
                  <th>Email</th>
                  <th>Curso</th>
                  <th className="text-center">Progreso</th>
                </tr>
              </thead>
              <tbody>
                {inscripcionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <div className="empty-state">
                        <Users size={48} />
                        <p>No se encontraron inscripciones</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inscripcionesFiltradas.map((insc) => (
                    <tr key={`${insc.usuarioId}-${insc.cursoId}`}>
                      <td>#{insc.usuarioId}</td>
                      <td>
                        <div className="usuario-info">
                          <div className="usuario-avatar">
                            {insc.fotoPerfil ? (
                              <img 
                                src={insc.fotoPerfil} 
                                alt={insc.nombre}
                                className="avatar-image"
                              />
                            ) : (
                              insc.nombre.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="usuario-nombre">{insc.nombre}</span>
                        </div>
                      </td>
                      <td>
                        <span className="usuario-email">{insc.email}</span>
                      </td>
                      <td>
                        <div className="curso-info-cell">
                          <BookOpen size={16} className="curso-icon" />
                          <span className="curso-nombre">{insc.cursoTitulo}</span>
                        </div>
                      </td>
                      <td>
                        <div className="progreso-container">
                          <div className="progreso-info">
                            <span className={`badge-progreso ${getProgresoBadgeClass(insc.progreso)}`}>
                              {insc.progreso}%
                            </span>
                            {insc.completado && (
                              <span className="badge-completado">✓ Completado</span>
                            )}
                          </div>
                          <div className="progreso-bar">
                            <div 
                              className="progreso-bar-fill"
                              style={{ 
                                width: `${insc.progreso}%`,
                                background: getProgresoColor(insc.progreso)
                              }}
                            ></div>
                          </div>
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