import express from "express";
import {
  crearCurso,
  listarCursos,
  obtenerCurso,
  actualizarCurso,
  eliminarCurso,
  inscribirEnCurso,
  misCursos,
  crearCursoConSecciones,
  obtenerCursoCompleto,
  upload,
} from "../controllers/cursosController.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.js";

const router = express.Router();

/* ======================================================
  📘 Rutas de gestión de cursos
====================================================== */

// ✅ Crear curso con secciones y archivos (solo admin)
router.post(
  "/crear-con-secciones",
  verificarToken,
  soloAdmin,
  upload.any(),
  crearCursoConSecciones
);

// ✅ Listar todos los cursos
router.get("/", listarCursos);

// ✅ Obtener un curso por su ID
router.get("/:id", obtenerCurso);

// ✅ Obtener cursos del usuario autenticado
router.get("/mis-cursos", verificarToken, misCursos);

// ✅ Inscribirse en un curso
router.post("/:id/inscribirse", verificarToken, inscribirEnCurso);

// ✅ Crear curso simple (sin secciones ni archivos)
router.post("/", verificarToken, soloAdmin, crearCurso);

// ✅ Actualizar un curso
router.put("/:id", verificarToken, soloAdmin, actualizarCurso);

// ✅ Eliminar un curso
router.delete("/:id", verificarToken, soloAdmin, eliminarCurso);

// ✅ Obtener curso completo con secciones y lecciones
router.get("/completo/:id", verificarToken, obtenerCursoCompleto);

/* ======================================================
  📤 Exportación del router
====================================================== */
export default router;