import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  PlusCircle,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import "./AdminDashboard.css";

interface Seccion {
  id: number;
  subtitulo: string;
  descripcion: string;
}

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  secciones?: Seccion[];
}

interface Estadisticas {
  cursos: number;
  usuarios: number;
  inscripciones: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Estadisticas>({
    cursos: 0,
    usuarios: 0,
    inscripciones: 0,
  });

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estadisticas, cursosData] = await Promise.all([
          axios.get("http://localhost:4000/admin/estadisticas", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/cursos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(estadisticas.data);
        setCursos(cursosData.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(response.data);
    } catch (error) {
      console.error("Error al recargar cursos:", error);
    }
  };

  const eliminarCurso = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este curso?")) return;
    try {
      await axios.delete(`http://localhost:4000/cursos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(cursos.filter((c) => c.id !== id));
      alert("✅ Curso eliminado correctamente");
    } catch (error) {
      alert("❌ Error al eliminar curso");
    }
  };

  const abrirModalEditar = async (curso: Curso) => {
    try {
      const res = await axios.get(`http://localhost:4000/cursos/completo/${curso.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursoEditando(res.data);
    } catch (error) {
      console.error("Error al cargar curso con secciones:", error);
      alert("No se pudo cargar la información completa del curso");
    }
  };

  const guardarCambios = async () => {
    if (!cursoEditando) return;

    try {
      await axios.put(
        `http://localhost:4000/cursos/${cursoEditando.id}`,
        {
          titulo: cursoEditando.titulo,
          descripcion: cursoEditando.descripcion,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Curso actualizado correctamente");
      setCursoEditando(null);
      fetchCursos();
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      alert("❌ No se pudo actualizar el curso");
    }
  };

  if (loading) {
    return (
      <DashboardLayout rol="admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout rol="admin">
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Panel de Administración</h1>
            <p className="dashboard-subtitle">Gestiona tu plataforma educativa</p>
          </div>
          <button 
            className="btn-create"
            onClick={() => navigate("/admin/crear-curso")}
          >
            <PlusCircle size={20} />
            Crear Curso
          </button>
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
              <p className="stat-label">Usuarios Activos</p>
              <p className="stat-value">{stats.usuarios}</p>
              <p className="stat-change positive">+8% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
              <TrendingUp size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Inscripciones</p>
              <p className="stat-value">{stats.inscripciones}</p>
              <p className="stat-change positive">+23% este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
              <Award size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Tasa de Finalización</p>
              <p className="stat-value">68%</p>
              <p className="stat-change positive">+5% este mes</p>
            </div>
          </div>
        </div>

        {/* Cursos Table */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">📚 Gestión de Cursos</h2>
            <div className="table-actions">
              <input 
                type="text" 
                placeholder="Buscar cursos..."
                className="table-search"
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título del Curso</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <div className="empty-state">
                        <BookOpen size={48} />
                        <p>No hay cursos disponibles</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cursos.map((curso) => (
                    <tr key={curso.id}>
                      <td>#{curso.id}</td>
                      <td>
                        <div className="curso-info">
                          <span className="curso-titulo">{curso.titulo}</span>
                        </div>
                      </td>
                      <td>
                        <span className="curso-descripcion">
                          {curso.descripcion.length > 60 
                            ? `${curso.descripcion.substring(0, 60)}...` 
                            : curso.descripcion}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-active">Activo</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-view"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => abrirModalEditar(curso)}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => eliminarCurso(curso.id)}
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

        {/* Modal de Edición */}
        {cursoEditando && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Editar Curso</h3>
                <button 
                  className="modal-close"
                  onClick={() => setCursoEditando(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Título del curso</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cursoEditando.titulo}
                    onChange={(e) =>
                      setCursoEditando({ ...cursoEditando, titulo: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={cursoEditando.descripcion}
                    onChange={(e) =>
                      setCursoEditando({
                        ...cursoEditando,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>

                {cursoEditando?.secciones && cursoEditando.secciones.length > 0 && (
                  <div className="form-group">
                    <label>Secciones del Curso</label>
                    {cursoEditando.secciones.map((sec, index) => (
                      <div key={index} className="seccion-item">
                        <input
                          type="text"
                          className="form-input mb-2"
                          value={sec.subtitulo}
                          onChange={(e) => {
                            const nuevasSecciones = [...(cursoEditando?.secciones ?? [])];
                            nuevasSecciones[index].subtitulo = e.target.value;
                            setCursoEditando({ 
                              ...cursoEditando!, 
                              secciones: nuevasSecciones 
                            } as Curso);
                          }}
                        />
                        <textarea
                          className="form-textarea"
                          rows={2}
                          value={sec.descripcion}
                          onChange={(e) => {
                            const nuevasSecciones = [...(cursoEditando?.secciones ?? [])];
                            nuevasSecciones[index].descripcion = e.target.value;
                            setCursoEditando({ 
                              ...cursoEditando!, 
                              secciones: nuevasSecciones 
                            } as Curso);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setCursoEditando(null)}
                >
                  Cancelar
                </button>
                <button className="btn-save" onClick={guardarCambios}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;