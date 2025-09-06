
{/* to receive the data from DB */}

import React from 'react';
import { useLocation } from 'react-router-dom';

export default function SomeTargetPage() {
  const location = useLocation();
  const { client, parametres } = location.state || {};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Données Client Sélectionné</h2>

      {client && (
        <div>
          <p><strong>Nom / Raison Sociale:</strong> {client.nom_raison_sociale}</p>
          <p><strong>Adresse:</strong> {client.adresse}</p>
        </div>
      )}

      {parametres && parametres.length > 0 && (
        <div>
          <h3>Paramètres Ciment :</h3>
          <ul>
            {parametres.map((p, idx) => (
              <li key={idx}>
                {p.type_ciment} | {p.produit_ciment} | {p.methode}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}