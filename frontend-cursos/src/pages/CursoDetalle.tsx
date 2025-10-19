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
      const res = await axios.get(
        `http://localhost:4000/progreso/${cursoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurso(res.data);
      setExpandedSecciones([res.data.secciones?.[0]?.id || 0]);
      
      // Si está completado, cargar certificado
      if (res.data.completado) {
        fetchCertificado();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error al cargar el curso";
      setError(errorMsg);
      console.error(err);
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
      setCertificado(res.data);
    } catch (err) {
      console.error("Error al cargar certificado:", err);
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
      const res = await axios.post(
        `http://localhost:4000/progreso/${cursoId}/leccion/${leccionId}/completar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizar estado local
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

      if (res.data.completado) {
        setCertificado({
          codigo: res.data.certificado,
          fechaEmision: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error al marcar lección";
      setError(errorMsg);
      console.error(err);
    } finally {
      setMarcandoLeccion(null);
    }
  };

  const descargarCertificado = () => {
    if (!certificado) return;

    const contenido = `
CERTIFICADO DE COMPLETITUD

Nombre: ${certificado.nombre || "Estudiante"}
Curso: ${curso?.titulo}
Código: ${certificado.codigo}
Fecha de Emisión: ${new Date(certificado.fechaEmision).toLocaleDateString()}

Este certificado acredita que el participante ha completado exitosamente
todos los requisitos del curso y ha demostrado competencia en el material.
    `.trim();

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(contenido)
    );
    element.setAttribute("download", `certificado-${certificado.codigo}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        {/* Header */}
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

        {/* Progreso General */}
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
              <Award size={24} className="award-icon" />
              <div className="certificado-info">
                <h3>¡Curso Completado!</h3>
                <p>Has completado exitosamente este curso. Descarga tu certificado.</p>
                <button onClick={descargarCertificado} className="btn-descargar-cert">
                  📄 Descargar Certificado
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Secciones y Lecciones */}
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