import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ParametreEntreprise from "./pages/ParametreEntreprise/Parametre_entreprise.jsx";
import TraitDonnes from "./pages/TraitementDonnées/traitement-données.jsx";
import ParametreNorm from "./pages/ParametreNorm/parametre_norm.jsx";
import Historique from "./pages/Historique/historique.jsx";

import "./App.css";

export default function App() {
  return (
    <Routes>
      {/* Login page (root) */}
      <Route path="/" element={<LoginPage />} />

      {/* Redirect example after login */}
      <Route path="/login-success" element={<Navigate to="/parnorm" replace />} />

      {/* Dashboard and other pages */}
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/parnorm" element={<ParametreNorm />} />
      <Route path="/parentreprise" element={<ParametreEntreprise />} />
      <Route path="/traitdonnes" element={<TraitDonnes />} />
      <Route path="/historique" element={<Historique />} />

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
