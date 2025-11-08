// Setup global para las pruebas
import dotenv from "dotenv";

// Carga el archivo .env del backend
dotenv.config({ path: ".env" });

beforeAll(() => {
  console.log("🧪 Iniciando pruebas del backend...");
});

afterAll(() => {
  console.log("✅ Pruebas completadas");
});
