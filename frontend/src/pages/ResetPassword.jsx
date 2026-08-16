import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import "./Auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      return alert("Please fill all fields.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      setLoading(true);

      const res = await resetPassword({
        email,
        password,
      });

      alert(res.data.message);

      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <div className="auth-brand">
          Indian Technology Guide
        </div>

        <div className="auth-heading">
          <p className="auth-kicker">
            Reset Password
          </p>

          <h2>Create New Password</h2>

          <p>
            Enter your new password below.
          </p>
        </div>

        <div className="auth-fields">

          <label>New Password</label>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />

        </div>

        <button
          className="auth-submit"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Updating..."
            : "Reset Password"}
        </button>

        <p className="auth-switch">
          <button
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </p>

      </div>
    </div>
  );
};

export default ResetPassword;