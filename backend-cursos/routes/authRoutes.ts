import { Router } from "express";
import { register, login } from "../controllers/authController.js";

const router = Router();

/**
 * Define las rutas de autenticación de usuarios.
 * 
 * 🔹 POST /register → Registra un nuevo usuario en el sistema.  
 * 🔹 POST /login → Autentica las credenciales del usuario y devuelve un token JWT.  
 */
router.post("/register", register);
router.post("/login", login);

export default router;
