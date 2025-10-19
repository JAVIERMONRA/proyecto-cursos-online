import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ReactElement } from "react";
import { useAuth } from "./context/AuthContext"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCursos from "./pages/AdminCursos";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCrearCurso from "./pages/AdminCrearCurso";
import AdminEstadisticas from "./pages/AdminEstadisticas";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminPerfil from "./pages/AdminPerfil";
import MisCursos from "./pages/MisCursos";
import ExplorarCursos from "./pages/ExplorarCursos";
import CursoDetalle from "./pages/CursoDetalle";
import Perfil from "./pages/Perfil";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

interface RutaAdminProps {
  children: ReactElement;
}

function RutaAdmin({ children }: RutaAdminProps): ReactElement {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/mis-cursos" replace />;

  return children;
}

const App: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Router>
      {/* Navbar solo se muestra si NO está autenticado */}
      {!isAuthenticated && <Navbar />}

      {/* Padding solo para páginas públicas */}
      <div style={{ paddingTop: !isAuthenticated ? "70px" : "0" }}>
        <Routes>
          {/* ========== RUTAS PÚBLICAS ========== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ========== RUTAS DE ESTUDIANTE ========== */}
          <Route
            path="/mis-cursos"
            element={
              <ProtectedRoute>
                <MisCursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curso/:cursoId"
            element={
              <ProtectedRoute>
                <CursoDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explorar"
            element={
              <ProtectedRoute>
                <ExplorarCursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          {/* ========== RUTAS DE ADMIN ========== */}
          <Route
            path="/admin/dashboard"
            element={
              <RutaAdmin>
                <AdminDashboard />
              </RutaAdmin>
            }
          />
          <Route
            path="/admin/cursos"
            element={
              <RutaAdmin>
                <AdminCursos />
              </RutaAdmin>
            }
          />
          <Route
            path="/admin/crear-curso"
            element={
              <RutaAdmin>
                <AdminCrearCurso />
              </RutaAdmin>
            }
          />
          <Route
            path="/admin/estadisticas"
            element={
              <RutaAdmin>
                <AdminEstadisticas />
              </RutaAdmin>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RutaAdmin>
                <AdminUsuarios />
              </RutaAdmin>
            }
          />
          <Route
            path="/admin/perfil"
            element={
              <RutaAdmin>
                <AdminPerfil />
              </RutaAdmin>
            }
          />

          {/* Ruta 404 - Redirige según el rol */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                user?.role === "admin" ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/mis-cursos" replace />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;