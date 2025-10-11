/**
 * Componente: AdminCursos
 * ----------------------------------------------------
 * Este componente permite al administrador gestionar cursos:
 * - Crear nuevos cursos
 * - Editar cursos existentes
 * - Eliminar cursos
 * - Listar todos los cursos registrados
 * 
 * Se conecta con un backend mediante Axios y utiliza un token JWT
 * almacenado en localStorage para la autenticación.
 */

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";

/** 
 * Interfaz que define la estructura de un curso 
 */
interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  profesorId?: number;
}

/**
 * Componente principal para la gestión de cursos por el administrador
 */
function AdminCursos() {
  /** Lista de cursos cargados desde el backend */
  const [cursos, setCursos] = useState<Curso[]>([]);

  /** Datos del nuevo curso que se va a crear */
  const [nuevoCurso, setNuevoCurso] = useState({ titulo: "", descripcion: "" });

  /** Curso actualmente en modo edición */
  const [editando, setEditando] = useState<Curso | null>(null);

  /** Estado de carga para mostrar mensajes mientras se obtienen datos */
  const [loading, setLoading] = useState(true);

  /** Token y rol del usuario autenticado (almacenados en localStorage) */
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  /**
   * Función que obtiene todos los cursos desde el servidor
   */
  const fetchCursos = async () => {
    try {
      const res = await axios.get<Curso[]>("http://localhost:4000/cursos");
      setCursos(res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Carga inicial de los cursos al montar el componente */
  useEffect(() => {
    fetchCursos();
  }, []);

  /**
   * Maneja la creación de un nuevo curso
   * @param e Evento del formulario de creación
   */
  const handleCrear = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/cursos", nuevoCurso, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Curso creado ✅");
      setNuevoCurso({ titulo: "", descripcion: "" });
      fetchCursos();
    } catch (error) {
      console.error("Error al crear curso:", error);
      alert("Error al crear el curso");
    }
  };

  /**
   * Maneja la eliminación de un curso por su ID
   * @param id ID del curso a eliminar
   */
  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este curso?")) return;
    try {
      await axios.delete(`http://localhost:4000/cursos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Curso eliminado 🗑️");
      fetchCursos();
    } catch (error) {
      console.error("Error al eliminar curso:", error);
    }
  };

  /**
   * Maneja la actualización (edición) de un curso existente
   * @param e Evento del formulario de edición
   */
  const handleEditar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editando) return;

    try {
      await axios.put(`http://localhost:4000/cursos/${editando.id}`, editando, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Curso actualizado ✏️");
      setEditando(null);
      fetchCursos();
    } catch (error) {
      console.error("Error al actualizar curso:", error);
    }
  };

  /** Si el usuario no es administrador, se bloquea el acceso */
  if (rol !== "admin") {
    return <p style={{ color: "red" }}>Acceso denegado. Solo para administradores.</p>;
  }

  /** Mostrar mensaje de carga mientras se obtienen los cursos */
  if (loading) return <p>Cargando cursos...</p>;

  return (
    <div style={{ padding: "20px", marginTop: "80px" }}>
      <h1>Panel de Administración</h1>

      {/* === Formulario para crear nuevo curso === */}
      <form onSubmit={handleCrear} style={{ marginBottom: "20px" }}>
        <h3>Crear nuevo curso</h3>
        <input
          type="text"
          placeholder="Título"
          value={nuevoCurso.titulo}
          onChange={(e) => setNuevoCurso({ ...nuevoCurso, titulo: e.target.value })}
          required
        />
        <br />
        <textarea
          placeholder="Descripción"
          value={nuevoCurso.descripcion}
          onChange={(e) => setNuevoCurso({ ...nuevoCurso, descripcion: e.target.value })}
          required
        />
        <br />
        <button type="submit">Crear curso</button>
      </form>

      {/* === Listado de cursos existentes === */}
      <h3>Cursos existentes</h3>
      {cursos.length === 0 ? (
        <p>No hay cursos registrados</p>
      ) : (
        <ul>
          {cursos.map((curso) => (
            <li key={curso.id}>
              {/* Si el curso está en modo edición, muestra formulario */}
              {editando?.id === curso.id ? (
                <form onSubmit={handleEditar}>
                  <input
                    type="text"
                    value={editando.titulo}
                    onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
                    required
                  />
                  <textarea
                    value={editando.descripcion}
                    onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                    required
                  />
                  <button type="submit">Guardar</button>
                  <button type="button" onClick={() => setEditando(null)}>
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <strong>{curso.titulo}</strong> - {curso.descripcion}
                  <button onClick={() => setEditando(curso)}>Editar</button>
                  <button onClick={() => handleEliminar(curso.id)}>Eliminar</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminCursos;
