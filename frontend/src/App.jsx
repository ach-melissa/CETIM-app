
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard"
import ParametreEntreprise from "./pages/ParametreEntreprise/Parametre_entreprise.jsx";
import TraitDonnes from "./pages/TraitementDonnées/traitement-données.jsx";
import ParametreNorm from "./pages/ParametreNorm/parametre_norm.jsx";
import Historique from "./pages/Historique/historique.jsx";

export default function App() {
  return (
    <Routes>
  <Route path="/" element={<LoginPage />} />
  <Route path="/login-success" element={<Navigate to="/parnorm" replace />} />

  <Route path="/dashboard" element={<AdminDashboard />} />
  <Route path="/parnorm" element={<ParametreNorm />} />
  <Route path="/parentreprise" element={<ParametreEntreprise />} />
  <Route path="/traitdonnes" element={<TraitDonnes />} />
  <Route path="/historique" element={<Historique />} />
</Routes>

  );
}
