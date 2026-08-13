import { Outlet, Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <div className="admin-sidebar bg-dark text-white p-3">

        <h4 className="mb-4">
          <i className="bi bi-speedometer2 me-2"></i>
          Admin Panel
        </h4>

        <ul className="nav flex-column">

          {/* Articles */}
          <li className="nav-item">
            <Link
              to="/admin/articles"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-file-earmark-text me-3"></i>
              Articles
            </Link>
          </li>

          {/* Bookmarks */}
          <li className="nav-item">
            <Link
              to="/admin/adminbookmark"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-bookmark-fill me-3"></i>
              Bookmarks
            </Link>
          </li>

          {/* Drafts */}
          <li className="nav-item">
            <Link
              to="/admin/drafts"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-file-earmark me-3"></i>
              Drafts
            </Link>
          </li>

          {/* Categories */}
          <li className="nav-item">
            <Link
              to="/admin/categories"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-grid me-3"></i>
              Categories
            </Link>
          </li>

          {/* Scheduled */}
          <li className="nav-item">
            <Link
              to="/admin/scheduled"
              className="nav-link text-white d-flex align-items-center"
            >
              <i className="bi bi-calendar-event me-3"></i>
              Scheduled
            </Link>
          </li>

        </ul>

      </div>

      {/* Main Content */}
      <div className="admin-main">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminDashboard;