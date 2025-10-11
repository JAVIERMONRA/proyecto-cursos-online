import { useEffect, useState } from "react";
import axios from "axios";

/**
 * 📘 Interface Curso
 * Define la estructura de un curso que el estudiante tiene inscrito.
 */
interface Curso {
  id: number;          // Identificador único del curso
  titulo: string;      // Título del curso
  descripcion: string; // Breve descripción del curso
}

/**
 * 🎓 Componente: MisCursos
 * Muestra los cursos en los que el estudiante está inscrito.
 * Permite además desinscribirse de cualquiera de ellos.
 */
function MisCursos() {
  /** 🧩 Estado para almacenar los cursos del estudiante */
  const [cursos, setCursos] = useState<Curso[]>([]);

  /** 🔐 Token del usuario almacenado en localStorage */
  const token = localStorage.getItem("token");

  /**
   * 📦 useEffect:
   * Al cargar el componente, obtiene los cursos inscritos del estudiante
   * desde la API `/inscripciones/mis-cursos`, utilizando el token para autenticación.
   */
  useEffect(() => {
    // Si no hay token, no intenta cargar los cursos
    if (!token) return;
    
    const fetchMisCursos = async () => {
      try {
        // 🔹 Petición GET al backend con encabezado de autorización
        const res = await axios.get<Curso[]>(
          "http://localhost:4000/inscripciones/mis-cursos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Actualiza el estado con los cursos recibidos
        setCursos(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMisCursos();
  }, [token]);

  /**
   * ❌ handleDesinscribirse:
   * Permite al usuario eliminar su inscripción en un curso.
   * Se confirma la acción y luego se envía una solicitud DELETE al backend.
   * @param cursoId - ID del curso a desinscribirse
   */
  const handleDesinscribirse = async (cursoId: number): Promise<void> => {
    // 🧭 Confirmación antes de continuar
    if (!window.confirm("¿Seguro que deseas salirte de este curso?")) return;

    try {
      // 🔹 Solicitud DELETE al backend
      await axios.delete(`http://localhost:4000/inscripciones/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🧹 Elimina el curso del estado local
      setCursos(cursos.filter((curso) => curso.id !== cursoId));

      // ✅ Notificación de éxito
      alert("Te desinscribiste del curso con éxito ✅");
    } catch (err) {
      console.error(err);
      alert("Error al desinscribirse del curso ❌");
    }
  };

  /**
   * 🖥️ Renderizado del componente
   * Muestra la lista de cursos, o un mensaje si no hay ninguno.
   */
  return (
    <div style={{ padding: "20px", marginTop: "80px" }}>
      <h1>Mis Cursos</h1>

      {/* Si el usuario no tiene cursos, mostrar mensaje */}
      {cursos.length === 0 ? (
        <p>No estás inscrito en ningún curso</p>
      ) : (
        // 📋 Listado de cursos
        <ul>
          {cursos.map((curso) => (
            <li key={curso.id}>
              <strong>{curso.titulo}</strong> - {curso.descripcion}
              <button
                style={{ marginLeft: "10px", color: "red" }}
                onClick={() => handleDesinscribirse(curso.id)}
              >
                Desinscribirse
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MisCursos;
