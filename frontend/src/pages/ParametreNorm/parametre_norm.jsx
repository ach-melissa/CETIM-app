import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../header/Header';
import './parametre_norm.css';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";


export default function ParametreNorm() {
  const [selectedOption, setSelectedOption] = useState('tous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]); // [{id, nom, unite, categorie, limites: [...]}, ...]

  // Fetch when selectedOption changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/parametres-with-limites?categorie=${selectedOption}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError('Failed to load parameters. Check API and DB.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedOption]);

  const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Header />
      <h1>Paramètre Norm</h1>

      <h2>Type d'analyse :</h2>
      <div style={{ marginBottom: '20px' }}>
        {['mecanique', 'physique', 'chimique', 'durabilite', 'tous'].map(opt => (
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

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <h2>Propriétés ({titleCase(selectedOption)})</h2>
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
                <label><strong>{p.nom}</strong> {p.unite ? `(${p.unite})` : ''}</label>
                
              </div>
            ))}
          </div>

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
                  <td colSpan="6" style={{ textAlign: 'center' }}>Aucune donnée</td>
                </tr>
              )}
              {data.map((p) => (
                p.limites.length > 0 ? (
                  p.limites.map((l) => (
                    <tr key={`${p.id}-${l.id}`}>
                      <td>{p.nom}{p.unite ? ` (${p.unite})` : ''}</td>
                      <td>{l.ciment_type || '—'} {l.classe ? ` / ${l.classe}` : ''}</td>
                      <td>{l.limite_inf ?? '—'}</td>
                      <td>{l.limite_sup ?? '—'}</td>
                      <td>{l.limite_garantie ?? '—'}</td>
                      
                    </tr>
                  ))
                ) : (
                  <tr key={`${p.id}-nolimits`}>
                    <td>{p.nom}{p.unite ? ` (${p.unite})` : ''}</td>
                    <td colSpan="5" style={{ fontStyle: 'italic' }}>Pas de limites définies</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}


