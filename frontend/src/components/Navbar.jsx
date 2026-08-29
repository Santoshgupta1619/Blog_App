
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  PenLine,
  LogOut,
  LogIn,
  House,
} from "lucide-react";

import "./Navbar.css";
import logo from "../assets/Nav_img.png";

import { getProfile } from "../api/user";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET ROLE FROM JWT
  // ======================================================

  const getTokenUser = () => {
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload;
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  // ======================================================
  // LOAD CURRENT USER
  // ======================================================

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ----------------------------------------------
        // Get role from JWT
        // ----------------------------------------------

        const tokenUser = getTokenUser();

        // ----------------------------------------------
        // Get latest database information
        // This contains is_writer
        // ----------------------------------------------

        const response = await getProfile();

        const profile = response.data;

        // ----------------------------------------------
        // Combine JWT + database information
        // ----------------------------------------------

        const currentUser = {
          ...profile,

          role: tokenUser?.role || null,

          // Make absolutely sure this is boolean
          is_writer:
            profile?.is_writer === true ||
            profile?.is_writer === "true",
        };

        console.log(
          "NAVBAR CURRENT USER:",
          currentUser
        );

        setUser(currentUser);

      } catch (error) {
        console.error(
          "FAILED TO LOAD NAVBAR USER:",
          error
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, location.pathname]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
    window.location.reload();
  };

  // ======================================================
  // DASHBOARD BUTTON
  // ======================================================

  const handleDashboard = () => {
    console.log(
      "DASHBOARD CLICK:",
      {
        role: user?.role,
        is_writer: user?.is_writer,
      }
    );

    // ----------------------------------------------
    // ADMIN
    // ----------------------------------------------

    if (user?.role === "admin") {
      navigate("/admin/articles");
      return;
    }

    // ----------------------------------------------
    // WRITER
    // ----------------------------------------------

    if (user?.is_writer === true) {
      navigate("/dashboard/writer/profile");
      return;
    }

    // ----------------------------------------------
    // NORMAL USER
    // ----------------------------------------------

    navigate("/dashboard/profile");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <header className="navbar">

      {/* ==================================================
          LOGO
      ================================================== */}

      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            navigate("/");
          }
        }}
        role="link"
        tabIndex="0"
        title="Go to homepage"
      >
        <img
          src={logo}
          alt="The Indian Guide Technology"
        />
      </div>

      {/* ==================================================
          RIGHT ACTIONS
      ================================================== */}

      <div className="nav-right">

        {/* ==================================================
            LOGGED IN
        ================================================== */}

        {token ? (
          <>
            {!loading && user && (
              <>
                {/* ==========================================
                    USER / WRITER
                ========================================== */}

                {(user.role === "user" ||
                  user.role === "writer") && (
                  <button
                    className="nav-btn dashboard-btn"
                    onClick={handleDashboard}
                  >
                    <span className="nav-icon">
                      <LayoutDashboard
                        size={18}
                        strokeWidth={2}
                      />
                    </span>

                    <span className="btn-text">
                      Dashboard
                    </span>
                  </button>
                )}

                {/* ==========================================
                    ADMIN
                ========================================== */}

                {user.role === "admin" && (
                  <>
                    <button
                      className="nav-btn dashboard-btn"
                      onClick={handleDashboard}
                    >
                      <span className="nav-icon">
                        <LayoutDashboard
                          size={18}
                          strokeWidth={2}
                        />
                      </span>

                      <span className="btn-text">
                        Dashboard
                      </span>
                    </button>

                    <button
                      className="nav-btn write-btn"
                      onClick={() =>
                        navigate("/create")
                      }
                    >
                      <span className="nav-icon">
                        <PenLine
                          size={18}
                          strokeWidth={2}
                        />
                      </span>

                      <span className="btn-text">
                        Create Post
                      </span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* ==========================================
                LOGOUT
            ========================================== */}

            <button
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              <span className="nav-icon">
                <LogOut
                  size={18}
                  strokeWidth={2}
                />
              </span>

              <span className="btn-text">
                Logout
              </span>
            </button>
          </>
        ) : (

          /* ==================================================
             GUEST
          ================================================== */

          <>
            {location.pathname !== "/" && (
              <button
                className="nav-btn home-btn"
                onClick={() => navigate("/")}
                title="Home"
              >
                <span className="nav-icon">
                  <House
                    size={18}
                    strokeWidth={2}
                  />
                </span>

                <span className="btn-text">
                  Home
                </span>
              </button>
            )}

            <button
              className="nav-btn signin-btn"
              onClick={() => navigate("/login")}
            >
              <span className="nav-icon">
                <LogIn
                  size={18}
                  strokeWidth={2}
                />
              </span>

              <span className="btn-text">
                Sign In
              </span>
            </button>
          </>
        )}

      </div>
    </header>
  );
};

export default Navbar;

