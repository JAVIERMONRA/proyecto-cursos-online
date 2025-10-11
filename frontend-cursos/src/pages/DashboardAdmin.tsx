import { useEffect, useState } from "react";
import axios from "axios";

/**
 * 🔸 Componente: DashboardAdmin
 * Panel exclusivo para administradores que muestra estadísticas generales del sistema:
 * - Total de cursos
 * - Total de usuarios
 * - Total de inscripciones
 */
function DashboardAdmin() {
  /** 🔹 Estado que almacena las estadísticas globales */
  const [stats, setStats] = useState({ cursos: 0, usuarios: 0, inscripciones: 0 });

  /** 🔹 Estado de carga para mostrar mensaje mientras se obtienen los datos */
  const [loading, setLoading] = useState(true);

  /** 🔹 Se obtienen el token y rol del usuario desde el almacenamiento local */
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  /**
   * 🔒 Validación de acceso:
   * Si el usuario no tiene el rol "admin", se restringe la vista.
   */
  if (rol !== "admin") {
    return <p style={{ color: "red" }}>Acceso denegado. Solo para administradores.</p>;
  }

  /**
   * 🔹 useEffect: ejecuta la carga de estadísticas al montar el componente.
   * Llama al backend para obtener la información general del sistema.
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        /** 📡 Petición al endpoint protegido del backend */
        const res = await axios.get("http://localhost:4000/admin/estadisticas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        /** ✅ Guarda los datos obtenidos en el estado */
        setStats(res.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        /** ⏳ Finaliza el estado de carga, haya éxito o error */
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  /** 🔹 Muestra un mensaje temporal mientras los datos se cargan */
  if (loading) return <p>Cargando estadísticas...</p>;

  /** 🔹 Renderizado del panel de administración */
  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel de Administración</h1>

      {/* 🔹 Tarjetas con las métricas principales */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* 📘 Total de cursos */}
        <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px" }}>
          <h2>📘 Cursos</h2>
          <p>{stats.cursos}</p>
        </div>

        {/* 👥 Total de usuarios */}
        <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px" }}>
          <h2>👥 Usuarios</h2>
          <p>{stats.usuarios}</p>
        </div>

        {/* 🧾 Total de inscripciones */}
        <div style={{ background: "#f3f3f3", padding: "20px", borderRadius: "10px" }}>
          <h2>🧾 Inscripciones</h2>
          <p>{stats.inscripciones}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
