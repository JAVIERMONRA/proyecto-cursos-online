import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { BookOpen, Clock, Award, TrendingUp, AlertCircle } from "lucide-react";
import "./MisCursos.css";

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

function MisCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      } finally {
        setLoading(false);
      }
    };

    fetchMisCursos();
  }, [token]);

  const handleDesinscribirse = async (cursoId: number): Promise<void> => {
    if (!window.confirm("¿Seguro que deseas desinscribirte de este curso?")) return;

    try {
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCursos(cursos.filter((curso) => curso.id !== cursoId));
      alert("✅ Te has desinscrito del curso correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al desinscribirse del curso");
    }
  };

  if (loading) {
    return (
      <DashboardLayout rol="estudiante">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tus cursos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout rol="estudiante">
      <div className="mis-cursos-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">📚 Mis Cursos</h1>
            <p className="page-subtitle">
              Gestiona y continúa con tus cursos inscritos
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-mini-grid">
          <div className="stat-mini-card">
            <BookOpen size={24} className="stat-mini-icon" />
            <div>
              <p className="stat-mini-value">{cursos.length}</p>
              <p className="stat-mini-label">Cursos Activos</p>
            </div>
          </div>

          <div className="stat-mini-card">
            <Clock size={24} className="stat-mini-icon" />
            <div>
              <p className="stat-mini-value">0h</p>
              <p className="stat-mini-label">Tiempo Invertido</p>
            </div>
          </div>

          <div className="stat-mini-card">
            <TrendingUp size={24} className="stat-mini-icon" />
            <div>
              <p className="stat-mini-value">0%</p>
              <p className="stat-mini-label">Progreso Promedio</p>
            </div>
          </div>

          <div className="stat-mini-card">
            <Award size={24} className="stat-mini-icon" />
            <div>
              <p className="stat-mini-value">0</p>
              <p className="stat-mini-label">Completados</p>
            </div>
          </div>
        </div>

        {/* Lista de cursos */}
        {cursos.length === 0 ? (
          <div className="empty-state-large">
            <AlertCircle size={64} className="empty-icon" />
            <h3>No estás inscrito en ningún curso</h3>
            <p>Explora nuestro catálogo y comienza a aprender algo nuevo hoy</p>
            <button 
              onClick={() => navigate("/explorar")}
              className="btn-explore"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="cursos-list">
            {cursos.map((curso) => (
              <div key={curso.id} className="curso-item-card">
                <div className="curso-item-header">
                  <div className="curso-item-icon">
                    <BookOpen size={32} />
                  </div>
                  <div className="curso-item-info">
                    <h3 className="curso-item-title">{curso.titulo}</h3>
                    <p className="curso-item-description">{curso.descripcion}</p>
                  </div>
                </div>

                <div className="curso-item-progress">
                  <div className="progress-info">
                    <span className="progress-label">Progreso del curso</span>
                    <span className="progress-percentage">0%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "0%" }}></div>
                  </div>
                </div>

                <div className="curso-item-actions">
                  <button className="btn-continue">
                    Continuar Aprendiendo
                  </button>
                  <button
                    onClick={() => handleDesinscribirse(curso.id)}
                    className="btn-unsubscribe"
                  >
                    Desinscribirme
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MisCursos;