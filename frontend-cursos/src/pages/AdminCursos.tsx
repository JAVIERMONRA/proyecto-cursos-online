import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BookOpen,
  Edit,
  Trash2,
  Search,
  Plus,
  X,
  Save,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminCursos.css";

interface Seccion {
  id: number;
  subtitulo: string;
  descripcion: string;
}

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  nivel?: "principiante" | "intermedio" | "avanzado";
  duracion?: number;
  secciones?: Seccion[];
}

function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCursos();
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (cursoEditando) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [cursoEditando]);

  const fetchCursos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(response.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      setMensaje({ tipo: "error", texto: "Error al cargar los cursos" });
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
      setMensaje({ tipo: "success", texto: "✅ Curso eliminado correctamente" });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "❌ Error al eliminar curso" });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const abrirModalEditar = async (curso: Curso) => {
    try {
      const res = await axios.get(`http://localhost:4000/cursos/completo/${curso.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursoEditando({
        ...res.data,
        nivel: res.data.nivel || "principiante",
        duracion: res.data.duracion || 0
      });
    } catch (error) {
      console.error("Error al cargar curso:", error);
      setCursoEditando({
        ...curso,
        nivel: curso.nivel || "principiante",
        duracion: curso.duracion || 0,
        secciones: []
      });
    }
  };

  const guardarCambios = async () => {
    if (!cursoEditando) return;

    if (!cursoEditando.titulo.trim()) {
      setMensaje({ tipo: "error", texto: "❌ El título no puede estar vacío" });
      return;
    }

    if (!cursoEditando.descripcion.trim()) {
      setMensaje({ tipo: "error", texto: "❌ La descripción no puede estar vacía" });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      // Actualizar información básica del curso
      await axios.put(
        `http://localhost:4000/cursos/${cursoEditando.id}`,
        {
          titulo: cursoEditando.titulo,
          descripcion: cursoEditando.descripcion,
          nivel: cursoEditando.nivel || "principiante",
          duracion: cursoEditando.duracion || 0,
          estado: "activo"
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // Actualizar cada sección si existen
      if (cursoEditando.secciones && cursoEditando.secciones.length > 0) {
        for (const seccion of cursoEditando.secciones) {
          if (!seccion.subtitulo.trim() || !seccion.descripcion.trim()) {
            continue;
          }

          await axios.put(
            `http://localhost:4000/cursos/${cursoEditando.id}/secciones/${seccion.id}`,
            {
              subtitulo: seccion.subtitulo,
              descripcion: seccion.descripcion
            },
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              } 
            }
          );
        }
      }

      setMensaje({ tipo: "success", texto: "✅ Curso actualizado correctamente" });
      setCursoEditando(null);
      fetchCursos();
      setTimeout(() => setMensaje(null), 3000);
    } catch (error: any) {
      console.error("Error al actualizar curso:", error);
      const errorMsg = error.response?.data?.error || "Error al actualizar el curso";
      setMensaje({ tipo: "error", texto: `❌ ${errorMsg}` });
    } finally {
      setGuardando(false);
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
      <div className="admin-cursos-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📚 Gestión de Cursos</h1>
            <p className="page-subtitle">Administra todos los cursos de la plataforma</p>
          </div>
          <button 
            className="btn-create"
            onClick={() => navigate("/admin/crear-curso")}
          >
            <Plus size={20} />
            Crear Nuevo Curso
          </button>
        </div>

        {/* Mensaje de alerta */}
        {mensaje && (
          <div className={`alert alert-${mensaje.tipo}`}>
            <AlertCircle size={20} />
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
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
                  <th>Nivel</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
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
                        <span className={`badge-nivel badge-${curso.nivel || 'principiante'}`}>
                          {curso.nivel || 'principiante'}
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
          <div 
            className="modal-overlay"
            onClick={() => !guardando && setCursoEditando(null)}
          >
            <div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>✏️ Editar Curso</h3>
                <button 
                  className="modal-close"
                  onClick={() => setCursoEditando(null)}
                  disabled={guardando}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="titulo-edit">Título del curso</label>
                  <input
                    id="titulo-edit"
                    type="text"
                    className="form-input"
                    value={cursoEditando.titulo}
                    onChange={(e) =>
                      setCursoEditando({ ...cursoEditando, titulo: e.target.value })
                    }
                    placeholder="Ingresa el título del curso"
                    disabled={guardando}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion-edit">Descripción</label>
                  <textarea
                    id="descripcion-edit"
                    className="form-textarea"
                    rows={4}
                    value={cursoEditando.descripcion}
                    onChange={(e) =>
                      setCursoEditando({
                        ...cursoEditando,
                        descripcion: e.target.value,
                      })
                    }
                    placeholder="Describe el contenido del curso"
                    disabled={guardando}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nivel-edit">Nivel</label>
                    <select
                      id="nivel-edit"
                      className="form-input"
                      value={cursoEditando.nivel || "principiante"}
                      onChange={(e) =>
                        setCursoEditando({
                          ...cursoEditando,
                          nivel: e.target.value as "principiante" | "intermedio" | "avanzado",
                        })
                      }
                      disabled={guardando}
                    >
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="duracion-edit">Duración (horas)</label>
                    <input
                      id="duracion-edit"
                      type="number"
                      className="form-input"
                      min="0"
                      value={cursoEditando.duracion || 0}
                      onChange={(e) =>
                        setCursoEditando({
                          ...cursoEditando,
                          duracion: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={guardando}
                    />
                  </div>
                </div>

                {cursoEditando.secciones && cursoEditando.secciones.length > 0 && (
                  <div className="form-group">
                    <label>Secciones del Curso ({cursoEditando.secciones.length})</label>
                    <div className="secciones-list">
                      {cursoEditando.secciones.map((sec, index) => (
                        <div key={sec.id} className="seccion-item-edit">
                          <div className="seccion-header-edit">
                            <strong>Sección {index + 1}</strong>
                          </div>
                          <input
                            type="text"
                            className="form-input"
                            value={sec.subtitulo}
                            onChange={(e) => {
                              const nuevasSecciones = [...(cursoEditando.secciones || [])];
                              nuevasSecciones[index].subtitulo = e.target.value;
                              setCursoEditando({ 
                                ...cursoEditando, 
                                secciones: nuevasSecciones 
                              });
                            }}
                            placeholder="Título de la sección"
                            disabled={guardando}
                          />
                          <textarea
                            className="form-textarea"
                            rows={2}
                            value={sec.descripcion}
                            onChange={(e) => {
                              const nuevasSecciones = [...(cursoEditando.secciones || [])];
                              nuevasSecciones[index].descripcion = e.target.value;
                              setCursoEditando({ 
                                ...cursoEditando, 
                                secciones: nuevasSecciones 
                              });
                            }}
                            placeholder="Descripción de la sección"
                            disabled={guardando}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setCursoEditando(null)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-save" 
                  onClick={guardarCambios}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <div className="spinner-small"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Guardar Cambios
                    </>
                  )}
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