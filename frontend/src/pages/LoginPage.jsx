import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; // improved styling

export default function LoginPage() {
  // identifiant peut être email OU username
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // envoie générique : email OU username
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const { token, role } = data;

      // stocker token + role
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // redirection selon rôle
      if (role === 'admin') navigate('/traitdonnes');
      else if (role === 'user') navigate('/parnorm');
      else setErrorMessage('Rôle inconnu.');
    } catch (err) {
      setErrorMessage('Identifiant ou mot de passe incorrect.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src="/image/LogoCetim.png" alt="Logo" className="login-logo" />
        <h2>Se connecter</h2>
        <form onSubmit={handleSubmit}>
          <label>Email ou Nom d’utilisateur :</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Entrez votre email ou nom d'utilisateur"
            required
          />

          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            required
          />

          <button type="submit">Se connecter</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}
