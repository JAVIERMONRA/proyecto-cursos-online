import express from "express";
import { verificarToken, verificarRolAdmin } from "../middlewares/authMiddleware.js";
import { 
  obtenerEstadisticas, 
  obtenerUsuarios, 
  eliminarUsuario 
} from "../controllers/adminController.js";

const router = express.Router();

/**
 * Rutas administrativas protegidas
 * Todas requieren autenticación y rol de administrador
 */

// Estadísticas generales
router.get("/estadisticas", verificarToken, verificarRolAdmin, obtenerEstadisticas);

// Gestión de usuarios
router.get("/usuarios", verificarToken, verificarRolAdmin, obtenerUsuarios);
router.delete("/usuarios/:id", verificarToken, verificarRolAdmin, eliminarUsuario);

export default router;