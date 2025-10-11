import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ReactElement } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCursos from "./pages/AdminCursos";
import AdminDashboard from "./pages/AdminDashboard";
import InicioRedirect from "./pages/InicioRedirect";
import AdminCrearCurso from "./pages/AdminCrearCurso";

interface RutaAdminProps {
  children: ReactElement;
}

function RutaAdmin({ children }: RutaAdminProps): ReactElement {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) return <Navigate to="/login" replace />;
  if (rol !== "admin") return <Navigate to="/" replace />;
  return children;
}

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Página de inicio: redirige según rol */}
        <Route path="/" element={<InicioRedirect />} />

        {/* Estudiante: Dashboard (cursos) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas de administrador */}
        <Route
          path="/admin/cursos"
          element={
            <RutaAdmin>
              <AdminCursos />
            </RutaAdmin>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RutaAdmin>
              <AdminDashboard />
            </RutaAdmin>
          }
        />
      </Routes>
    </Router>
  );
};
        <Route
         path="/admin/crear-curso"
         element={
          <RutaAdmin>
           <AdminCrearCurso />
         </RutaAdmin>
  }
/>

export default App;
