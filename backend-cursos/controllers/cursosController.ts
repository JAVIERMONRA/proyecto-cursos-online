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
interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
}

interface Seccion {
  id: number;
  cursoId: number;
  subtitulo: string;
  descripcion: string;
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

    // 1️⃣ Obtener el curso
    const [cursoRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM cursos WHERE id = ?",
      [id]
    );

    if (cursoRows.length === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    const curso = cursoRows[0];

    // 2️⃣ Obtener las secciones
    const [secciones] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM secciones WHERE cursoId = ?",
      [id]
    );

    // 3️⃣ Obtener los archivos de cada sección
    for (const seccion of secciones) {
      const [archivos] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM archivos WHERE seccionId = ?",
        [seccion.id]
      );
      seccion.archivos = archivos;
    }

    // 4️⃣ Enviar el curso completo
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

// ======================
// ⚙️ Crear curso con secciones y archivos
// ======================
export const crearCursoConSecciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, descripcion, profesorId, secciones } = req.body;
    const parsedSecciones = JSON.parse(secciones || "[]");

    if (!titulo || !descripcion) {
      res.status(400).json({ error: "Título y descripción son requeridos" });
      return;
    }

    // 1️⃣ Crear el curso principal
    const [cursoResult] = await pool.query<ResultSetHeader>(
      "INSERT INTO cursos (titulo, descripcion, profesorId) VALUES (?, ?, ?)",
      [titulo, descripcion, profesorId || null]
    );

    const cursoId = cursoResult.insertId;

    // 2️⃣ Guardar secciones
    for (const seccion of parsedSecciones) {
      const [seccionResult] = await pool.query<ResultSetHeader>(
        "INSERT INTO secciones (cursoId, subtitulo, descripcion) VALUES (?, ?, ?)",
        [cursoId, seccion.subtitulo, seccion.descripcion]
      );

      const seccionId = seccionResult.insertId;

      // 3️⃣ Asociar archivos subidos
      const archivos = (req.files as Express.Multer.File[]) || [];
      const archivosSeccion = archivos.filter(file =>
        file.originalname.includes(seccion.subtitulo)
      );

      for (const file of archivosSeccion) {
        await pool.query(
          "INSERT INTO archivos (seccionId, nombreArchivo, rutaArchivo, tipoArchivo) VALUES (?, ?, ?, ?)",
          [seccionId, file.originalname, file.path, file.mimetype]
        );
      }
    }

    res.status(201).json({
      mensaje: "✅ Curso y secciones creados exitosamente",
      cursoId,
    });
  } catch (error) {
    console.error("❌ Error al crear curso con secciones:", error);
    res.status(500).json({ error: "Error al crear curso con secciones" });
  }
};

// 🟩 Obtener curso con secciones y archivos
export const obtenerCursoCompleto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 1️⃣ Obtener curso
    const [cursoRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM cursos WHERE id = ?",
      [id]
    );

    if (cursoRows.length === 0) {
      res.status(404).json({ error: "Curso no encontrado" });
      return;
    }

    const curso = cursoRows[0];

    // 2️⃣ Obtener secciones del curso
    const [secciones] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM secciones WHERE cursoId = ?",
      [id]
    );

    // 3️⃣ Obtener archivos de cada sección
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
    console.error("Error al obtener curso completo:", error);
    res.status(500).json({ error: "Error al obtener curso completo" });
  }
};
