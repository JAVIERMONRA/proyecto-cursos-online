import express from "express";
import {
  crearCurso,
  listarCursos,
  obtenerCurso,
  actualizarCurso,
  eliminarCurso,
  inscribirEnCurso,
  misCursos,
} from "../controllers/cursosController.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", listarCursos);
router.get("/:id", obtenerCurso);
router.get("/mis-cursos", verificarToken, misCursos);
router.post("/:id/inscribirse", verificarToken, inscribirEnCurso);
router.post("/", verificarToken, soloAdmin, crearCurso);
router.put("/:id", verificarToken, soloAdmin, actualizarCurso);
router.delete("/:id", verificarToken, soloAdmin, eliminarCurso);

export default router;