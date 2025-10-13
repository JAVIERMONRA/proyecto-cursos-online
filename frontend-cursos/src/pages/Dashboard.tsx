import { useEffect, useState, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { BookOpen, TrendingUp, Award, Search, Clock } from "lucide-react";
import "./Dashboard.css";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

interface ErrorResponse {
  error?: string;
}

const Dashboard: React.FC = () => {
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

  const handleDesinscribirse = async (cursoId: number) => {
    try {
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMisCursos();
      alert("⚠️ Desinscripción exitosa");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "Error al desinscribirse");
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
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  const idsMisCursos = new Set(misCursos.map((c) => c.id));
  const disponibles = cursos.filter((c) => !idsMisCursos.has(c.id));

  const filtrar = (lista: Curso[]) =>
    lista.filter(
      (curso) =>
        curso.titulo.toLowerCase().includes(busqueda) ||
        curso.descripcion.toLowerCase().includes(busqueda)
    );

  const misCursosFiltrados = filtrar(misCursos);
  const disponiblesFiltrados = filtrar(disponibles);

  return (
    <DashboardLayout rol="estudiante">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Mi Dashboard</h1>
          <p className="dashboard-subtitle">Gestiona tu aprendizaje y progreso</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Cursos Activos</p>
            <p className="stat-value">{misCursos.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Progreso Promedio</p>
            <p className="stat-value">0%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Horas Totales</p>
            <p className="stat-value">0h</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
            <Award size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Certificados</p>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Mis Cursos */}
      <section className="courses-section">
        <h2 className="section-title">📚 Mis Cursos</h2>
        {misCursosFiltrados.length > 0 ? (
          <div className="courses-grid">
            {misCursosFiltrados.map((curso) => (
              <div key={curso.id} className="course-card enrolled">
                <div className="course-badge">Inscrito</div>
                <div className="course-content">
                  <h3 className="course-title">{curso.titulo}</h3>
                  <p className="course-description">{curso.descripcion}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "0%" }}></div>
                  </div>
                  <div className="course-footer">
                    <span className="progress-text">0% completado</span>
                    <button
                      onClick={() => handleDesinscribirse(curso.id)}
                      className="btn-secondary"
                    >
                      Desinscribirme
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>No estás inscrito en ningún curso todavía</p>
          </div>
        )}
      </section>

      {/* Cursos Disponibles */}
      <section className="courses-section">
        <h2 className="section-title">🔍 Explorar Cursos</h2>
        {disponiblesFiltrados.length > 0 ? (
          <div className="courses-grid">
            {disponiblesFiltrados.map((curso) => (
              <div key={curso.id} className="course-card">
                <div className="course-content">
                  <h3 className="course-title">{curso.titulo}</h3>
                  <p className="course-description">{curso.descripcion}</p>
                  <button
                    onClick={() => handleInscribirse(curso.id)}
                    className="btn-primary"
                  >
                    Inscribirme
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay cursos disponibles</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;