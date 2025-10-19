import { Router } from "express";
import { 
  register, 
  login, 
  obtenerPerfil, 
  actualizarPerfil, 
  cambiarPassword 
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * Rutas públicas de autenticación
 */
router.post("/register", register);
router.post("/login", login);

/**
 * Rutas protegidas de perfil
 */
router.get("/perfil", verificarToken, obtenerPerfil);
router.put("/perfil", verificarToken, actualizarPerfil);
router.put("/cambiar-password", verificarToken, cambiarPassword);

export default router;