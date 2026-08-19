import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import "./Auth.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser(form);

      setRegisteredEmail(form.email);
      setRegistered(true);

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-box verify-email-box">

          <div className="auth-brand">
            The Indian Guide Technology
          </div>

          <div className="verify-email-content">

            <div className="verify-icon success">
              ✓
            </div>

            <div className="auth-heading">

              <p className="auth-kicker">
                Almost there
              </p>

              <h2>
                Check your email.
              </h2>

              <p>
                We've sent a verification link to{" "}
                <strong>{registeredEmail}</strong>.
              </p>

              <p style={{ marginTop: "12px" }}>
                Click the link in that email to verify
                your account. The link is valid for 24
                hours.
              </p>

            </div>

            <button
              className="auth-submit"
              onClick={() => navigate("/login")}
            >
              Go to login
              <span aria-hidden="true">→</span>
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">

        <div className="auth-brand">
          Indian Technology Guide
        </div>

        <div className="auth-heading">

          <p className="auth-kicker">
            Join the community
          </p>

          <h2>
            Create your account.
          </h2>

          <p>
            Save stories, follow along, and make your
            reading space your own.
          </p>

        </div>

        <div className="auth-fields">

          <label htmlFor="register-name">
            Your name
          </label>

          <input
            id="register-name"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />

          <label htmlFor="register-email">
            Email address
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="register-password">
            Password
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
          />

        </div>

        <button
          className="auth-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create account"}

          {!loading && (
            <span aria-hidden="true">
              →
            </span>
          )}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>

      </div>
    </div>
  );
};

export default Register;