import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import cursosRoutes from "./routes/cursosRoutes.js";
import inscripcionesRoutes from "./routes/inscripcionesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import progresoRoutes from "./routes/progresoRoutes.js";

const app = express();

// 🔹 Middleware base
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 🔹 Servir archivos subidos
app.use("/uploads", express.static(path.resolve("uploads")));

// 🔹 Rutas principales
app.use("/auth", authRoutes);
app.use("/cursos", cursosRoutes);
app.use("/inscripciones", inscripcionesRoutes);
app.use("/admin", adminRoutes);
app.use("/progreso", progresoRoutes);

// 🔹 Ruta de prueba
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "✅ API de Cursos funcionando correctamente" });
});

// 🔹 Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// 🔹 Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});