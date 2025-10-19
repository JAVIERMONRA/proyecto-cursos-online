import { Request, Response } from "express";
import pool from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface StatsResult extends RowDataPacket {
  totalCursos?: number;
  totalUsuarios?: number;
  totalInscripciones?: number;
  count?: number;
}

interface CursoPopular extends RowDataPacket {
  cursoId: number;
  titulo: string;
  inscripciones: number;
}

interface UsuarioReciente extends RowDataPacket {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fechaRegistro: Date;
}

interface InscripcionMensual extends RowDataPacket {
  mes: string;
  total: number;
}

/**
 * Obtener estadísticas generales del sistema
 */
export const obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total de cursos
    const [[cursosResult]] = await pool.query<StatsResult[]>(
      "SELECT COUNT(*) AS totalCursos FROM cursos WHERE estado = 'activo'"
    );

    // Total de usuarios
    const [[usuariosResult]] = await pool.query<StatsResult[]>(
      "SELECT COUNT(*) AS totalUsuarios FROM usuarios"
    );

    // Total de inscripciones
    const [[inscripcionesResult]] = await pool.query<StatsResult[]>(
      "SELECT COUNT(*) AS totalInscripciones FROM inscripciones"
    );

    // Cursos más populares (top 5)
    const [cursosPopulares] = await pool.query<CursoPopular[]>(
      `SELECT 
        c.id as cursoId,
        c.titulo,
        COUNT(i.id) as inscripciones
      FROM cursos c
      LEFT JOIN inscripciones i ON c.id = i.cursoId
      WHERE c.estado = 'activo'
      GROUP BY c.id, c.titulo
      ORDER BY inscripciones DESC
      LIMIT 5`
    );

    // Usuarios recientes (últimos 5)
    const [usuariosRecientes] = await pool.query<UsuarioReciente[]>(
      `SELECT id, nombre, email, rol, fechaRegistro
      FROM usuarios
      ORDER BY fechaRegistro DESC
      LIMIT 5`
    );

    // Inscripciones por mes (últimos 6 meses)
    const [inscripcionesMensuales] = await pool.query<InscripcionMensual[]>(
      `SELECT 
        DATE_FORMAT(fechaInscripcion, '%Y-%m') as mes,
        COUNT(*) as total
      FROM inscripciones
      WHERE fechaInscripcion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY mes
      ORDER BY mes DESC`
    );

    // Estudiantes por curso
    const [[estudiantesPorCurso]] = await pool.query<StatsResult[]>(
      `SELECT 
        AVG(inscripciones) as promedio
      FROM (
        SELECT COUNT(i.id) as inscripciones
        FROM cursos c
        LEFT JOIN inscripciones i ON c.id = i.cursoId
        WHERE c.estado = 'activo'
        GROUP BY c.id
      ) as subquery`
    );

    // Tasa de completado
    const [[tasaCompletado]] = await pool.query<StatsResult[]>(
      `SELECT 
        (COUNT(CASE WHEN completado = 1 THEN 1 END) * 100.0 / COUNT(*)) as tasa
      FROM inscripciones`
    );

    res.json({
      cursos: cursosResult.totalCursos || 0,
      usuarios: usuariosResult.totalUsuarios || 0,
      inscripciones: inscripcionesResult.totalInscripciones || 0,
      cursosPopulares,
      usuariosRecientes,
      inscripcionesMensuales,
      promedioEstudiantesPorCurso: Math.round(estudiantesPorCurso.count || 0),
      tasaCompletado: Math.round(tasaCompletado.count || 0),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

/**
 * Obtener todos los usuarios (solo admin)
 */
export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const [usuarios] = await pool.query<UsuarioReciente[]>(
      `SELECT id, nombre, email, rol, fechaRegistro
      FROM usuarios
      ORDER BY fechaRegistro DESC`
    );

    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

/**
 * Eliminar usuario (solo admin)
 */
export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    // No permitir que el admin se elimine a sí mismo
    if (parseInt(id) === adminId) {
      res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};