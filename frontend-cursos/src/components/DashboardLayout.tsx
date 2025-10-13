import React, { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  children: ReactNode;
  rol: "admin" | "estudiante";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, rol }) => {
  useEffect(() => {
    // Asegurarse de que el tema se aplique correctamente
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar rol={rol} />
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;