/**
 * Componente: AdminDashboard
 * ---------------------------------------------------------------
 * Este componente representa el panel de administración del sistema.
 * Permite al administrador:
 *  - Ver estadísticas generales (cursos, usuarios, inscripciones)
 *  - Crear nuevos cursos (a través de CrearCursoForm)
 *  - Listar, editar y eliminar cursos existentes
 *  - Editar secciones internas de cada curso
 *
 * Utiliza Axios para conectarse con el backend y requiere un token JWT
 * almacenado en el localStorage.
 */

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CrearCursoForm from "../components/CrearCursoForm";

/** Interfaz de una sección dentro de un curso */
interface Seccion {
  id: number;
  subtitulo: string;
  descripcion: string;
}

/** Interfaz de un curso general */
interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  secciones?: Seccion[]; // ← Secciones del curso
}

/** Interfaz con las estadísticas del panel */
interface Estadisticas {
  cursos: number;
  usuarios: number;
  inscripciones: number;
}

/**
 * Componente principal del panel administrativo
 */
function AdminDashboard() {
  /** Estado que almacena las estadísticas del sistema */
  const [stats, setStats] = useState<Estadisticas>({
    cursos: 0,
    usuarios: 0,
    inscripciones: 0,
  });

  /** Lista de cursos cargados desde el backend */
  const [cursos, setCursos] = useState<Curso[]>([]);

  /** Curso actualmente seleccionado para editar */
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);

  /** Token de autenticación del usuario */
  const token = localStorage.getItem("token");

  /** Hook para redirecciones */
  const navigate = useNavigate();

  // === Cargar datos iniciales ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se ejecutan ambas peticiones en paralelo
        const [estadisticas, cursosData] = await Promise.all([
          axios.get("http://localhost:4000/admin/estadisticas", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/cursos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Actualizar estados
        setStats(estadisticas.data);
        setCursos(cursosData.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      }
    };
    fetchData();
  }, []);

  /**
   * Recarga manualmente la lista de cursos
   */
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

  /**
   * Elimina un curso por su ID
   * @param id - ID del curso a eliminar
   */
  const eliminarCurso = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este curso?")) return;
    try {
      await axios.delete(`http://localhost:4000/cursos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(cursos.filter((c) => c.id !== id));
    } catch (error) {
      alert("Error al eliminar curso");
    }
  };

  /**
   * Abre el modal de edición y carga el curso completo con sus secciones
   * @param curso - Curso base que se quiere editar
   */
  const abrirModalEditar = async (curso: Curso) => {
    try {
      const res = await axios.get(`http://localhost:4000/cursos/completo/${curso.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Curso con secciones:", res.data);
      setCursoEditando(res.data);
    } catch (error) {
      console.error("Error al cargar curso con secciones:", error);
      alert("No se pudo cargar la información completa del curso");
    }
  };

  /**
   * Guarda los cambios realizados a un curso (título, descripción)
   */
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
      fetchCursos(); // Recarga la lista de cursos
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      alert("❌ No se pudo actualizar el curso");
    }
  };

  return (
    <div className="container mt-5">
      {/* === Título del panel === */}
      <h1 className="text-center mb-4 fw-bold">
        <i className="bi bi-speedometer2 me-2"></i>Panel de Administración
      </h1>

      {/* === Sección de estadísticas === */}
      <div className="row text-center mb-5">
        {[
          { label: "Cursos", icon: "bi-book-half", color: "primary", value: stats.cursos },
          { label: "Usuarios", icon: "bi-people-fill", color: "success", value: stats.usuarios },
          { label: "Inscripciones", icon: "bi-journal-check", color: "warning", value: stats.inscripciones },
        ].map((item) => (
          <div className="col-md-4 mb-3" key={item.label}>
            <div className={`card shadow-sm border-${item.color}`}>
              <div className="card-body">
                <h5 className={`card-title text-${item.color}`}>
                  <i className={`bi ${item.icon} me-2`}></i>
                  {item.label}
                </h5>
                <p className="display-6 fw-bold">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* === Crear nuevo curso === */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white fw-bold">
          <i className="bi bi-plus-circle me-2"></i>Crear nuevo curso
        </div>
        <div className="card-body">
          <CrearCursoForm onCursoCreado={fetchCursos} />
        </div>
      </div>

      {/* === Lista de cursos === */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-dark text-white fw-bold">
          <i className="bi bi-journal-text me-2"></i>Lista de Cursos
        </div>
        <div className="card-body">
          {cursos.length === 0 ? (
            <p className="text-muted text-center">No hay cursos disponibles.</p>
          ) : (
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => (
                  <tr key={curso.id}>
                    <td>{curso.id}</td>
                    <td>{curso.titulo}</td>
                    <td>{curso.descripcion}</td>
                    <td className="text-center">
                      <button
                        onClick={() => abrirModalEditar(curso)}
                        className="btn btn-sm btn-warning me-2"
                      >
                        <i className="bi bi-pencil-square"></i> Editar
                      </button>
                      <button
                        onClick={() => eliminarCurso(curso.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* === Modal para editar curso === */}
      {cursoEditando && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              {/* Encabezado del modal */}
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>Editar Curso
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setCursoEditando(null)}
                ></button>
              </div>

              {/* Cuerpo del modal */}
              <div className="modal-body">
                {/* Campos principales */}
                <input
                  type="text"
                  className="form-control mb-3"
                  value={cursoEditando.titulo}
                  onChange={(e) =>
                    setCursoEditando({ ...cursoEditando, titulo: e.target.value })
                  }
                />
                <textarea
                  className="form-control"
                  rows={3}
                  value={cursoEditando.descripcion}
                  onChange={(e) =>
                    setCursoEditando({
                      ...cursoEditando,
                      descripcion: e.target.value,
                    })
                  }
                ></textarea>

                {/* Secciones del curso (si existen) */}
                {cursoEditando?.secciones && cursoEditando.secciones.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-bold">Secciones</h6>
                    {cursoEditando.secciones.map((sec, index) => (
                      <div key={index} className="border rounded p-2 mb-2 bg-light">
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={sec.subtitulo}
                          onChange={(e) => {
                            const nuevasSecciones = [...(cursoEditando?.secciones ?? [])];
                            nuevasSecciones[index].subtitulo = e.target.value;
                            setCursoEditando({ ...cursoEditando!, secciones: nuevasSecciones } as Curso);
                          }}
                        />
                        <textarea
                          className="form-control"
                          rows={2}
                          value={sec.descripcion}
                          onChange={(e) => {
                            const nuevasSecciones = [...(cursoEditando?.secciones ?? [])];
                            nuevasSecciones[index].descripcion = e.target.value;
                            setCursoEditando({ ...cursoEditando!, secciones: nuevasSecciones } as Curso);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCursoEditando(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={guardarCambios}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
