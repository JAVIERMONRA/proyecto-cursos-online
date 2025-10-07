import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import cursosRoutes from "./routes/cursosRoutes.js";
import inscripcionesRoutes from "./routes/inscripcionesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/cursos", cursosRoutes);
app.use("/inscripciones", inscripcionesRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API de Cursos funcionando correctamente" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});