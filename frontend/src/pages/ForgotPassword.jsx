import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import "./Auth.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      return alert("Please enter your email.");
    }

    try {
      setLoading(true);

      const res = await forgotPassword({ email });

      alert(res.data.message);

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (err) {
  console.error("Forgot Password Error:", err);
  console.error("Response:", err.response);

  alert(
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Something went wrong."
  );
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
            Forgot Password
          </p>

          <h2>Reset your password</h2>

          <p>
            Enter your registered email address.
            We'll send you a verification code.
          </p>
        </div>

        <div className="auth-fields">

          <label>Email Address</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

        </div>

        <button
          className="auth-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <p className="auth-switch">
          Remember your password?{" "}
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

export default ForgotPassword;