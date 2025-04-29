import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "./Services/authServices.js";
import App from "./App.jsx";
import LoginPage from "./pages/Login.jsx";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if route is admin-only and user is not admin
  if (window.location.pathname.includes('/admin') && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main Application Structure
const AppWrapper = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

// Auth Route - Redirects to app if already logged in
const AuthRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// React 18's createRoot API
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);