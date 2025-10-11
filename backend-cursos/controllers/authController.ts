import { Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";

dotenv.config();

// Define la estructura esperada del usuario en la base de datos
interface Usuario extends RowDataPacket {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

/**
 * Controlador para registrar un nuevo usuario.
 * - Verifica si el email ya existe.
 * - Cifra la contraseña con bcrypt.
 * - Inserta el nuevo usuario en la base de datos.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verifica si el usuario ya existe
    const [rows] = await pool.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      res.status(400).json({ error: "El usuario ya existe" });
      return;
    }

    // Cifra la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el nuevo usuario en la tabla
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
 * Controlador para iniciar sesión.
 * - Verifica si el usuario existe.
 * - Valida la contraseña con bcrypt.
 * - Genera un token JWT con expiración de 8 horas.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Busca el usuario por su correo
    const [rows] = await pool.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const usuario = rows[0];

    // Compara la contraseña ingresada con la almacenada
    const esValida = await bcrypt.compare(password, usuario.password);

    if (!esValida) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

    // Genera el token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      rol: usuario.rol,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
