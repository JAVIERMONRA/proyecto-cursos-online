import { Request, Response } from "express";
import pool from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      rol: string;
    };
  }
}

interface ProgresoLeccion extends RowDataPacket {
  id: number;
  leccionId: number;
  completado: boolean;
  tiempoEstudio: number;
}

interface Leccion extends RowDataPacket {
  id: number;
  titulo: string;
  contenido: string;
  orden: number;
  duracion: number;
  completado: boolean;
}

interface Seccion extends RowDataPacket {
  id: number;
  subtitulo: string;
  descripcion: string;
  orden: number;
  lecciones: Leccion[];
}

interface CursoProgreso extends RowDataPacket {
  id: number;
  titulo: string;
  descripcion: string;
  progreso: number;
  completado: boolean;
  secciones: Seccion[];
}

/**
 * Obtener progreso completo del estudiante en un curso
 */
export const obtenerProgresoCurso = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cursoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Obtener inscripción
    const [[inscripcion]] = await pool.query<RowDataPacket[]>(
      "SELECT id, progreso, completado FROM inscripciones WHERE usuarioId = ? AND cursoId = ?",
      [usuarioId, cursoId]
    );

    if (!inscripcion) {
      res.status(403).json({ error: "No estás inscrito en este curso" });
      return;
    }

    const inscripcionId = inscripcion.id;

    // Obtener curso
    const [[curso]] = await pool.query<RowDataPacket[]>(
      "SELECT id, titulo, descripcion FROM cursos WHERE id = ?",
      [cursoId]
    );

    if (!curso) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    // Obtener secciones
    const [secciones] = await pool.query<RowDataPacket[]>(
      "SELECT id, subtitulo, descripcion, orden FROM secciones WHERE cursoId = ? ORDER BY orden",
      [cursoId]
    );

    // Para cada sección, obtener lecciones con progreso
    for (const seccion of secciones) {
      const [lecciones] = await pool.query<RowDataPacket[]>(
        `SELECT 
          l.id, l.titulo, l.contenido, l.orden, l.duracion,
          COALESCE(pl.completado, 0) as completado
         FROM lecciones l
         LEFT JOIN progreso_lecciones pl ON l.id = pl.leccionId AND pl.inscripcionId = ?
         WHERE l.seccionId = ?
         ORDER BY l.orden`,
        [inscripcionId, seccion.id]
      );
      seccion.lecciones = lecciones;
    }

    res.json({
      id: curso.id,
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      progreso: inscripcion.progreso || 0,
      completado: inscripcion.completado || false,
      secciones,
    });
  } catch (error) {
    console.error("Error al obtener progreso del curso:", error);
    res.status(500).json({ error: "Error al obtener progreso del curso" });
  }
};

/**
 * Marcar una lección como completada
 */
export const marcarLeccionCompletada = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cursoId, leccionId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Obtener inscripción
    const [[inscripcion]] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM inscripciones WHERE usuarioId = ? AND cursoId = ?",
      [usuarioId, cursoId]
    );

    if (!inscripcion) {
      res.status(403).json({ error: "No estás inscrito en este curso" });
      return;
    }

    const inscripcionId = inscripcion.id;

    // Insertar o actualizar progreso de lección
    await pool.query(
      `INSERT INTO progreso_lecciones (inscripcionId, leccionId, completado, fechaCompletado)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE completado = 1, fechaCompletado = NOW()`,
      [inscripcionId, leccionId]
    );

    // Calcular progreso total del curso
    const [[total]] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as totalLecciones FROM lecciones l
       INNER JOIN secciones s ON l.seccionId = s.id
       WHERE s.cursoId = ?`,
      [cursoId]
    );

    const [[completadas]] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as leccionesCompletadas FROM progreso_lecciones pl
       INNER JOIN lecciones l ON pl.leccionId = l.id
       INNER JOIN secciones s ON l.seccionId = s.id
       WHERE pl.inscripcionId = ? AND s.cursoId = ? AND pl.completado = 1`,
      [inscripcionId, cursoId]
    );

    const progreso =
      total.totalLecciones > 0
        ? Math.round(
            (completadas.leccionesCompletadas / total.totalLecciones) * 100
          )
        : 0;

    const cursoCompletado = progreso === 100;

    // Actualizar progreso en inscripción
    await pool.query(
      `UPDATE inscripciones 
       SET progreso = ?, completado = ?, fechaCompletado = ${cursoCompletado ? 'NOW()' : 'NULL'}
       WHERE id = ?`,
      [progreso, cursoCompletado, inscripcionId]
    );

    // Si está completado, crear certificado
    let codigoCertificado = null;
    if (cursoCompletado) {
      // Verificar si ya existe un certificado
      const [[certExistente]] = await pool.query<RowDataPacket[]>(
        "SELECT codigo FROM certificados WHERE inscripcionId = ?",
        [inscripcionId]
      );

      if (!certExistente) {
        const codigo = `CERT-${usuarioId}-${cursoId}-${Date.now()}`;
        await pool.query(
          "INSERT INTO certificados (inscripcionId, codigo) VALUES (?, ?)",
          [inscripcionId, codigo]
        );
        codigoCertificado = codigo;
      } else {
        codigoCertificado = certExistente.codigo;
      }
    }

    res.json({
      message: "Lección marcada como completada",
      progreso,
      completado: cursoCompletado,
      certificado: codigoCertificado,
    });
  } catch (error) {
    console.error("Error al marcar lección completada:", error);
    res.status(500).json({ error: "Error al marcar lección completada" });
  }
};

/**
 * Obtener certificado del estudiante
 */
export const obtenerCertificado = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cursoId } = req.params;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const [[certificado]] = await pool.query<RowDataPacket[]>(
      `SELECT c.codigo, c.fechaEmision, u.nombre, cu.titulo
       FROM certificados c
       INNER JOIN inscripciones i ON c.inscripcionId = i.id
       INNER JOIN usuarios u ON i.usuarioId = u.id
       INNER JOIN cursos cu ON i.cursoId = cu.id
       WHERE i.usuarioId = ? AND i.cursoId = ?`,
      [usuarioId, cursoId]
    );

    if (!certificado) {
      res.status(404).json({ error: "No hay certificado disponible. Completa el curso primero." });
      return;
    }

    res.json(certificado);
  } catch (error) {
    console.error("Error al obtener certificado:", error);
    res.status(500).json({ error: "Error al obtener certificado" });
  }
};

/**
 * Obtener todos los certificados del usuario
 */
export const obtenerMisCertificados = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const [certificados] = await pool.query<RowDataPacket[]>(
      `SELECT c.codigo, c.fechaEmision, cu.titulo, cu.id as cursoId
       FROM certificados c
       INNER JOIN inscripciones i ON c.inscripcionId = i.id
       INNER JOIN cursos cu ON i.cursoId = cu.id
       WHERE i.usuarioId = ?
       ORDER BY c.fechaEmision DESC`,
      [usuarioId]
    );

    res.json(certificados);
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    res.status(500).json({ error: "Error al obtener certificados" });
  }
};