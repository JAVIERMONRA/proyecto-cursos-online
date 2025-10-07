import express from "express";
import { verificarToken, verificarRolAdmin } from "../middlewares/authMiddleware.js";
import { obtenerEstadisticas } from "../controllers/adminController.js";

const router = express.Router();

router.get("/estadisticas", verificarToken, verificarRolAdmin, obtenerEstadisticas);

export default router;