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

/**
 * Generar y descargar certificado en PDF
 */
export const descargarCertificadoPDF = async (
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

    // Obtener datos del certificado
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
      res.status(404).json({ error: "No hay certificado disponible" });
      return;
    }

    // Importar PDFKit dinámicamente
    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Certificado-${certificado.codigo}.pdf`
    );

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // === DISEÑO DEL CERTIFICADO ===

    // Borde decorativo
    doc
      .roundedRect(30, 30, doc.page.width - 60, doc.page.height - 60, 10)
      .lineWidth(3)
      .strokeColor("#3b82f6")
      .stroke();

    doc
      .roundedRect(40, 40, doc.page.width - 80, doc.page.height - 80, 10)
      .lineWidth(1)
      .strokeColor("#8b5cf6")
      .stroke();

    // Título principal
    doc
      .fontSize(40)
      .font("Helvetica-Bold")
      .fillColor("#1a1d29")
      .text("CursosOnline", 0, 100, {
        align: "center",
      });

    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#6c757d")
      .text("Transformando vidas a través de la educación online de calidad", 0, 160, {
        align: "center",
      });

    // Línea decorativa
    doc
      .moveTo(250, 200)
      .lineTo(doc.page.width - 250, 200)
      .lineWidth(2)
      .strokeColor("#3b82f6")
      .stroke();

    // Texto "Hace constar que"
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#6c757d")
      .text("Hace contar que", 0, 240, {
        align: "center",
      });

    // Nombre del estudiante
    doc
      .fontSize(32)
      .font("Helvetica-Bold")
      .fillColor("#3b82f6")
      .text(certificado.nombre, 0, 280, {
        align: "center",
      });

    // Texto "Cursó y aprobó:"
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#6c757d")
      .text("Cursó y aprobó:", 0, 330, {
        align: "center",
      });

    // Título del curso
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1a1d29")
      .text(`${certificado.titulo}`, 0, 370, {
        align: "center",
      });

    // Fecha de emisión
    const fecha = new Date(certificado.fechaEmision).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#6c757d")
      .text(`Finalizado el  ${fecha}`, 0, 440, {
        align: "center",
      });

    // Código de certificado
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#8b5cf6")
      .text(`Código de verificación: ${certificado.codigo}`, 0, 470, {
        align: "center",
      });

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#a1a1aa")
      .text("CursosOnline Platform", 0, doc.page.height - 80, {
        align: "center",
      });

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error("Error al generar certificado PDF:", error);
    res.status(500).json({ error: "Error al generar certificado" });
  }
};