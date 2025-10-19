import { Request, Response } from "express";
import pool from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";

// ======================
// 🔧 Configuración de Multer
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

// ======================
// 🔹 Interfaces
// ======================
interface Curso extends RowDataPacket {
  id: number;
  titulo: string;
  descripcion: string;
  profesorId?: number;
  nivel?: string;
  duracion?: number;
  estado?: string;
}

interface Seccion extends RowDataPacket {
  id: number;
  cursoId: number;
  subtitulo: string;
  descripcion: string;
  archivos?: any[];
  lecciones?: any[];
}

interface Inscripcion extends RowDataPacket {
  usuarioId: number;
  cursoId: number;
}

// ======================
// 📘 CRUD de Cursos
// ======================
export const listarCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<Curso[]>(
      "SELECT * FROM cursos WHERE estado = 'activo'"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};

export const obtenerCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [cursoRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM cursos WHERE id = ?",
      [id]
    );

    if (cursoRows.length === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    const curso = cursoRows[0];

    const [secciones] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM secciones WHERE cursoId = ? ORDER BY orden",
      [id]
    );

    for (const seccion of secciones) {
      const [archivos] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM archivos WHERE seccionId = ?",
        [seccion.id]
      );
      seccion.archivos = archivos;
    }

    res.json({
      ...curso,
      secciones,
    });
  } catch (error) {
    console.error("Error al obtener curso:", error);
    res.status(500).json({ error: "Error al obtener curso completo" });
  }
};

export const crearCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, descripcion, profesorId, nivel, duracion } = req.body;

    if (!titulo || !descripcion) {
      res.status(400).json({ error: "Título y descripción son requeridos" });
      return;
    }

    const profId = profesorId || req.user?.id;

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO cursos (titulo, descripcion, profesorId, nivel, duracion) VALUES (?, ?, ?, ?, ?)",
      [titulo, descripcion, profId, nivel || "principiante", duracion || 0]
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
    const { titulo, descripcion, nivel, duracion, estado } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE cursos 
       SET titulo = ?, descripcion = ?, nivel = ?, duracion = ?, estado = ? 
       WHERE id = ?`,
      [titulo, descripcion, nivel, duracion, estado, id]
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
      `SELECT c.*, i.progreso, i.completado
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

// ======================
// ⚙️ Crear curso con secciones y archivos
// ======================
export const crearCursoConSecciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, descripcion, profesorId, secciones, nivel, duracion } = req.body;
    
    console.log("📦 Datos recibidos en el backend:");
    console.log("- Título:", titulo);
    console.log("- Descripción:", descripcion);
    console.log("- Nivel:", nivel);
    console.log("- Duración:", duracion);
    console.log("- Secciones (raw):", typeof secciones, secciones);

    if (!titulo || !descripcion) {
      res.status(400).json({ error: "Título y descripción son requeridos" });
      return;
    }

    // Parsear secciones si viene como string
    let parsedSecciones = [];
    try {
      parsedSecciones = typeof secciones === 'string' ? JSON.parse(secciones) : secciones || [];
      console.log("✅ Secciones parseadas:", parsedSecciones.length, "secciones");
    } catch (e) {
      console.error("❌ Error al parsear secciones:", e);
      parsedSecciones = [];
    }

    // Crear el curso principal
    const [cursoResult] = await pool.query<ResultSetHeader>(
      "INSERT INTO cursos (titulo, descripcion, profesorId, nivel, duracion) VALUES (?, ?, ?, ?, ?)",
      [titulo, descripcion, profesorId || null, nivel || "principiante", duracion || 0]
    );

    const cursoId = cursoResult.insertId;
    console.log("✅ Curso creado con ID:", cursoId);

    // Crear secciones y lecciones
    for (let i = 0; i < parsedSecciones.length; i++) {
      const seccion = parsedSecciones[i];
      
      console.log(`\n📝 Procesando sección ${i + 1}:`, seccion.subtitulo);

      // Insertar sección
      const [seccionResult] = await pool.query<ResultSetHeader>(
        "INSERT INTO secciones (cursoId, subtitulo, descripcion, orden) VALUES (?, ?, ?, ?)",
        [cursoId, seccion.subtitulo, seccion.descripcion, i + 1]
      );

      const seccionId = seccionResult.insertId;
      console.log(`✅ Sección creada con ID:`, seccionId);

      // Agregar lecciones a la sección
      if (seccion.lecciones && Array.isArray(seccion.lecciones)) {
        console.log(`📚 Creando ${seccion.lecciones.length} lecciones para la sección`);
        
        for (let j = 0; j < seccion.lecciones.length; j++) {
          const leccion = seccion.lecciones[j];
          
          await pool.query(
            "INSERT INTO lecciones (seccionId, titulo, contenido, orden, duracion) VALUES (?, ?, ?, ?, ?)",
            [seccionId, leccion.titulo || `Lección ${j + 1}`, leccion.contenido || "", j + 1, leccion.duracion || 0]
          );
          
          console.log(`   ✓ Lección ${j + 1}:`, leccion.titulo);
        }
      } else {
        console.log(`⚠️  No hay lecciones para esta sección`);
      }

      // Procesar archivos de la sección
      const archivos = req.files as any;
      if (archivos && Array.isArray(archivos)) {
        const archivosSeccion = archivos.filter((file: any) =>
          file.originalname.includes(seccion.subtitulo)
        );

        console.log(`📎 Archivos para sección ${i + 1}:`, archivosSeccion.length);

        for (const file of archivosSeccion) {
          await pool.query(
            "INSERT INTO archivos (seccionId, nombreArchivo, rutaArchivo, tipoArchivo, tamanio) VALUES (?, ?, ?, ?, ?)",
            [seccionId, file.originalname, file.path, file.mimetype, file.size]
          );
        }
      }
    }

    console.log("\n🎉 Curso completo creado exitosamente");

    res.status(201).json({
      mensaje: "Curso y secciones creados exitosamente",
      cursoId,
    });
  } catch (error) {
    console.error("❌ Error al crear curso con secciones:", error);
    res.status(500).json({ error: "Error al crear curso con secciones" });
  }
};

export const obtenerCursoCompleto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [cursoRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM cursos WHERE id = ?",
      [id]
    );

    if (cursoRows.length === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    const curso = cursoRows[0];

    const [secciones] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM secciones WHERE cursoId = ? ORDER BY orden",
      [id]
    );

    for (const seccion of secciones) {
      const [lecciones] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM lecciones WHERE seccionId = ? ORDER BY orden",
        [seccion.id]
      );

      const [archivos] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM archivos WHERE seccionId = ?",
        [seccion.id]
      );

      seccion.lecciones = lecciones;
      seccion.archivos = archivos;
    }

    res.json({
      ...curso,
      secciones,
    });
  } catch (error) {
    console.error("Error al obtener curso completo:", error);
    res.status(500).json({ error: "Error al obtener curso completo" });
  }
};