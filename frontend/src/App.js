import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import PRLDashboard from "./pages/PRLDashboard";
import PLDashboard from "./pages/PLDashboard";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-root">
        {/* Navigation Header */}
        <nav className="main-nav">
          <div className="brand-name">LUCT report</div>

          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/student-dashboard">Student</Link>
            <Link to="/lecturer-dashboard">Lecturer</Link>
            <Link to="/prl-dashboard">PRL</Link>
            <Link to="/pl-dashboard">PL</Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
            <Route path="/prl-dashboard" element={<PRLDashboard />} />
            <Route path="/pl-dashboard" element={<PLDashboard />} />
          </Routes>
        </main>

        {/* Bottom Footer Only */}
        <footer className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} LUCT report. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
