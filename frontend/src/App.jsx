// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ImportExcelPage from './pages/ImportExcelPage/ImportExcelPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; 


export default function App() {
  return (
    <Routes>
      <Route path="/import" element={<ImportExcelPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
