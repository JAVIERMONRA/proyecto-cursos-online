/**
 * Componente: Cursos
 * ---------------------------------------------------------------
 * Este componente muestra la lista de cursos disponibles y permite:
 *  - Ver todos los cursos públicos
 *  - Inscribirse a un curso (si el usuario está autenticado)
 *  - Desinscribirse de un curso
 *
 * Utiliza Axios para realizar las peticiones HTTP al backend.
 * El token JWT se obtiene desde localStorage.
 */

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

/** Interfaz que define la estructura de un curso */
interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

/** Interfaz para manejar posibles respuestas de error del backend */
interface ErrorResponse {
  error?: string;
}

/**
 * Componente principal que muestra y gestiona la lista de cursos.
 */
function Cursos() {
  /** Estado con la lista completa de cursos */
  const [cursos, setCursos] = useState<Curso[]>([]);

  /** Estado con los IDs de los cursos en los que el usuario está inscrito */
  const [misCursos, setMisCursos] = useState<number[]>([]);

  /** Estado de carga (loading) mientras se obtienen los datos */
  const [loading, setLoading] = useState(true);

  /** Token JWT almacenado localmente (si el usuario está autenticado) */
  const token = localStorage.getItem("token");

  /**
   * Obtiene la lista de todos los cursos disponibles desde el servidor.
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
   * Obtiene los cursos en los que el usuario está inscrito.
   * Requiere un token JWT válido.
   */
  const fetchMisCursos = async () => {
    if (!token) return;
    try {
      const res = await axios.get<Curso[]>("http://localhost:4000/cursos/mis-cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Solo guardamos los IDs de los cursos inscritos
      setMisCursos(res.data.map((c) => c.id));
    } catch (error) {
      console.error("Error al cargar mis cursos:", error);
    }
  };

  /**
   * Hook useEffect para cargar los datos al iniciar el componente.
   * Se ejecuta una sola vez.
   */
  useEffect(() => {
    const loadData = async () => {
      await fetchCursos();
      await fetchMisCursos();
      setLoading(false);
    };
    loadData();
  }, []);

  /**
   * Maneja la inscripción del usuario a un curso.
   * @param cursoId - ID del curso al que el usuario desea inscribirse
   */
  const handleInscribirse = async (cursoId: number) => {
    try {
      await axios.post(
        `http://localhost:4000/inscripciones/${cursoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Inscripción exitosa");
      fetchMisCursos(); // Actualiza la lista de cursos inscritos
    } catch (error) {
      console.error("Error al inscribirse:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "No se pudo inscribir");
    }
  };

  /**
   * Maneja la desinscripción del usuario de un curso.
   * @param cursoId - ID del curso del que el usuario desea desinscribirse
   */
  const handleDesinscribirse = async (cursoId: number) => {
    try {
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("❌ Te has desinscrito del curso");
      fetchMisCursos(); // Refresca la lista de cursos inscritos
    } catch (error) {
      console.error("Error al desinscribirse:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "No se pudo desinscribir");
    }
  };

  /** Estado de carga mientras se obtienen los cursos */
  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Cargando cursos...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      {/* === Título principal === */}
      <h2 className="text-center mb-4">📚 Cursos Disponibles para Inscripción</h2>

      {/* === Si no hay cursos disponibles === */}
      {cursos.length === 0 ? (
        <div className="alert alert-warning text-center">
          No hay cursos disponibles.
        </div>
      ) : (
        <div className="row g-4">
          {cursos.map((curso) => (
            <div key={curso.id} className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">{curso.titulo}</h5>
                  <p className="card-text text-muted">{curso.descripcion}</p>
                </div>

                {/* === Botón de acción según el estado del usuario === */}
                <div className="card-footer bg-transparent border-0">
                  {token ? (
                    misCursos.includes(curso.id) ? (
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => handleDesinscribirse(curso.id)}
                      >
                        <i className="bi bi-x-circle me-2"></i> Desinscribirme
                      </button>
                    ) : (
                      <button
                        className="btn btn-success w-100"
                        onClick={() => handleInscribirse(curso.id)}
                      >
                        <i className="bi bi-check-circle me-2"></i> Inscribirme
                      </button>
                    )
                  ) : (
                    <button className="btn btn-secondary w-100" disabled>
                      <i className="bi bi-lock me-2"></i> Inicia sesión para inscribirte
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cursos;
