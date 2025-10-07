import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  id: number;
  rol: string;
}

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const verificarRolAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.rol !== "admin") {
    res.status(403).json({ error: "Acceso denegado. Solo administradores" });
    return;
  }
  next();
};

export const soloAdmin = verificarRolAdmin;