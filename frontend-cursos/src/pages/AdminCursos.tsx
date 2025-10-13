import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Search
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

function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(response.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    } finally {
      setLoading(false);
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

  const cursosFiltrados = cursos.filter(
    (curso) =>
      curso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout rol="admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
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
            <h1 className="dashboard-title">📚 Gestión de Cursos</h1>
            <p className="dashboard-subtitle">Administra todos los cursos de la plataforma</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <BookOpen size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total de Cursos</p>
              <p className="stat-value">{cursos.length}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Cursos */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">Lista de Cursos</h2>
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="table-search"
                placeholder="Buscar cursos..."
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
                  <th>Título del Curso</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <div className="empty-state">
                        <BookOpen size={48} />
                        <p>No hay cursos disponibles</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cursosFiltrados.map((curso) => (
                    <tr key={curso.id}>
                      <td>#{curso.id}</td>
                      <td>
                        <div className="curso-info">
                          <span className="curso-titulo">{curso.titulo}</span>
                        </div>
                      </td>
                      <td>
                        <span className="curso-descripcion">
                          {curso.descripcion.length > 80 
                            ? `${curso.descripcion.substring(0, 80)}...` 
                            : curso.descripcion}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-active">Activo</span>
                      </td>
                      <td>
                        <div className="action-buttons">
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
                <h3>✏️ Editar Curso</h3>
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
                  💾 Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminCursos;