import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ReactElement } from "react";
import Navbar from "./components/Navbar";
import Cursos from "./pages/Cursos";
import MisCursos from "./pages/MisCursos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCursos from "./pages/AdminCursos";
import AdminDashboard from "./pages/AdminDashboard";

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
        <Route path="/" element={<Cursos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/mis-cursos"
          element={
            <ProtectedRoute>
              <MisCursos />
            </ProtectedRoute>
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

export default App;