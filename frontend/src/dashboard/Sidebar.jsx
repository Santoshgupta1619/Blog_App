import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const active = (path) =>
    `list-group-item list-group-item-action ${
      pathname === path ? "active" : ""
    }`;

  return (
    <aside
      className="bg-dark text-white p-3"
      style={{
        width: "250px",
        minWidth: "250px",
        height: "calc(100vh - 70px)",
        position: "sticky",
        top: "70px",
        alignSelf: "flex-start",
        overflowY: "auto",
      }}
    >
      <h4 className="mb-4">Dashboard</h4>

      <div className="list-group">
        <Link to="/dashboard/home" className={active("/dashboard/home")}>
          🏠 Home
        </Link>

        <Link
          to="/dashboard/profile"
          className={active("/dashboard/profile")}
        >
          👤 Profile
        </Link>

        <Link
          to="/dashboard/bookmarks"
          className={active("/dashboard/bookmarks")}
        >
          🔖 Bookmarks
        </Link>

        <Link
          to="/dashboard/activity"
          className={active("/dashboard/activity")}
        >
          📊 Activity
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;