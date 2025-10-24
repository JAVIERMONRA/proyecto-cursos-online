import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Award, ArrowLeft, PlayCircle } from "lucide-react";
import "./CursoDetalle.css";

interface Leccion {
  id: number;
  titulo: string;
  contenido: string;
  duracion: number;
  completado: boolean;
}

interface Seccion {
  id: number;
  subtitulo: string;
  descripcion: string;
  lecciones: Leccion[];
}

interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  progreso: number;
  completado: boolean;
  secciones: Seccion[];
}

const CursoDetalle: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const rol = (localStorage.getItem("rol") as "admin" | "estudiante") || "estudiante";

  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSecciones, setExpandedSecciones] = useState<number[]>([]);
  const [marcandoLeccion, setMarcandoLeccion] = useState<number | null>(null);
  const [certificado, setCertificado] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cursoId) {
      fetchCursoDetalle();
    }
  }, [cursoId]);

  const fetchCursoDetalle = async () => {
    try {
      console.log("📖 Cargando curso:", cursoId);
      const res = await axios.get(
        `http://localhost:4000/progreso/${cursoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Curso cargado:", res.data);
      setCurso(res.data);
      setExpandedSecciones([res.data.secciones?.[0]?.id || 0]);
      
      if (res.data.completado) {
        fetchCertificado();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error al cargar el curso";
      setError(errorMsg);
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificado = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/progreso/${cursoId}/certificado`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("🏆 Certificado cargado:", res.data);
      setCertificado(res.data);
    } catch (err) {
      console.log("ℹ️ No hay certificado disponible aún");
    }
  };

  const toggleSeccion = (seccionId: number) => {
    setExpandedSecciones((prev) =>
      prev.includes(seccionId)
        ? prev.filter((id) => id !== seccionId)
        : [...prev, seccionId]
    );
  };

  const marcarLeccionCompletada = async (leccionId: number) => {
    setMarcandoLeccion(leccionId);
    try {
      console.log("✅ Marcando lección como completada:", leccionId);
      const res = await axios.post(
        `http://localhost:4000/progreso/${cursoId}/leccion/${leccionId}/completar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📊 Respuesta:", res.data);

      setCurso((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progreso: res.data.progreso,
          completado: res.data.completado,
          secciones: prev.secciones.map((sec) => ({
            ...sec,
            lecciones: sec.lecciones.map((lec) =>
              lec.id === leccionId ? { ...lec, completado: true } : lec
            ),
          })),
        };
      });

      if (res.data.completado && res.data.certificado) {
        setCertificado({
          codigo: res.data.certificado,
          fechaEmision: new Date().toISOString(),
          nombre: "Estudiante",
          titulo: curso?.titulo
        });
        alert("🎉 ¡Felicidades! Has completado el curso. Tu certificado está disponible.");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error al marcar lección";
      setError(errorMsg);
      console.error("❌ Error:", err);
      alert("❌ " + errorMsg);
    } finally {
      setMarcandoLeccion(null);
    }
  };

  const descargarCertificado = async () => {
  if (!certificado) return;

  try {
    const response = await axios.get(
      `http://localhost:4000/progreso/${cursoId}/certificado/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Importante para descargar archivos
      }
    );

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Certificado-${certificado.codigo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log("✅ Certificado descargado exitosamente");
  } catch (error) {
    console.error("❌ Error al descargar certificado:", error);
    alert("Error al descargar el certificado. Intenta de nuevo.");
  }
};

  if (loading) {
    return (
      <DashboardLayout rol={rol}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando curso...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !curso) {
    return (
      <DashboardLayout rol={rol}>
        <div className="error-container">
          <div className="error-message">
            <span>{error || "No se pudo cargar el curso"}</span>
          </div>
          <button onClick={() => navigate("/mis-cursos")} className="btn-back">
            <ArrowLeft size={18} />
            Volver a mis cursos
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const leccionesCompletadas = curso.secciones.reduce(
    (acc, sec) => acc + sec.lecciones.filter((l) => l.completado).length,
    0
  );

  const leccionesTotales = curso.secciones.reduce(
    (acc, sec) => acc + sec.lecciones.length,
    0
  );

  return (
    <DashboardLayout rol={rol}>
      <div className="curso-detalle-page">
        <div className="curso-header">
          <button
            onClick={() => navigate("/mis-cursos")}
            className="btn-volver"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="curso-header-info">
            <h1 className="curso-titulo">{curso.titulo}</h1>
            <p className="curso-descripcion">{curso.descripcion}</p>
          </div>
        </div>

        <div className="progreso-general-card">
          <div className="progreso-info">
            <div className="progreso-stats">
              <div className="stat">
                <span className="stat-label">Progreso General</span>
                <span className="stat-value">{curso.progreso}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Lecciones Completadas</span>
                <span className="stat-value">
                  {leccionesCompletadas}/{leccionesTotales}
                </span>
              </div>
            </div>
            <div className="progreso-bar">
              <div className="progreso-fill" style={{ width: `${curso.progreso}%` }}></div>
            </div>
          </div>

          {curso.completado && certificado && (
            <div className="certificado-awarded">
              <Award size={48} className="award-icon" />
              <div className="certificado-info">
                <h3>🎉 ¡Curso Completado!</h3>
                <p>Has completado exitosamente este curso. Descarga tu certificado.</p>
                <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '1rem' }}>
                  Código: {certificado.codigo}
                </p>
                <button onClick={descargarCertificado} className="btn-descargar-cert">
                  📄 Descargar Certificado
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="secciones-container">
          <h2 className="secciones-title">Contenido del Curso</h2>

          {curso.secciones.map((seccion, idx) => {
            const leccionesCompletadas = seccion.lecciones.filter(
              (l) => l.completado
            ).length;
            const isExpanded = expandedSecciones.includes(seccion.id);

            return (
              <div key={seccion.id} className="seccion-card">
                <button
                  className="seccion-header"
                  onClick={() => toggleSeccion(seccion.id)}
                >
                  <div className="seccion-title-group">
                    <span className="seccion-number">Sección {idx + 1}</span>
                    <h3 className="seccion-titulo">{seccion.subtitulo}</h3>
                  </div>
                  <div className="seccion-meta">
                    <span className="seccion-progress">
                      {leccionesCompletadas}/{seccion.lecciones.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="seccion-content">
                    <p className="seccion-descripcion">{seccion.descripcion}</p>

                    <div className="lecciones-list">
                      {seccion.lecciones.map((leccion) => (
                        <div key={leccion.id} className="leccion-item">
                          <div className="leccion-header">
                            <div className="leccion-icon-title">
                              {leccion.completado ? (
                                <CheckCircle2 size={20} className="icon-completada" />
                              ) : (
                                <Circle size={20} className="icon-pendiente" />
                              )}
                              <div className="leccion-info">
                                <h4 className="leccion-titulo">
                                  {leccion.titulo}
                                </h4>
                                <span className="leccion-duracion">
                                  {leccion.duracion} min
                                </span>
                              </div>
                            </div>
                            {!leccion.completado && (
                              <button
                                onClick={() =>
                                  marcarLeccionCompletada(leccion.id)
                                }
                                disabled={marcandoLeccion === leccion.id}
                                className="btn-completar"
                              >
                                {marcandoLeccion === leccion.id ? (
                                  <span className="spinner-small"></span>
                                ) : (
                                  <>
                                    <PlayCircle size={16} />
                                    Marcar como completada
                                  </>
                                )}
                              </button>
                            )}
                            {leccion.completado && (
                              <span className="badge-completada">
                                ✓ Completada
                              </span>
                            )}
                          </div>

                          {leccion.contenido && (
                            <div className="leccion-contenido">
                              <p>{leccion.contenido}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CursoDetalle;