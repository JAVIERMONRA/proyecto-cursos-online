import express from "express";
import { verificarToken, verificarRolAdmin } from "../middlewares/authMiddleware.js";
import { 
  obtenerEstadisticas, 
  obtenerUsuarios, 
  eliminarUsuario,
  obtenerProgresoEstudiante,
  obtenerInscripcionesDetalladas
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

// Obtener progreso de un estudiante
router.get("/usuarios/:id/progreso", verificarToken, verificarRolAdmin, obtenerProgresoEstudiante);

// Obtener inscripciones detalladas
router.get("/inscripciones-detalladas", verificarToken, verificarRolAdmin, obtenerInscripcionesDetalladas);

export default router;