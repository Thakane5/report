import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [loginData, setLoginData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const [loading, setLoading] = useState(false);

  // Handle inputs
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First try to login with existing credentials
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Save user in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role SELECTED (not just DB role)
        redirectBasedOnRole(loginData.role || data.user.role);
      } else {
        // If login fails, try to auto-register the user
        await handleAutoRegister();
      }
    } catch (err) {
      console.log("Login error:", err);
      // If fetch fails, try auto-register
      await handleAutoRegister();
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO REGISTER ----------------
  const handleAutoRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: loginData.name,
          email: loginData.email,
          password: loginData.password,
          role: loginData.role
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Save user in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        redirectBasedOnRole(loginData.role);
      } else {
        alert(data.message || "Login/Auto-register failed");
      }
    } catch (err) {
      console.log("Auto-register error:", err);
      alert("Connection error: Please check if server is running");
    }
  };

  // ---------------- REDIRECT ----------------
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "student":
        window.location.href = "/student-dashboard";
        break;
      case "lecturer":
        window.location.href = "/lecturer-dashboard";
        break;
      case "prl":
        window.location.href = "/prl-dashboard";
        break;
      case "pl":
        window.location.href = "/pl-dashboard";
        break;
      default:
        window.location.href = "/";
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="title">LUCT REPORTS</h1>
          <p className="subtitle">Faculty Reporting System</p>
        </div>

        {/* ---------------- LOGIN FORM ---------------- */}
        <form onSubmit={handleLogin} className="form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={loginData.name}
              onChange={handleLoginChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@luct.ac.ls"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Select Your Role</label>
            <select
              name="role"
              value={loginData.role}
              onChange={handleLoginChange}
              required
            >
              <option value="">Choose your role</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="prl">Principal Lecturer (PRL)</option>
              <option value="pl">Program Leader (PL)</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-info">
          <p>Enter your details to access the system.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;