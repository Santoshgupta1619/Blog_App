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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await registerUser(form);

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-brand">Indian Technology Guide</div>
        <div className="auth-heading">
          <p className="auth-kicker">Join the community</p>
          <h2>Create your account.</h2>
          <p>Save stories, follow along, and make your reading space your own.</p>
        </div>

        <div className="auth-fields">
          <label htmlFor="register-name">Your name</label>
          <input
            id="register-name"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="auth-submit" onClick={handleSubmit}>
          Create account <span aria-hidden="true">→</span>
        </button>

        <p className="auth-switch">
          Already have an account? <button onClick={() => navigate("/login")}>Sign in</button>
        </p>
      </div>
    </div>
  );
};

export default Register;
