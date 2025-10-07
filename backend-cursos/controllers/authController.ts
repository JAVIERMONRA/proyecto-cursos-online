import { Request, Response } from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";

dotenv.config();

interface Usuario extends RowDataPacket {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;

    const [rows] = await pool.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      res.status(400).json({ error: "El usuario ya existe" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const usuario = rows[0];
    const esValida = await bcrypt.compare(password, usuario.password);

    if (!esValida) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

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