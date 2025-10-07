import { useEffect, useState } from "react";
import axios from "axios";

function DashboardAdmin() {
  const [stats, setStats] = useState({ cursos: 0, usuarios: 0, inscripciones: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (rol !== "admin") {
    return <p style={{ color: "red" }}>Acceso denegado. Solo para administradores.</p>;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:4000/admin/estadisticas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <p>Cargando estadísticas...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel de Administración</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px" }}>
          <h2>📘 Cursos</h2>
          <p>{stats.cursos}</p>
        </div>
        <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px" }}>
          <h2>👥 Usuarios</h2>
          <p>{stats.usuarios}</p>
        </div>
        <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px" }}>
          <h2>🧾 Inscripciones</h2>
          <p>{stats.inscripciones}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
