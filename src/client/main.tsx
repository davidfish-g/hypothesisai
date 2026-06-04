import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./globals.css";
import { AuthProvider } from "@/client/auth/auth-context";
import { AppLayout } from "@/client/app-layout";
import Home from "@/client/routes/home";
import AboutPage from "@/client/routes/about";
import SignIn from "@/client/routes/signin";
import Dashboard from "@/client/routes/dashboard";
import EvaluatePage from "@/client/routes/evaluate";
import ProfilePage from "@/client/routes/profile";
import Leaderboard from "@/client/routes/leaderboard";
import DomainLeaderboard from "@/client/routes/leaderboard/domain";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="auth/signin" element={<SignIn />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="evaluate" element={<EvaluatePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="leaderboard/:domain" element={<DomainLeaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
