import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: "220px" }}>
      <h4 className="text-center mb-4">Admin</h4>

      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin/articles">Articles</Link>
        </li>

        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin/drafts">Drafts</Link>
        </li>

        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin/scheduled">Scheduled</Link>
        </li>

        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin/categories">Categories</Link>
        </li>

        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin/adminbookmark">Bookmark</Link>
        </li>
      </ul>
    </div>
  );
}