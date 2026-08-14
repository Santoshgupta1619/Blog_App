import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/Nav_img.png";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  return (
    <header className="navbar">
      {/* LOGO */}
      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate("/");
          }
        }}
        role="link"
        tabIndex="0"
        title="Go to homepage"
      >
        <img src={logo} alt="The Indian Guide Technology" />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="nav-right">
        {token ? (
          <>
            {/* USER */}
            {user?.role === "user" && (
              <button
                className="nav-btn dashboard-btn"
                onClick={() => navigate("/dashboard/profile")}
              >
                <span className="nav-icon">👤</span>
                <span className="btn-text">Dashboard</span>
              </button>
            )}

            {/* ADMIN */}
            {user?.role === "admin" && (
              <>
                <button
                  className="nav-btn dashboard-btn"
                  onClick={() => navigate("/admin/articles")}
                >
                  <span className="nav-icon">⚙️</span>
                  <span className="btn-text">Dashboard</span>
                </button>

                <button
                  className="nav-btn write-btn"
                  onClick={() => navigate("/create")}
                >
                  <span className="nav-icon">✍️</span>
                  <span className="btn-text">Write</span>
                </button>
              </>
            )}

            {/* LOGOUT */}
            <button
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              <span className="nav-icon">↪</span>
              <span className="btn-text">Logout</span>
            </button>
          </>
        ) : (
          /* GUEST */
          <button
            className="nav-btn signin-btn"
            onClick={() => navigate("/login")}
          >
            <span className="nav-icon">→</span>
            <span className="btn-text">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
