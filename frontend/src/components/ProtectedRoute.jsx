import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  let user = null;

  try {
    user = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token");
    return <Navigate to="/login" />;
  }

  // ✅ Role check
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;