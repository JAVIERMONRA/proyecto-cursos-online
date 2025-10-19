import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  obtenerProgresoCurso,
  marcarLeccionCompletada,
  obtenerCertificado,
  obtenerMisCertificados,
} from "../controllers/progresoController.js";

const router = express.Router();

/**
 * Rutas de progreso de estudiantes en cursos
 * Todas requieren autenticación (token JWT)
 */

// Obtener progreso completo del estudiante en un curso (secciones y lecciones)
router.get("/:cursoId", verificarToken, obtenerProgresoCurso);

// Marcar una lección como completada
router.post(
  "/:cursoId/leccion/:leccionId/completar",
  verificarToken,
  marcarLeccionCompletada
);

// Obtener certificado de un curso específico
router.get("/:cursoId/certificado", verificarToken, obtenerCertificado);

// Obtener todos los certificados del usuario
router.get("/mis-certificados/listar", verificarToken, obtenerMisCertificados);

export default router;