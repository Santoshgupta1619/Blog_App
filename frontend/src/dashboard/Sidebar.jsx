import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Sidebar.css";

import { getProfile } from "../api/user";

const Sidebar = () => {
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response.data);
      } catch (error) {
        console.error("Failed to load sidebar profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const active = (path) =>
    `dashboard-nav-link ${
      pathname === path ? "active" : ""
    }`;

  const isWriter = user?.is_writer === true;

  return (
    <aside className="dashboard-sidebar">

      <p className="dashboard-sidebar-kicker">
        Account
      </p>

      <h4>Dashboard</h4>

      <nav
        className="dashboard-nav"
        aria-label="Dashboard navigation"
      >

        <Link
          to="/"
          className={active("/dashboard/home")}
        >
          Home
        </Link>

        

        {/* ==========================================
    BECOME A WRITER
========================================== */}

{!loading && !isWriter && (
  <>
  <Link
    to="/dashboard/become-writer"
    className={active("/dashboard/become-writer")}
  >
    Become a Writer
  </Link>

  <Link
          to="/dashboard/profile"
          className={active("/dashboard/profile")}
        >
          Profile
        </Link>
        </>
)}

{/* ==========================================
    WRITER NAVIGATION
========================================== */}

{!loading && isWriter && (
  <>
    <Link
      to="/dashboard/writer/articles"
      className={active("/dashboard/writer/articles")}
    >
      My Articles
    </Link>

    <Link
      to="/dashboard/writer/write"
      className={active("/dashboard/writer/write")}
    >
      Write Article
    </Link>

    <Link
      to="/dashboard/writer/profile"
      className={active("/dashboard/writer/profile")}
    >
      Writer Profile
    </Link>
  </>
)}

        <Link
          to="/dashboard/bookmarks"
          className={active("/dashboard/bookmarks")}
        >
          Bookmarks
        </Link>

        <Link
          to="/dashboard/activity"
          className={active("/dashboard/activity")}
        >
          Activity
        </Link>

      </nav>
    </aside>
  );
};

export default Sidebar;