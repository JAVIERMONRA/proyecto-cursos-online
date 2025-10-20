import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Define la estructura del payload incluido en el token JWT.
 */
interface JwtPayload {
  id: number;
  rol: string;
}

/**
 * Middleware que verifica la validez del token JWT incluido en la cabecera `Authorization`.
 * 
 * - Si el token es válido, se adjunta la información del usuario (`id`, `rol`) al objeto `req.user`.
 * - Si no se proporciona o el token es inválido/expirado, se devuelve un error 401.
 */
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
    req.user = { id: decoded.id, rol: decoded.rol };
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

/**
 * Middleware que restringe el acceso a rutas protegidas únicamente a usuarios con rol de administrador.
 * 
 * - Verifica que el `req.user.rol` sea igual a `"admin"`.
 * - Si no lo es, retorna un error 403 indicando acceso denegado.
 */
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

/**
 * Alias de `verificarRolAdmin`, utilizado para mayor claridad en rutas que requieran acceso exclusivo de administradores.
 */
export const soloAdmin = verificarRolAdmin;
