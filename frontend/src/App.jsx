// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ImportExcelPage from './pages/ImportExcelPage/ImportExcelPage';

export default function App() {
  return (
    <Routes>
      <Route path="/import" element={<ImportExcelPage />} />
    </Routes>
  );
}
