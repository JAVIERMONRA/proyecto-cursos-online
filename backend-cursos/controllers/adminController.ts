import { Request, Response } from "express";
import pool from "../config/db.js";
import { RowDataPacket } from "mysql2";

// Define la estructura esperada de los resultados de las consultas
interface StatsResult extends RowDataPacket {
  totalCursos: number;
  totalUsuarios: number;
  totalInscripciones: number;
}

// Controlador para obtener estadísticas generales del sistema
export const obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ejecuta consultas para contar cursos, usuarios e inscripciones
    const [[cursosResult]] = await pool.query<StatsResult[]>(
      "SELECT COUNT(*) AS totalCursos FROM cursos"
    );
    const [[usuariosResult]] = await pool.query<StatsResult[]>(
      "SELECT COUNT(*) AS totalUsuarios FROM usuarios"
    );
    const [[inscripcionesResult]] = await pool.query<StatsResult[]>(
      "SELECT COUNT(*) AS totalInscripciones FROM inscripciones"
    );

    // Devuelve los totales como respuesta JSON
    res.json({
      cursos: cursosResult.totalCursos,
      usuarios: usuariosResult.totalUsuarios,
      inscripciones: inscripcionesResult.totalInscripciones,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};
