// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ImportExcelPage from './pages/ImportExcelPage/ImportExcelPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; 
import ParametreEntreprise from './pages/ParametreEntreprise/Parametre_entreprise';
import TraitDonnes from  './pages/TraitementDonnées/traitement-données' ;
import ParametreNorm from './pages/ParametreNorm/parametre_norm';
import Historique from './pages/Historique/historique';  


export default function App() {
  return (
    <Routes>
      
      <Route path="/import" element={<ImportExcelPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/parentreprise" element={<ParametreEntreprise />} />
      <Route path="/traitdonnes" element={<TraitDonnes />} />
      <Route path="/parnorm" element={<ParametreNorm />} />
      <Route path="/historique" element={<Historique />} />

    </Routes>
  );
}
