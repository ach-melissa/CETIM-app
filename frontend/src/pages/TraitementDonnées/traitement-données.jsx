import React, { useEffect, useState } from 'react';
import Header from '../../header/Header';



const TraitDonnes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [produit, setProduit] = useState('');
  const [phase, setPhase] = useState('');
  const [produitClient, setProduitClient] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/clients')
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des clients.");
      });
  }, []);

  useEffect(() => {
    if (!selectedClient) return;

    fetch(`http://localhost:3001/api/clients/${selectedClient}`)
      .then(res => res.json())
      .then(data => {
        setProduitClient(data.produit_ciment || '');
        setProduit('');
        setStats(null);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement du produit.");
      });
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedClient || !produit || !phase) {
      setStats(null);
      return;
    }

    fetch(
      `http://localhost:3001/api/statistiques?client_id=${selectedClient}&produit=${encodeURIComponent(
        produit
      )}&phase=${phase}`
    )
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des statistiques.");
      });
  }, [selectedClient, produit, phase]);

  return (
    <div style={styles.container}>
       <Header />
      <h1 className="title">Traitement Données </h1>
      <div style={styles.inputsLayout}>
        <div style={styles.inputBlock}>
          <label htmlFor="client">Choisir un client:</label>
          <select
            id="client"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            <option value="">-- Sélectionner un client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nom_raison_sociale}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.inputBlock}>
          <label htmlFor="produit">Produit (CEM):</label>
          <select
            id="produit"
            value={produit}
            onChange={e => setProduit(e.target.value)}
            disabled={!produitClient}
          >
            <option value="">-- Choisir un produit --</option>
            {produitClient && (
              <option value={produitClient}>{produitClient}</option>
            )}
          </select>
        </div>

<div style={styles.inputBlock}>
  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
    Phase de production:
  </label>

  <div style={styles.radioGroup}>
    <label style={styles.radioLabel}>
      <input
        type="radio"
        value="production"
        checked={phase === 'production'}
        onChange={() => setPhase('production')}
        style={styles.radioInput}
      />
      situation courante
    </label>
<br/>
    <label style={styles.radioLabel}>
      <input
        type="radio"
        value="developpement"
        checked={phase === 'developpement'}
        onChange={() => setPhase('developpement')}
        style={styles.radioInput}
      />
      nv type produit
    </label>
  </div>
</div>

      </div>



{stats && (
  <div style={{ marginTop: '30px' }}>
    <h3>📄 Tableau des Résultats</h3>
    <table style={styles.table}>
      <thead>
        <tr>
          <th>N° ech</th>
          <th>Date</th>
          <th>Heure</th>
          <th>RC2J</th>
          <th>RC7J</th>
          <th>RC28J</th>
          <th>Prise</th>
          <th>Stabilité</th>
          <th>Hydratation</th>
          <th>P. Feu</th>
          <th>R. Insoluble</th>
          <th>SO3</th>
          <th>Chlorure</th>
          <th className="c3a">C3A</th>
          <th className="ajout">Ajout %</th>
          <th className="ajout">Type Ajout</th>
        </tr>
      </thead>
      <tbody>
        {/* You can replace this with dynamic rows from `stats.liste` if available */}
        {stats.liste && stats.liste.length > 0 ? (
          stats.liste.map((row, idx) => (
            <tr key={idx}>
              <td>{row.num_ech}</td>
              <td>{row.date}</td>
              <td>{row.heure}</td>
              <td>{row.rc2j}</td>
              <td>{row.rc7j}</td>
              <td>{row.rc28j}</td>
              <td>{row.prise}</td>
              <td>{row.stabilite}</td>
              <td>{row.hydratation}</td>
              <td>{row.pfeu}</td>
              <td>{row.r_insoluble}</td>
              <td>{row.so3}</td>
              <td>{row.chlorure}</td>
              <td>{row.c3a}</td>
              <td>{row.ajout_percent}</td>
              <td>{row.type_ajout}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="16" style={{ textAlign: 'center' }}>Aucune donnée disponible</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}

<div style={styles.statsSection}>
  <h3>📊 Données Statistiques</h3>
  {error && <p style={{ color: 'red' }}>{error}</p>}
  {!stats ? (
    <p>Veuillez sélectionner un client, un produit et une phase.</p>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
      <thead style={{ backgroundColor: '#eee' }}>
        <tr>
          <th style={styles.th}>Paramètre</th>
          <th style={styles.th}>Valeur</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={styles.td}>Moyenne RC 28J</td>
          <td style={styles.td}>{stats.moyenne_rc28j ?? 'N/A'}</td>
        </tr>
        <tr>
          <td style={styles.td}>Min Perte au Feu</td>
          <td style={styles.td}>{stats.min_pfeu ?? 'N/A'}</td>
        </tr>
        <tr>
          <td style={styles.td}>Max Perte au Feu</td>
          <td style={styles.td}>{stats.max_pfeu ?? 'N/A'}</td>
        </tr>
        <tr>
          <td style={styles.td}>Écart-type SO3</td>
          <td style={styles.td}>{stats.ecart_type_so3 ?? 'N/A'}</td>
        </tr>
      </tbody>
    </table>
  )}
</div>

    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '30px',
    backgroundColor: '#f4f4f4',
  },
  inputsLayout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '10px',
    marginTop: '80px',
  },
  inputBlock: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginTop:'100px',
  },
};


export default TraitDonnes;
