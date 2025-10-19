import { Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RowDataPacket, ResultSetHeader } from "mysql2";

dotenv.config();

interface Usuario extends RowDataPacket {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  fotoPerfil?: string;
}

/**
 * Registro de usuario
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const [rows] = await pool.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      res.status(400).json({ error: "El usuario ya existe" });
      return;
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, rol || "estudiante"]
    );

    res.json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    res.status(500).json({ 
      error: "Error en el registro", 
      detalle: err instanceof Error ? err.message : "Error desconocido" 
    });
  }
};

/**
 * Inicio de sesión
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por su correo
    const [rows] = await pool.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const usuario = rows[0];

    // Comparar la contraseña
    const esValida = await bcrypt.compare(password, usuario.password);

    if (!esValida) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      rol: usuario.rol,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil || null,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const [rows] = await pool.query<Usuario[]>(
      "SELECT id, nombre, email, rol, fotoPerfil FROM usuarios WHERE id = ?",
      [usuarioId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

/**
 * Actualizar perfil del usuario (nombre y foto)
 * La foto se guarda como base64 en la BD
 */
export const actualizarPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    const { nombre, fotoPerfil } = req.body;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Validar que el nombre no esté vacío
    if (!nombre || nombre.trim() === "") {
      res.status(400).json({ error: "El nombre no puede estar vacío" });
      return;
    }

    // Guardar foto solo si se proporciona
    const fotoActualizar = fotoPerfil || null;

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE usuarios SET nombre = ?, fotoPerfil = ? WHERE id = ?",
      [nombre.trim(), fotoActualizar, usuarioId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ 
      message: "Perfil actualizado correctamente",
      usuario: {
        nombre,
        fotoPerfil: fotoActualizar,
      }
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

/**
 * Cambiar contraseña
 */
export const cambiarPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.user?.id;
    const { passwordActual, passwordNueva } = req.body;

    if (!usuarioId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Validar contraseña nueva
    if (!passwordNueva || passwordNueva.length < 6) {
      res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    // Obtener la contraseña actual del usuario
    const [rows] = await pool.query<Usuario[]>(
      "SELECT password FROM usuarios WHERE id = ?",
      [usuarioId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    // Verificar la contraseña actual
    const esValida = await bcrypt.compare(passwordActual, rows[0].password);

    if (!esValida) {
      res.status(401).json({ error: "La contraseña actual es incorrecta" });
      return;
    }

    // Cifrar la nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);

    // Actualizar la contraseña
    await pool.query(
      "UPDATE usuarios SET password = ? WHERE id = ?",
      [hashedPassword, usuarioId]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
};