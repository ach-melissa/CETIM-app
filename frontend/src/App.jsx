
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard"
import Header from "./components/Header/Header.jsx";
import ParametreEntreprise from "./pages/ParametreEntreprise/Parametre_entreprise.jsx";
import TraitDonnes from "./pages/TraitementDonnées/traitement-données.jsx";
import ParametreNorm from "./pages/ParametreNorm/parametre_norm.jsx";
import Historique from "./pages/Historique/historique.jsx";

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<LoginPage />} />
     <Route
  path="/dashboard"
  element={
    <>
      <Header />
      <AdminDashboard />
    </>
  }
/>
      <Route path="/login-success" element={<Navigate to="/parnorm" replace />} />

      {/* Pages with sidebar */}
      <Route
        path="/parnorm"
        element={
          <>
            <Header />
            <ParametreNorm />
          </>
        }
      />
      <Route
        path="/parentreprise"
        element={
          <>
            <Header />
            <ParametreEntreprise />
          </>
        }
      />
      <Route
        path="/traitdonnes"
        element={
          <>
            <Header />
            <TraitDonnes />
          </>
        }
      />
      <Route
        path="/historique"
        element={
          <>
            <Header />
            <Historique />
          </>
        }
      />
    </Routes>
  );
}
