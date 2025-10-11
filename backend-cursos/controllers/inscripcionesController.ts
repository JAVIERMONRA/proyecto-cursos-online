import { Request, Response } from "express";
import pool from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Representa la estructura básica de un curso dentro del sistema.
 */
interface Curso extends RowDataPacket {
  id: number;
  titulo: string;
  descripcion: string;
}

/**
 * Permite a un usuario autenticado inscribirse en un curso específico.
 * 
 * - Requiere que el usuario esté autenticado.
 * - Registra la inscripción en la tabla `inscripciones`.
 * - Controla si el usuario ya se encuentra inscrito en el curso.
 */
export const inscribirseCurso = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = req.user?.id;
  const { cursoId } = req.params;

  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    await pool.query(
      "INSERT INTO inscripciones (usuarioId, cursoId) VALUES (?, ?)",
      [usuarioId, cursoId]
    );
    res.json({ message: "Inscripción exitosa" });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Ya estás inscrito en este curso" });
      return;
    }
    console.error("Error al inscribirse:", error);
    res.status(500).json({ error: "Error al inscribirse en el curso" });
  }
};

/**
 * Obtiene todos los cursos en los que el usuario autenticado se encuentra inscrito.
 * 
 * - Verifica autenticación del usuario.
 * - Realiza una unión entre las tablas `cursos` e `inscripciones`.
 * - Retorna la lista de cursos asociados al usuario.
 */
export const obtenerMisCursos = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const [rows] = await pool.query<Curso[]>(
      `SELECT c.id, c.titulo, c.descripcion 
       FROM cursos c
       INNER JOIN inscripciones i ON c.id = i.cursoId
       WHERE i.usuarioId = ?`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener mis cursos:", error);
    res.status(500).json({ error: "Error al obtener mis cursos" });
  }
};

/**
 * Permite a un usuario autenticado desinscribirse de un curso.
 * 
 * - Elimina el registro de la tabla `inscripciones`.
 * - Verifica si el usuario realmente estaba inscrito antes de eliminar.
 */
export const desinscribirseCurso = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = req.user?.id;
  const { cursoId } = req.params;

  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM inscripciones WHERE usuarioId = ? AND cursoId = ?",
      [usuarioId, cursoId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "No estabas inscrito en este curso" });
      return;
    }

    res.json({ message: "Te has desinscrito del curso" });
  } catch (error) {
    console.error("Error al desinscribirse:", error);
    res.status(500).json({ error: "Error al desinscribirse del curso" });
  }
};
