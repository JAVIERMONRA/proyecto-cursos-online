import { Request, Response } from "express";
import pool from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface Curso extends RowDataPacket {
  id: number;
  titulo: string;
  descripcion: string;
  profesorId: number;
  createdAt: Date;
}

interface Inscripcion extends RowDataPacket {
  usuarioId: number;
  cursoId: number;
}

export const listarCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<Curso[]>("SELECT * FROM cursos");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};

export const obtenerCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<Curso[]>(
      "SELECT * FROM cursos WHERE id = ?", 
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener curso:", error);
    res.status(500).json({ error: "Error al obtener curso" });
  }
};

export const crearCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, descripcion, profesorId } = req.body;

    if (!titulo || !descripcion) {
      res.status(400).json({ error: "Título y descripción son requeridos" });
      return;
    }

    const profId = profesorId || req.user?.id;

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO cursos (titulo, descripcion, profesorId) VALUES (?, ?, ?)",
      [titulo, descripcion, profId]
    );

    res.status(201).json({ 
      mensaje: "Curso creado exitosamente", 
      cursoId: result.insertId 
    });
  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({ error: "Error al crear curso" });
  }
};

export const actualizarCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, profesorId } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE cursos SET titulo = ?, descripcion = ?, profesorId = ? WHERE id = ?",
      [titulo, descripcion, profesorId, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    res.json({ mensaje: "Curso actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    res.status(500).json({ error: "Error al actualizar curso" });
  }
};

export const eliminarCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM cursos WHERE id = ?", 
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    res.json({ mensaje: "Curso eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    res.status(500).json({ error: "Error al eliminar curso" });
  }
};

export const misCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const [rows] = await pool.query<Curso[]>(
      `SELECT c.* 
       FROM cursos c
       JOIN inscripciones i ON c.id = i.cursoId
       WHERE i.usuarioId = ?`,
      [usuarioId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener mis cursos:", error);
    res.status(500).json({ error: "Error al obtener mis cursos" });
  }
};

export const inscribirEnCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const [existe] = await pool.query<Inscripcion[]>(
      "SELECT * FROM inscripciones WHERE usuarioId = ? AND cursoId = ?",
      [usuarioId, id]
    );

    if (existe.length > 0) {
      res.status(400).json({ error: "Ya estás inscrito en este curso" });
      return;
    }

    await pool.query(
      "INSERT INTO inscripciones (usuarioId, cursoId) VALUES (?, ?)",
      [usuarioId, id]
    );

    res.json({ message: "Inscripción exitosa" });
  } catch (error) {
    console.error("Error al inscribirse:", error);
    res.status(500).json({ error: "Error al inscribirse en el curso" });
  }
};