import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { PlusCircle, X, Eye, EyeOff, Trash2, AlertCircle } from "lucide-react";
import "./AdminCrearCurso.css";

interface Leccion {
  titulo: string;
  contenido: string;
  duracion: number;
}

interface Seccion {
  subtitulo: string;
  descripcion: string;
  lecciones: Leccion[];
  archivos: File[];
}

interface Curso {
  titulo: string;
  descripcion: string;
  nivel: "principiante" | "intermedio" | "avanzado";
  duracion: number;
  secciones: Seccion[];
}

const AdminCrearCurso: React.FC = () => {
  const [curso, setCurso] = useState<Curso>({
    titulo: "",
    descripcion: "",
    nivel: "principiante",
    duracion: 0,
    secciones: [],
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const token = localStorage.getItem("token");

  const handleAddSeccion = () => {
    setCurso({
      ...curso,
      secciones: [
        ...curso.secciones,
        { subtitulo: "", descripcion: "", lecciones: [], archivos: [] },
      ],
    });
  };

  const handleRemoveSeccion = (index: number) => {
    const nuevas = curso.secciones.filter((_, i) => i !== index);
    setCurso({ ...curso, secciones: nuevas });
  };

  const handleSeccionChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const nuevas = [...curso.secciones];
    if (field === "archivos" && value instanceof FileList) {
      nuevas[index].archivos = Array.from(value);
    } else {
      (nuevas[index] as any)[field] = value;
    }
    setCurso({ ...curso, secciones: nuevas });
  };

  const handleAddLeccion = (seccionIndex: number) => {
    const nuevas = [...curso.secciones];
    nuevas[seccionIndex].lecciones.push({
      titulo: "",
      contenido: "",
      duracion: 0,
    });
    setCurso({ ...curso, secciones: nuevas });
  };

  const handleRemoveLeccion = (seccionIndex: number, leccionIndex: number) => {
    const nuevas = [...curso.secciones];
    nuevas[seccionIndex].lecciones = nuevas[seccionIndex].lecciones.filter(
      (_, i) => i !== leccionIndex
    );
    setCurso({ ...curso, secciones: nuevas });
  };

  const handleLeccionChange = (
    seccionIndex: number,
    leccionIndex: number,
    field: string,
    value: any
  ) => {
    const nuevas = [...curso.secciones];
    (nuevas[seccionIndex].lecciones[leccionIndex] as any)[field] = value;
    setCurso({ ...curso, secciones: nuevas });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!curso.titulo || !curso.descripcion) {
    setMensaje({ tipo: "error", texto: "El título y descripción son requeridos" });
    return;
  }

  if (curso.secciones.length === 0) {
    setMensaje({ tipo: "error", texto: "Debes agregar al menos una sección" });
    return;
  }

  setCargando(true);
  setMensaje(null);

  try {
    const formData = new FormData();
    formData.append("titulo", curso.titulo);
    formData.append("descripcion", curso.descripcion);
    formData.append("nivel", curso.nivel);
    formData.append("duracion", curso.duracion.toString());
    formData.append("profesorId", "1");

    // Agregar secciones con lecciones como JSON
    const seccionesData = curso.secciones.map((s) => ({
      subtitulo: s.subtitulo,
      descripcion: s.descripcion,
      lecciones: s.lecciones.map((l) => ({
        titulo: l.titulo,
        contenido: l.contenido,
        duracion: l.duracion,
      })),
    }));

    formData.append("secciones", JSON.stringify(seccionesData));

    // Agregar archivos con identificador de sección
    curso.secciones.forEach((s, idx) => {
      s.archivos.forEach((file) => {
        formData.append(`seccion_${idx}_archivos`, file);
      });
    });

    await axios.post(
      "http://localhost:4000/cursos/crear-con-secciones",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setMensaje({ tipo: "success", texto: "✅ Curso creado exitosamente" });
    
    // Limpiar formulario
    setCurso({
      titulo: "",
      descripcion: "",
      nivel: "principiante",
      duracion: 0,
      secciones: [],
    });

    setTimeout(() => {
      setMensaje(null);
    }, 5000);
  } catch (error: any) {
    console.error("❌ Error completo:", error);
    const errorMsg = error.response?.data?.error || "Error al crear el curso";
    setMensaje({ tipo: "error", texto: `❌ ${errorMsg}` });
  } finally {
    setCargando(false);
  }
};

  return (
    <DashboardLayout rol="admin">
      <div className="admin-crear-curso">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">🧠 Crear Nuevo Curso</h1>
            <p className="dashboard-subtitle">Configura todas las secciones y lecciones</p>
          </div>
          <button
            className="btn-toggle-preview"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff size={18} />
                Ocultar Vista Previa
              </>
            ) : (
              <>
                <Eye size={18} />
                Ver Vista Previa
              </>
            )}
          </button>
        </div>

        {mensaje && (
          <div className={`alert alert-${mensaje.tipo}`}>
            <AlertCircle size={20} />
            <span>{mensaje.texto}</span>
          </div>
        )}

        <div className={`crear-curso-container ${showPreview ? "with-preview" : ""}`}>
          {/* Formulario */}
          <div className="form-section">
            <form onSubmit={handleSubmit} className="curso-form">
              {/* Info General */}
              <div className="form-card">
                <h2 className="form-section-title">Información General</h2>

                <div className="form-group">
                  <label>Título del Curso</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: React Avanzado"
                    value={curso.titulo}
                    onChange={(e) => setCurso({ ...curso, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    className="form-control"
                    placeholder="Describe el contenido del curso..."
                    rows={4}
                    value={curso.descripcion}
                    onChange={(e) => setCurso({ ...curso, descripcion: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nivel</label>
                    <select
                      className="form-control"
                      value={curso.nivel}
                      onChange={(e) =>
                        setCurso({
                          ...curso,
                          nivel: e.target.value as "principiante" | "intermedio" | "avanzado",
                        })
                      }
                    >
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Duración (horas)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={curso.duracion}
                      onChange={(e) =>
                        setCurso({ ...curso, duracion: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Secciones */}
              <div className="form-card">
                <div className="form-section-header">
                  <h2 className="form-section-title">Secciones y Lecciones</h2>
                  <button
                    type="button"
                    className="btn-add-seccion"
                    onClick={handleAddSeccion}
                  >
                    <PlusCircle size={18} />
                    Agregar Sección
                  </button>
                </div>

                {curso.secciones.map((seccion, secIdx) => (
                  <div key={secIdx} className="seccion-box">
                    <div className="seccion-header">
                      <span className="seccion-number">Sección {secIdx + 1}</span>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveSeccion(secIdx)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Título de la Sección</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Fundamentos"
                        value={seccion.subtitulo}
                        onChange={(e) =>
                          handleSeccionChange(secIdx, "subtitulo", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Descripción de la Sección</label>
                      <textarea
                        className="form-control"
                        placeholder="Describe el contenido de esta sección..."
                        rows={3}
                        value={seccion.descripcion}
                        onChange={(e) =>
                          handleSeccionChange(secIdx, "descripcion", e.target.value)
                        }
                        required
                      ></textarea>
                    </div>

                    {/* Lecciones */}
                    <div className="lecciones-container">
                      <div className="lecciones-header">
                        <h4>Lecciones ({seccion.lecciones.length})</h4>
                        <button
                          type="button"
                          className="btn-add-leccion"
                          onClick={() => handleAddLeccion(secIdx)}
                        >
                          <PlusCircle size={16} />
                          Agregar Lección
                        </button>
                      </div>

                      {seccion.lecciones.map((leccion, lecIdx) => (
                        <div key={lecIdx} className="leccion-item">
                          <div className="leccion-header-item">
                            <span className="leccion-number">Lección {lecIdx + 1}</span>
                            <button
                              type="button"
                              className="btn-remove-leccion"
                              onClick={() => handleRemoveLeccion(secIdx, lecIdx)}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="form-group">
                            <label>Título de la Lección</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: Introducción"
                              value={leccion.titulo}
                              onChange={(e) =>
                                handleLeccionChange(secIdx, lecIdx, "titulo", e.target.value)
                              }
                              required
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Contenido</label>
                              <textarea
                                className="form-control"
                                placeholder="Contenido de la lección..."
                                rows={2}
                                value={leccion.contenido}
                                onChange={(e) =>
                                  handleLeccionChange(secIdx, lecIdx, "contenido", e.target.value)
                                }
                              ></textarea>
                            </div>

                            <div className="form-group">
                              <label>Duración (minutos)</label>
                              <input
                                type="number"
                                className="form-control"
                                min="0"
                                value={leccion.duracion}
                                onChange={(e) =>
                                  handleLeccionChange(
                                    secIdx,
                                    lecIdx,
                                    "duracion",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Archivos */}
                    <div className="form-group">
                      <label>Archivos de la Sección</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={(e) =>
                          handleSeccionChange(secIdx, "archivos", e.target.files)
                        }
                      />
                      {seccion.archivos.length > 0 && (
                        <div className="archivos-list">
                          {seccion.archivos.map((file, idx) => (
                            <span key={idx} className="archivo-badge">
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón Enviar */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <span className="spinner-small"></span>
                      Creando curso...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} />
                      Crear Curso
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Vista Previa */}
          {showPreview && (
            <div className="preview-section">
              <div className="preview-card">
                <h2 className="preview-title">Vista Previa</h2>

                {curso.titulo ? (
                  <div className="preview-content">
                    <h3 className="preview-curso-titulo">{curso.titulo}</h3>

                    <div className="preview-meta">
                      <span className="badge-nivel">{curso.nivel}</span>
                      <span className="badge-duracion">{curso.duracion}h</span>
                    </div>

                    <p className="preview-descripcion">{curso.descripcion}</p>

                    {curso.secciones.length > 0 ? (
                      <div className="preview-secciones">
                        <h4>Contenido del Curso</h4>
                        {curso.secciones.map((sec, idx) => (
                          <div key={idx} className="preview-seccion">
                            <h5>
                              {idx + 1}. {sec.subtitulo || "Sin título"}
                            </h5>
                            <p>{sec.descripcion || "Sin descripción"}</p>

                            {sec.lecciones.length > 0 && (
                              <ul className="preview-lecciones">
                                {sec.lecciones.map((lec, lecIdx) => (
                                  <li key={lecIdx}>
                                    {lec.titulo} ({lec.duracion} min)
                                  </li>
                                ))}
                              </ul>
                            )}

                            {sec.archivos.length > 0 && (
                              <div className="preview-archivos">
                                <strong>Archivos:</strong>
                                {sec.archivos.map((file, fIdx) => (
                                  <span key={fIdx} className="archivo-preview">
                                    {file.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="preview-empty">No hay secciones agregadas</p>
                    )}
                  </div>
                ) : (
                  <p className="preview-empty">Completa el formulario para ver la vista previa</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCrearCurso;