import { useEffect, useState } from "react";
import axios from "axios";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
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
  const [nuevoCurso, setNuevoCurso] = useState({ titulo: "", descripcion: "" });
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const token = localStorage.getItem("token");

  // Cargar datos iniciales
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
      }
    };
    fetchData();
  }, []);

  // Crear curso
  const crearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCurso.titulo || !nuevoCurso.descripcion)
      return alert("Completa todos los campos");

    try {
      await axios.post("http://localhost:4000/cursos", nuevoCurso, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNuevoCurso({ titulo: "", descripcion: "" });
      const { data } = await axios.get("http://localhost:4000/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(data);
    } catch (error) {
      alert("Error al crear curso");
    }
  };

  // Eliminar curso
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

  // Abrir modal de edición
  const abrirModalEditar = (curso: Curso) => {
    setCursoEditando(curso);
  };

  // Guardar edición
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

      setCursos(
        cursos.map((c) =>
          c.id === cursoEditando.id ? cursoEditando : c
        )
      );
      setCursoEditando(null);
    } catch (error) {
      alert("Error al actualizar curso");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 fw-bold">
        <i className="bi bi-speedometer2 me-2"></i>Panel de Administración
      </h1>

      {/* Estadísticas */}
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

      {/* Crear curso */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white fw-bold">
          <i className="bi bi-plus-circle me-2"></i>Crear Curso
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={crearCurso}>
            <div className="col-md-5">
              <input
                type="text"
                placeholder="Título del curso"
                className="form-control"
                value={nuevoCurso.titulo}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, titulo: e.target.value })}
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                placeholder="Descripción"
                className="form-control"
                value={nuevoCurso.descripcion}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, descripcion: e.target.value })}
              />
            </div>
            <div className="col-md-2 text-end">
              <button className="btn btn-success w-100" type="submit">
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista de cursos */}
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

      {/* Modal editar curso */}
      {cursoEditando && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>Editar Curso
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setCursoEditando(null)}
                ></button>
              </div>
              <div className="modal-body">
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
              </div>
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
