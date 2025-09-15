// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; 
import ParametreEntreprise from './pages/ParametreEntreprise/Parametre_entreprise.jsx';
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import TraitDonnes from  './pages/TraitementDonnées/traitement-données.jsx';
import ParametreNorm from './pages/ParametreNorm/parametre_norm.jsx';
import Historique from './pages/Historique/historique.jsx';  

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} /> 
      <Route path="/admin" element={<AdminDashboard />} />
      
      {/* Redirect after login */}
      <Route path="/login-success" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard with horizontal navigation */}
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route index element={<DashboardHome />} />
        <Route path="parnorm" element={<ParametreNorm />} />
        <Route path="parentreprise" element={<ParametreEntreprise />} />
        <Route path="traitdonnes" element={<TraitDonnes />} />
        <Route path="historique" element={<Historique />} />
      </Route>
    </Routes>
  );
}

// Dashboard Home Component
function DashboardHome() {
  return (
    <div className="dashboard-home">
      <h1>Bienvenue sur votre Tableau de Bord</h1>
      <p>Sélectionnez une option dans le menu de navigation ci-dessus</p>
    </div>
  );
}
