import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  inscribirseCurso,
  obtenerMisCursos,
  desinscribirseCurso,
} from "../controllers/inscripcionesController.js";

const router = express.Router();

router.post("/:cursoId", verificarToken, inscribirseCurso);
router.get("/mis-cursos", verificarToken, obtenerMisCursos);
router.delete("/:cursoId", verificarToken, desinscribirseCurso);

export default router;