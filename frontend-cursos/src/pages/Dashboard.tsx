import { useEffect, useState, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";

/** 🔹 Interfaz que representa la estructura de un curso */
interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

/** 🔹 Interfaz opcional para manejar respuestas de error del backend */
interface ErrorResponse {
  error?: string;
}

/**
 * 🔸 Componente principal del panel (Dashboard)
 * Muestra los cursos inscritos y disponibles para el usuario,
 * permitiendo buscar, inscribirse y desinscribirse.
 */
const Dashboard: React.FC = () => {
  /** Estado que almacena todos los cursos disponibles */
  const [cursos, setCursos] = useState<Curso[]>([]);
  /** Estado que almacena los cursos en los que el usuario está inscrito */
  const [misCursos, setMisCursos] = useState<Curso[]>([]);
  /** Estado para controlar si los datos están cargando */
  const [loading, setLoading] = useState(true);
  /** Estado para almacenar el texto del buscador */
  const [busqueda, setBusqueda] = useState("");

  /** Se obtiene el token del usuario almacenado en localStorage */
  const token = localStorage.getItem("token");

  /** 
   * 🔹 Obtiene la lista de todos los cursos del sistema
   * desde el backend (endpoint público).
   */
  const fetchCursos = async () => {
    try {
      const res = await axios.get<Curso[]>("http://localhost:4000/cursos");
      setCursos(res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  /** 
   * 🔹 Obtiene los cursos en los que el usuario actual está inscrito.
   * Requiere autenticación mediante token.
   */
  const fetchMisCursos = async () => {
    if (!token) return; // Si no hay token, no se intenta la solicitud
    try {
      const res = await axios.get<Curso[]>(
        "http://localhost:4000/inscripciones/mis-cursos",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMisCursos(res.data);
    } catch (error) {
      console.error("Error al cargar mis cursos:", error);
    }
  };

  /** 
   * 🔹 useEffect: se ejecuta una sola vez al montar el componente.
   * Carga todos los datos necesarios en paralelo.
   */
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCursos(), fetchMisCursos()]);
      setLoading(false); // Desactiva el estado de carga
    };
    loadData();
  }, []);

  /**
   * 🔹 Maneja la inscripción de un usuario a un curso.
   * Envía una petición POST al backend con el ID del curso.
   */
  const handleInscribirse = async (cursoId: number) => {
    try {
      await axios.post(
        `http://localhost:4000/inscripciones/${cursoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchMisCursos(); // Actualiza la lista de cursos del usuario
      alert("✅ Te has inscrito correctamente al curso.");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "Error al inscribirse");
    }
  };

  /**
   * 🔹 Maneja la desinscripción del usuario de un curso.
   * Envía una petición DELETE al backend.
   */
  const handleDesinscribirse = async (cursoId: number) => {
    try {
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchMisCursos(); // Actualiza la lista después de desinscribirse
      alert("⚠️ Te has desinscrito del curso.");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "Error al desinscribirse");
    }
  };

  /**
   * 🔹 Maneja el texto del campo de búsqueda.
   * Actualiza el estado con cada pulsación.
   */
  const handleBuscar = (e: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value.toLowerCase());
  };

  /** 🔹 Muestra un spinner mientras los datos se cargan */
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  /** 
   * 🔹 Crea un conjunto con los IDs de los cursos en los que el usuario está inscrito
   * para poder filtrar fácilmente los cursos disponibles.
   */
  const idsMisCursos = new Set(misCursos.map((c) => c.id));

  /** 🔹 Lista de cursos disponibles (no inscritos) */
  const disponibles = cursos.filter((c) => !idsMisCursos.has(c.id));

  /** 
   * 🔹 Función auxiliar que filtra una lista de cursos según el texto de búsqueda.
   * Aplica el filtro tanto al título como a la descripción.
   */
  const filtrar = (lista: Curso[]) =>
    lista.filter(
      (curso) =>
        curso.titulo.toLowerCase().includes(busqueda) ||
        curso.descripcion.toLowerCase().includes(busqueda)
    );

  /** 🔹 Cursos filtrados por búsqueda */
  const misCursosFiltrados = filtrar(misCursos);
  const disponiblesFiltrados = filtrar(disponibles);

  /** 🔹 Renderizado principal del componente */
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🎓 Mis Cursos</h2>

      {/* 🔍 Campo de búsqueda */}
      <div className="d-flex justify-content-center mb-4">
        <input
          type="text"
          className="form-control w-75 shadow-sm"
          placeholder="🔎 Buscar cursos por título o descripción..."
          value={busqueda}
          onChange={handleBuscar}
        />
      </div>

      {/* 🔹 Sección: Mis cursos */}
      {misCursosFiltrados.length > 0 ? (
        <div className="row">
          {misCursosFiltrados.map((curso) => (
            <div key={curso.id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-success">
                <div className="card-body">
                  <h5 className="card-title text-success">{curso.titulo}</h5>
                  <p className="card-text">{curso.descripcion}</p>
                  <button
                    onClick={() => handleDesinscribirse(curso.id)}
                    className="btn btn-outline-danger btn-sm"
                  >
                    Desinscribirme
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          No se encontraron cursos inscritos que coincidan con la búsqueda.
        </div>
      )}

      <hr className="my-5" />

      {/* 🔹 Sección: Cursos disponibles */}
      <h3 className="text-center mb-4">📘 Cursos Disponibles para Inscripción</h3>

      {disponiblesFiltrados.length > 0 ? (
        <div className="row">
          {disponiblesFiltrados.map((curso) => (
            <div key={curso.id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{curso.titulo}</h5>
                  <p className="card-text">{curso.descripcion}</p>
                  <button
                    onClick={() => handleInscribirse(curso.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Inscribirme
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          No se encontraron cursos disponibles que coincidan con la búsqueda.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
