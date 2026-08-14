import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const { pathname } = useLocation();
  const active = (path) => `dashboard-nav-link ${pathname === path ? "active" : ""}`;

  return (
    <aside className="dashboard-sidebar">
      <p className="dashboard-sidebar-kicker">Account</p>
      <h4>Dashboard</h4>
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <Link to="/dashboard/home" className={active("/dashboard/home")}>Home</Link>
        <Link to="/dashboard/profile" className={active("/dashboard/profile")}>Profile</Link>
        <Link to="/dashboard/bookmarks" className={active("/dashboard/bookmarks")}>Bookmarks</Link>
        <Link to="/dashboard/activity" className={active("/dashboard/activity")}>Activity</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
