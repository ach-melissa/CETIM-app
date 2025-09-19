// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DataProvider } from "./context/DataContext";
import App from './App.jsx';
import "./App.css";
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
