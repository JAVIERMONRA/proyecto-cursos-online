import express from "express";
import { verificarToken, verificarRolAdmin } from "../middlewares/authMiddleware.js";
import { obtenerEstadisticas } from "../controllers/adminController.js";

const router = express.Router();

/**
 * Define las rutas administrativas del sistema.
 * 
 * 🔹 Ruta: **GET /estadisticas**
 * - Requiere autenticación (`verificarToken`).
 * - Solo accesible por usuarios con rol de administrador (`verificarRolAdmin`).
 * - Ejecuta el controlador `obtenerEstadisticas` para retornar métricas generales del sistema.
 */
router.get("/estadisticas", verificarToken, verificarRolAdmin, obtenerEstadisticas);

export default router;
