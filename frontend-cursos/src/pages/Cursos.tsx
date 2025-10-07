import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

interface ErrorResponse {
  error?: string;
}

function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [misCursos, setMisCursos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchCursos = async () => {
    try {
      const res = await axios.get<Curso[]>("http://localhost:4000/cursos");
      setCursos(res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  const fetchMisCursos = async () => {
    if (!token) return;
    try {
      const res = await axios.get<Curso[]>("http://localhost:4000/cursos/mis-cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMisCursos(res.data.map((c) => c.id));
    } catch (error) {
      console.error("Error al cargar mis cursos:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCursos();
      await fetchMisCursos();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleInscribirse = async (cursoId: number) => {
    try {
      await axios.post(
        `http://localhost:4000/inscripciones/${cursoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Inscripción exitosa");
      fetchMisCursos();
    } catch (error) {
      console.error("Error al inscribirse:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "No se pudo inscribir");
    }
  };

  const handleDesinscribirse = async (cursoId: number) => {
    try {
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Te has desinscrito del curso");
      fetchMisCursos();
    } catch (error) {
      console.error("Error al desinscribirse:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "No se pudo desinscribir");
    }
  };

  if (loading) return <p>Cargando cursos...</p>;

  return (
    <div style={{ padding: "20px", marginTop: "80px" }}>
      <h1>Lista de Cursos</h1>
      {cursos.length === 0 ? (
        <p>No hay cursos disponibles</p>
      ) : (
        <ul>
          {cursos.map((curso) => (
            <li key={curso.id} style={{ marginBottom: "15px" }}>
              <strong>{curso.titulo}</strong> - {curso.descripcion}
              <br />
              {token ? (
                misCursos.includes(curso.id) ? (
                  <>
                    <span style={{ color: "green" }}>Ya inscrito</span>{" "}
                    <button onClick={() => handleDesinscribirse(curso.id)}>
                      Desinscribirme
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleInscribirse(curso.id)}>
                    Inscribirme
                  </button>
                )
              ) : (
                <span style={{ color: "red" }}>
                  Debes iniciar sesión para inscribirte
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cursos;