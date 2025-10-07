import { useEffect, useState } from "react";
import axios from "axios";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

function MisCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    
    const fetchMisCursos = async () => {
      try {
        const res = await axios.get<Curso[]>(
          "http://localhost:4000/inscripciones/mis-cursos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCursos(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMisCursos();
  }, [token]);

  const handleDesinscribirse = async (cursoId: number): Promise<void> => {
    if (!window.confirm("¿Seguro que deseas salirte de este curso?")) return;

    try {
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCursos(cursos.filter((curso) => curso.id !== cursoId));
      alert("Te desinscribiste del curso con éxito ✅");
    } catch (err) {
      console.error(err);
      alert("Error al desinscribirse del curso ❌");
    }
  };

  return (
    <div style={{ padding: "20px", marginTop: "80px" }}>
      <h1>Mis Cursos</h1>
      {cursos.length === 0 ? (
        <p>No estás inscrito en ningún curso</p>
      ) : (
        <ul>
          {cursos.map((curso) => (
            <li key={curso.id}>
              <strong>{curso.titulo}</strong> - {curso.descripcion}
              <button
                style={{ marginLeft: "10px", color: "red" }}
                onClick={() => handleDesinscribirse(curso.id)}
              >
                Desinscribirse
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MisCursos;