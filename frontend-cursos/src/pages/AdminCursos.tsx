import { useEffect, useState, FormEvent } from "react";
import axios from "axios";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  profesorId?: number;
}

function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nuevoCurso, setNuevoCurso] = useState({ titulo: "", descripcion: "" });
  const [editando, setEditando] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

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

  useEffect(() => {
    fetchCursos();
  }, []);

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

  if (rol !== "admin") {
    return <p style={{ color: "red" }}>Acceso denegado. Solo para administradores.</p>;
  }

  if (loading) return <p>Cargando cursos...</p>;

  return (
    <div style={{ padding: "20px", marginTop: "80px" }}>
      <h1>Panel de Administración</h1>

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

      <h3>Cursos existentes</h3>
      {cursos.length === 0 ? (
        <p>No hay cursos registrados</p>
      ) : (
        <ul>
          {cursos.map((curso) => (
            <li key={curso.id}>
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