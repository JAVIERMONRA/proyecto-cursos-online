import { useEffect, useState, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { BookOpen, Search } from "lucide-react";
import "./ExplorarCursos.css";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

interface ErrorResponse {
  error?: string;
}

const ExplorarCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [misCursos, setMisCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

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
      const res = await axios.get<Curso[]>(
        "http://localhost:4000/inscripciones/mis-cursos",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMisCursos(res.data);
    } catch (error) {
      console.error("Error al cargar mis cursos:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCursos(), fetchMisCursos()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleInscribirse = async (cursoId: number) => {
    try {
      await axios.post(
        `http://localhost:4000/inscripciones/${cursoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchMisCursos();
      alert("✅ Inscripción exitosa");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "Error al inscribirse");
    }
  };

  const handleBuscar = (e: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value.toLowerCase());
  };

  if (loading) {
    return (
      <DashboardLayout rol="estudiante">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </DashboardLayout>
    );
  }

  const idsMisCursos = new Set(misCursos.map((c) => c.id));
  const disponibles = cursos.filter((c) => !idsMisCursos.has(c.id));

  const cursosFiltrados = disponibles.filter(
    (curso) =>
      curso.titulo.toLowerCase().includes(busqueda) ||
      curso.descripcion.toLowerCase().includes(busqueda)
  );

  return (
    <DashboardLayout rol="estudiante">
      <div className="explorar-page">
        <div className="page-header">
          <h1 className="page-title">🔍 Explorar Cursos</h1>
          <p className="page-subtitle">
            Descubre nuevos cursos y amplía tus conocimientos
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar cursos por título o descripción..."
              value={busqueda}
              onChange={handleBuscar}
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="results-info">
          <p>{cursosFiltrados.length} cursos disponibles</p>
        </div>

        {/* Grid de cursos */}
        {cursosFiltrados.length > 0 ? (
          <div className="courses-grid">
            {cursosFiltrados.map((curso) => (
              <div key={curso.id} className="course-card">
                <div className="course-content">
                  <h3 className="course-title">{curso.titulo}</h3>
                  <p className="course-description">{curso.descripcion}</p>
                  <button
                    onClick={() => handleInscribirse(curso.id)}
                    className="btn-inscribir"
                  >
                    <BookOpen size={18} />
                    Inscribirme
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={64} className="empty-icon" />
            <h3>No se encontraron cursos</h3>
            <p>
              {busqueda
                ? "Intenta con otros términos de búsqueda"
                : "No hay cursos disponibles en este momento"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExplorarCursos;