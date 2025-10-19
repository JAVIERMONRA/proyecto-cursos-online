import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { User, Lock, Camera, Save, AlertCircle } from "lucide-react";
import "./Perfil.css";

interface UserData {
  nombre: string;
  email: string;
  fotoPerfil?: string;
}

const AdminPerfil: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    nombre: "",
    email: "",
    fotoPerfil: "",
  });

  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:4000/auth/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
      if (res.data.fotoPerfil) {
        setPreviewImage(res.data.fotoPerfil);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setMessage({ type: "error", text: "Error al cargar el perfil" });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "La imagen no debe superar 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.onerror = () => {
        setMessage({ type: "error", text: "Error al leer la imagen" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.put(
        "http://localhost:4000/auth/perfil",
        {
          nombre: userData.nombre,
          fotoPerfil: previewImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", text: "✅ Perfil actualizado correctamente" });
      
      window.dispatchEvent(new Event("userProfileUpdated"));
      
      setTimeout(() => fetchUserData(), 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Error al actualizar el perfil";
      setMessage({ type: "error", text: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (passwords.nueva !== passwords.confirmar) {
      setMessage({ type: "error", text: "❌ Las contraseñas no coinciden" });
      return;
    }

    if (passwords.nueva.length < 6) {
      setMessage({
        type: "error",
        text: "❌ La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.put(
        "http://localhost:4000/auth/cambiar-password",
        {
          passwordActual: passwords.actual,
          passwordNueva: passwords.nueva,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        type: "success",
        text: "✅ Contraseña actualizada correctamente",
      });
      setPasswords({ actual: "", nueva: "", confirmar: "" });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Error al cambiar contraseña";
      setMessage({
        type: "error",
        text: `❌ ${errorMsg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout rol="admin">
      <div className="perfil-page">
        <div className="page-header">
          <h1 className="page-title">👤 Mi Perfil - Administrador</h1>
          <p className="page-subtitle">Administra tu información personal</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            <AlertCircle size={20} />
            <span>{message.text}</span>
          </div>
        )}

        <div className="perfil-grid">
          {/* Foto de perfil */}
          <div className="perfil-card">
            <h2 className="card-title">Foto de Perfil</h2>
            <div className="profile-photo-section">
              <div className="profile-photo-container">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Perfil"
                    className="profile-photo"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    <User size={64} />
                  </div>
                )}
                <label htmlFor="photo-upload" className="photo-upload-btn">
                  <Camera size={20} />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
              <p className="photo-hint">
                Haz clic en el ícono de cámara para cambiar tu foto
              </p>
            </div>
          </div>

          {/* Datos personales */}
          <div className="perfil-card">
            <h2 className="card-title">Datos Personales</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="nombre">
                  <User size={18} />
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  className="form-control"
                  value={userData.nombre}
                  onChange={(e) =>
                    setUserData({ ...userData, nombre: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <User size={18} />
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={userData.email}
                  disabled
                  title="El correo no puede ser modificado"
                />
                <small style={{ color: "#6c757d" }}>
                  El correo no puede ser modificado
                </small>
              </div>

              <button type="submit" className="btn-save" disabled={loading}>
                <Save size={20} />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>

          {/* Cambiar contraseña */}
          <div className="perfil-card full-width">
            <h2 className="card-title">Cambiar Contraseña</h2>
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="password-actual">
                  <Lock size={18} />
                  Contraseña actual
                </label>
                <input
                  id="password-actual"
                  type="password"
                  className="form-control"
                  value={passwords.actual}
                  onChange={(e) =>
                    setPasswords({ ...passwords, actual: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password-nueva">
                  <Lock size={18} />
                  Nueva contraseña
                </label>
                <input
                  id="password-nueva"
                  type="password"
                  className="form-control"
                  value={passwords.nueva}
                  onChange={(e) =>
                    setPasswords({ ...passwords, nueva: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password-confirmar">
                  <Lock size={18} />
                  Confirmar nueva contraseña
                </label>
                <input
                  id="password-confirmar"
                  type="password"
                  className="form-control"
                  value={passwords.confirmar}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmar: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-save" disabled={loading}>
                <Lock size={20} />
                {loading ? "Actualizando..." : "Cambiar Contraseña"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPerfil;