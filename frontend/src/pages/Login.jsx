import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import "./Auth.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await loginUser(form);

      // SAVE TOKEN
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-brand">Indian Technology Guide</div>
        <div className="auth-heading">
          <p className="auth-kicker">Welcome back</p>
          <h2>Sign in to continue.</h2>
          <p>Access your reading activity and personalised dashboard.</p>
        </div>

        <div className="auth-fields">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />
          <p className="forgot-password">
            <a
              href="/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Forgot Password?
            </a>
          </p>
        </div>

        <button className="auth-submit" onClick={handleSubmit}>
          Sign in <span aria-hidden="true">→</span>
        </button>

        <p className="auth-switch">
          New here?{" "}
          <button onClick={() => navigate("/register")}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
