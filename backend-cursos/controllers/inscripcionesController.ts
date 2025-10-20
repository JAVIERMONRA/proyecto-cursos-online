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
  nivel?: string;
  duracion?: number;
  estado?: string;
  progreso?: number;
  completado?: boolean;
}

/**
 * Estructura de inscripción (opcional, para consultas internas).
 */
interface Inscripcion extends RowDataPacket {
  id: number;
  usuarioId: number;
  cursoId: number;
  progreso?: number;
  completado?: boolean;
  fechaInscripcion?: string;
}

/**
 * Inscribe al usuario autenticado en el curso indicado.
 * POST /inscripciones/:cursoId
 */
export const inscribirseCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cursoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Verificar si ya existe la inscripción
    const [existe] = await pool.query<Inscripcion[]>(
      "SELECT * FROM inscripciones WHERE usuarioId = ? AND cursoId = ?",
      [usuarioId, cursoId]
    );

    if (existe.length > 0) {
      res.status(400).json({ error: "Ya estás inscrito en este curso" });
      return;
    }

    // Insertar inscripción (progreso por defecto 0)
    await pool.query(
      "INSERT INTO inscripciones (usuarioId, cursoId, progreso, completado, fechaInscripcion) VALUES (?, ?, 0, 0, NOW())",
      [usuarioId, cursoId]
    );

    res.json({ message: "Inscripción exitosa" });
  } catch (error) {
    console.error("Error al inscribirse:", error);
    res.status(500).json({ error: "Error al inscribirse en el curso" });
  }
};

/**
 * Obtener los cursos en los que está inscrito el usuario.
 * GET /inscripciones/mis-cursos
 */
export const obtenerMisCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const [rows] = await pool.query<Curso[]>(
      `SELECT c.id, c.titulo, c.descripcion, c.nivel, c.duracion, c.estado,
              COALESCE(i.progreso, 0) as progreso, COALESCE(i.completado, 0) as completado
       FROM cursos c
       JOIN inscripciones i ON c.id = i.cursoId
       WHERE i.usuarioId = ?
       ORDER BY i.fechaInscripcion DESC`,
      [usuarioId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener mis cursos:", error);
    res.status(500).json({ error: "Error al obtener mis cursos" });
  }
};

/**
 * Desinscribir al usuario de un curso.
 * DELETE /inscripciones/:cursoId
 */
export const desinscribirseCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cursoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

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
