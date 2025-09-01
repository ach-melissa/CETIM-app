import React, { useEffect, useState } from 'react';
import Header from '../../header/Header';
import './parametre_norm.css';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export default function ParametreNorm() {
  // ✅ Déclare toujours l’état au tout début
  const [selectedOption, setSelectedOption] = useState('tous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]); 

  // ✅ Récupération dynamique
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const url = selectedOption === "tous"
          ? `${API_BASE}/api/parametres-with-limites`
          : `${API_BASE}/api/parametres-with-limites?categorie=${selectedOption}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError('❌ Impossible de charger les paramètres. Vérifie API et DB.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedOption]);

  const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
  <div className="parametreNormPage">
    <Header />
    <main className="content">
      <h1>Paramètres Norme</h1>

      {/* Filtres */}
      <h2>Type d'analyse :</h2>
      <div >
        {['mecanique', 'physique', 'chimique', 'supplémentaire', 'tous'].map(opt => (
          <label key={opt} style={{ marginRight: 16 }}>
            <input
              type="radio"
              name="analyse"
              value={opt}
              checked={selectedOption === opt}
              onChange={(e) => setSelectedOption(e.target.value)}
            />{' '}
            {titleCase(opt)}
          </label>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && <p>⏳ Chargement…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Affichage */}
      {!loading && !error && (
        <>
          <h2>Propriétés ({titleCase(selectedOption)})</h2>

          {/* Cartes propriétés */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: 24
            }}
          >
            {data.map((p) => (
              <div key={p.id} className="propCard">
                <label>
                  <strong>{p.nom}</strong> {p.unite ? `(${p.unite})` : ''}
                </label>
                <p style={{ fontSize: '0.9em', color: '#555' }}>
                  Catégorie : {titleCase(p.categorie)}
                </p>
              </div>
            ))}
          </div>

          {/* Tableau des limites */}
          <h3>Tableau des Limites ({titleCase(selectedOption)})</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead style={{ backgroundColor: '#f0f0f0' }}>
              <tr>
                <th>Propriété</th>
                <th>Cas (Ciment / Classe)</th>
                <th>Limite Inf</th>
                <th>Limite Sup</th>
                <th>Limite Garantie</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Aucune donnée disponible</td>
                </tr>
              )}

              {data.map((p) =>
                p.limites && p.limites.length > 0 ? (
                  p.limites.map((l) => (
                    <tr key={`${p.id}-${l.id}`}>
                      <td>{p.nom}{p.unite ? ` (${p.unite})` : ''}</td>
                      <td>
                        {l.ciment_type || '—'} 
                        {l.classe ? ` / ${l.classe}` : ''}
                      </td>
                      <td>{l.limite_inf ?? '—'}</td>
                      <td>{l.limite_sup ?? '—'}</td>
                      <td>{l.limite_garantie ?? '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={`${p.id}-nolimits`}>
                    <td>{p.nom}{p.unite ? ` (${p.unite})` : ''}</td>
                    <td colSpan="4" style={{ fontStyle: 'italic', textAlign: 'center' }}>
                      Pas de limites définies
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      )}
    </main>
  </div>

  );
}



