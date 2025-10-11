/**
 * Componente: AdminCrearCurso
 * --------------------------------------------
 * Este componente permite a un administrador crear un curso con múltiples secciones.
 * Cada sección puede incluir subtítulo, descripción y archivos adjuntos (como imágenes o documentos).
 * También incluye una vista previa en tiempo real del curso antes de enviarlo al backend.
 */

import React, { useState } from "react";
import { Form, Button, Card, Row, Col, ListGroup, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

/** Interfaz que define la estructura de una sección del curso */
interface Seccion {
  subtitulo: string;
  descripcion: string;
  archivos: File[];
}

/** Interfaz que define la estructura de un curso */
interface Curso {
  titulo: string;
  descripcion: string;
  secciones: Seccion[];
}

/**
 * Componente principal para la creación de cursos por parte del administrador.
 */
const AdminCrearCurso: React.FC = () => {
  /** Estado principal del curso a crear */
  const [curso, setCurso] = useState<Curso>({
    titulo: "",
    descripcion: "",
    secciones: [],
  });

  /** Estados de control para la interfaz */
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Agrega una nueva sección vacía al curso */
  const handleAddSeccion = () => {
    setCurso({
      ...curso,
      secciones: [...curso.secciones, { subtitulo: "", descripcion: "", archivos: [] }],
    });
  };

  /**
   * Elimina una sección según su índice
   * @param index Índice de la sección a eliminar
   */
  const handleRemoveSeccion = (index: number) => {
    const nuevas = curso.secciones.filter((_, i) => i !== index);
    setCurso({ ...curso, secciones: nuevas });
  };

  /**
   * Maneja los cambios en los campos de una sección (texto o archivos)
   * @param index Índice de la sección modificada
   * @param field Campo que se está editando (subtitulo, descripcion o archivos)
   * @param value Nuevo valor o lista de archivos
   */
  const handleSeccionChange = (
    index: number,
    field: keyof Seccion,
    value: string | FileList | null
  ) => {
    const nuevas = [...curso.secciones];
    if (field === "archivos" && value instanceof FileList) {
      nuevas[index].archivos = Array.from(value);
    } else if (typeof value === "string") {
      (nuevas[index] as any)[field] = value;
    }
    setCurso({ ...curso, secciones: nuevas });
  };

  /**
   * Envía el formulario con los datos del curso al backend
   * Utiliza FormData para incluir archivos y datos JSON en una sola solicitud
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("titulo", curso.titulo);
    formData.append("descripcion", curso.descripcion);
    formData.append("profesorId", "1"); // ID fijo (debería cambiarse por el usuario autenticado)

    // Agregar las secciones al FormData como JSON
    formData.append(
      "secciones",
      JSON.stringify(
        curso.secciones.map((s) => ({
          subtitulo: s.subtitulo,
          descripcion: s.descripcion,
        }))
      )
    );

    // Agregar archivos por subtítulo de sección
    curso.secciones.forEach((s) => {
      s.archivos.forEach((file) => {
        formData.append(s.subtitulo, file);
      });
    });

    try {
      const response = await fetch("http://localhost:4000/cursos/crear-con-secciones", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al crear el curso");

      alert("✅ Curso creado exitosamente");
      console.log("📘 Curso creado:", data);
      setCurso({ titulo: "", descripcion: "", secciones: [] });
    } catch (error: any) {
      console.error("❌ Error al crear curso:", error);
      alert("Error al crear curso: " + error.message);
    }
  };

  return (
    <div className="container mt-5 pt-4">
      <h2 className="mb-4 text-center">🎓 Crear Nuevo Curso</h2>
      <Row>
        {/* === Formulario principal === */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Campo: título del curso */}
                <Form.Group className="mb-3">
                  <Form.Label>Título del curso</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Introducción a React"
                    value={curso.titulo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCurso({ ...curso, titulo: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                {/* Campo: descripción general */}
                <Form.Group className="mb-4">
                  <Form.Label>Descripción general</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe brevemente de qué trata este curso..."
                    value={curso.descripcion}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCurso({ ...curso, descripcion: e.target.value })
                    }
                  />
                </Form.Group>

                {/* Secciones dinámicas */}
                <h5 className="mb-3">Secciones del Curso</h5>

                {curso.secciones.map((seccion, index) => (
                  <Card key={index} className="mb-4 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6>📘 Sección {index + 1}</h6>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveSeccion(index)}
                        >
                          Eliminar
                        </Button>
                      </div>

                      {/* Campo: subtítulo de la sección */}
                      <Form.Group className="mb-2">
                        <Form.Label>Subtítulo</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Ej: Fundamentos de React"
                          value={seccion.subtitulo}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSeccionChange(index, "subtitulo", e.target.value)
                          }
                          required
                        />
                      </Form.Group>

                      {/* Campo: descripción de la sección */}
                      <Form.Group className="mb-2">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Detalles de esta sección..."
                          value={seccion.descripcion}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleSeccionChange(index, "descripcion", e.target.value)
                          }
                        />
                      </Form.Group>

                      {/* Campo: archivos adjuntos */}
                      <Form.Group className="mb-2">
                        <Form.Label>Archivos adjuntos</Form.Label>
                        <Form.Control
                          type="file"
                          multiple
                          onChange={(e) =>
                            handleSeccionChange(
                              index,
                              "archivos",
                              (e.target as HTMLInputElement).files
                            )
                          }
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}

                {/* Botón para agregar secciones */}
                <div className="d-flex gap-2 mb-4">
                  <Button
                    variant="outline-primary"
                    type="button"
                    onClick={handleAddSeccion}
                  >
                    ➕ Agregar Sección
                  </Button>
                </div>

                {/* Botón principal de guardado */}
                <Button type="submit" variant="success" className="w-100" disabled={cargando}>
                  {cargando ? <Spinner animation="border" size="sm" /> : "💾 Guardar Curso"}
                </Button>
              </Form>

              {/* Mensajes de éxito o error */}
              {mensaje && <Alert variant="success" className="mt-3">{mensaje}</Alert>}
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card.Body>
          </Card>
        </Col>

        {/* === Vista previa del curso === */}
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="text-center mb-3">👀 Vista previa del curso</h5>
              {curso.titulo ? (
                <>
                  <h4 className="fw-bold">{curso.titulo}</h4>
                  <p>{curso.descripcion || "Sin descripción general."}</p>

                  {curso.secciones.length > 0 ? (
                    <ListGroup variant="flush">
                      {curso.secciones.map((sec, idx) => (
                        <ListGroup.Item key={idx} className="mb-2">
                          <h6 className="fw-semibold">
                            {idx + 1}. {sec.subtitulo || "(Sin subtítulo)"}
                          </h6>
                          <p className="small text-muted mb-1">
                            {sec.descripcion || "Sin descripción"}
                          </p>
                          {sec.archivos.length > 0 && (
                            <ul className="mb-0 small">
                              {sec.archivos.map((file, i) => (
                                <li key={i}>
                                  {file.type.startsWith("image/") ? (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt="preview"
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        marginRight: "8px",
                                      }}
                                    />
                                  ) : (
                                    <span>📄 {file.name}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted fst-italic">
                      No hay secciones añadidas todavía.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted text-center fst-italic">
                  Completa el formulario para ver la vista previa.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminCrearCurso;
