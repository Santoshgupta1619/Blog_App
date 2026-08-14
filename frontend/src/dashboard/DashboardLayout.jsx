import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  return (
    <div className="user-dashboard-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="user-dashboard-main">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;
