import { useState } from "react";
import axios from "axios";

interface CrearCursoFormProps {
  onCursoCreado: () => void;
}

interface Seccion {
  subtitulo: string;
  descripcion: string;
  archivos: File[];
}

/**
 * Componente `CrearCursoForm`
 * 
 * Este componente permite a un usuario con permisos de administrador crear un nuevo curso con múltiples secciones.
 * Cada sección puede incluir un subtítulo, descripción y archivos adjuntos.
 * 
 * Funcionalidades principales:
 * - Crear un curso con título, descripción y secciones dinámicas.
 * - Subir archivos asociados a cada sección.
 * - Enviar los datos al backend mediante `axios` con autenticación por token JWT.
 * - Mostrar mensajes de carga y confirmación o error.
 */
function CrearCursoForm({ onCursoCreado }: CrearCursoFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [secciones, setSecciones] = useState<Seccion[]>([
    { subtitulo: "", descripcion: "", archivos: [] },
  ]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const token = localStorage.getItem("token");

  /**
   * Agrega una nueva sección vacía al formulario.
   */
  const agregarSeccion = () => {
    setSecciones([...secciones, { subtitulo: "", descripcion: "", archivos: [] }]);
  };

  /**
   * Elimina una sección del formulario según su índice.
   * @param index Índice de la sección a eliminar.
   */
  const eliminarSeccion = (index: number) => {
    setSecciones(secciones.filter((_, i) => i !== index));
  };

  /**
   * Maneja los cambios en los campos de una sección (texto o archivos).
   */
  const handleSeccionChange = (
    index: number,
    field: keyof Seccion,
    value: string | FileList
  ) => {
    const nuevas = [...secciones];
    if (field === "archivos" && value instanceof FileList) {
      nuevas[index].archivos = Array.from(value);
    } else if (typeof value === "string") {
      (nuevas[index][field] as any) = value;
    }
    setSecciones(nuevas);
  };

  /**
   * Envía el formulario al servidor para crear un curso con sus secciones y archivos.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descripcion", descripcion);
      formData.append("secciones", JSON.stringify(secciones));

      // Agregar archivos de todas las secciones
      secciones.forEach((sec, i) => {
        sec.archivos.forEach((file) => {
          formData.append(`archivos_seccion_${i}`, file);
        });
      });

      await axios.post("http://localhost:4000/cursos/crear-con-secciones", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMensaje("✅ Curso creado correctamente");
      setTitulo("");
      setDescripcion("");
      setSecciones([{ subtitulo: "", descripcion: "", archivos: [] }]);
      onCursoCreado();
    } catch (error) {
      console.error("Error al crear curso:", error);
      setMensaje("❌ Ocurrió un error al crear el curso");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-bold">Título del curso</label>
        <input
          type="text"
          className="form-control"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Descripción</label>
        <textarea
          className="form-control"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        ></textarea>
      </div>

      <hr />
      <h5 className="fw-bold mt-3">Secciones</h5>

      {secciones.map((sec, index) => (
        <div key={index} className="border rounded p-3 mb-3 bg-light">
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label">Subtítulo</label>
              <input
                type="text"
                className="form-control"
                value={sec.subtitulo}
                onChange={(e) =>
                  handleSeccionChange(index, "subtitulo", e.target.value)
                }
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-control"
                value={sec.descripcion}
                onChange={(e) =>
                  handleSeccionChange(index, "descripcion", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="form-label">Archivos (opcional)</label>
            <input
              type="file"
              className="form-control"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleSeccionChange(index, "archivos", e.target.files);
                }
              }}
            />
          </div>

          {secciones.length > 1 && (
            <button
              type="button"
              className="btn btn-danger btn-sm mt-2"
              onClick={() => eliminarSeccion(index)}
            >
              <i className="bi bi-trash"></i> Eliminar sección
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary mb-3"
        onClick={agregarSeccion}
      >
        + Agregar sección
      </button>

      <div>
        <button type="submit" className="btn btn-success" disabled={cargando}>
          {cargando ? "Creando curso..." : "Crear curso"}
        </button>
      </div>

      {mensaje && <p className="mt-3 fw-semibold">{mensaje}</p>}
    </form>
  );
}

export default CrearCursoForm;
