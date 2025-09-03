import React, { useEffect, useState } from 'react';
import Header from '../../header/Header';
import './TraitDonnes.css';

const TraitDonnes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [produits, setProduits] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState('');
  const [produitDescription, setProduitDescription] = useState('');
  const [phase, setPhase] = useState('');
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('donnees');
  const [loading, setLoading] = useState(false);

  // Charger la liste des clients
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/clients')
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur réseau');
        }
        return res.json();
      })
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur détaillée:', err);
        setError("Erreur lors du chargement des clients. Vérifiez que le serveur est démarré.");
        setLoading(false);
        
        // Données factices pour tester
        setClients([
          { id: 1, nom_raison_sociale: 'CETIM - Centre d\'Études et de Contrôle des Matériaux' },
          { id: 2, nom_raison_sociale: 'ENPC - Entreprise Nationale des Produits de Construction' },
          { id: 3, nom_raison_sociale: 'SONACIM - Société Nationale des Ciments' },
          { id: 4, nom_raison_sociale: 'LAFARGE Cement Company' },
          { id: 5, nom_raison_sociale: 'HOLCIM Algérie' }
        ]);
      });
  }, []);

  // Charger les produits lorsqu'un client est sélectionné
  useEffect(() => {
    if (!selectedClient) {
      setProduits([]);
      setSelectedProduit('');
      setProduitDescription('');
      return;
    }

    // Données factices pour les produits
    const produitsFactices = [
      { id: 1, nom: 'CEM I', description: 'Ciment Portland' },
      { id: 2, nom: 'CEM II/A', description: 'Ciment Portland composé' },
      { id: 3, nom: 'CEM II/B', description: 'Ciment Portland composé' },
      { id: 4, nom: 'CEM III', description: 'Ciment de haut fourneau' },
      { id: 5, nom: 'CEM IV', description: 'Ciment pouzzolanique' },
      { id: 6, nom: 'CEM V', description: 'Ciment composé' }
    ];

    setProduits(produitsFactices);
  }, [selectedClient]);

  // Mettre à jour la description du produit sélectionné
  useEffect(() => {
    if (!selectedProduit) {
      setProduitDescription('');
      return;
    }

    const produit = produits.find(p => p.id == selectedProduit);
    if (produit) {
      setProduitDescription(produit.description || 'Aucune description disponible');
    }
  }, [selectedProduit, produits]);

  // Charger les données du tableau lorsque tous les critères sont sélectionnés
  useEffect(() => {
    if (!selectedClient || !selectedProduit || !phase) {
      setTableData([]);
      return;
    }

    // Données factices pour le tableau
    const donneesFactices = [
      { id: 1, num_ech: 'E001', date: '2023-10-01', rc2j: 25.4, rc7j: 35.2, rc28j: 45.8, prise: '120 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.1, r_insoluble: 0.8, so3: 3.2, chlorure: 0.01, c3a: 7.5, ajout_percent: 5, type_ajout: 'Calcaire' },
      { id: 2, num_ech: 'E002', date: '2023-10-02', rc2j: 26.1, rc7j: 36.5, rc28j: 46.2, prise: '125 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.2, r_insoluble: 0.7, so3: 3.1, chlorure: 0.02, c3a: 7.8, ajout_percent: 6, type_ajout: 'Calcaire' },
      { id: 3, num_ech: 'E003', date: '2023-10-03', rc2j: 24.8, rc7j: 34.7, rc28j: 44.9, prise: '118 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.0, r_insoluble: 0.9, so3: 3.3, chlorure: 0.015, c3a: 7.2, ajout_percent: 4, type_ajout: 'Calcaire' }
    ];

    setTableData(donneesFactices);
  }, [selectedClient, selectedProduit, phase]);

  // Gérer l'import de fichier
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simuler l'importation
    setSuccess('Fichier importé avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Exporter les données
  const handleExport = () => {
    if (tableData.length === 0) {
      setError("Aucune donnée à exporter.");
      return;
    }

    setSuccess('Données exportées avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Imprimer les données
  const handlePrint = () => {
    window.print();
  };

  // Modifier une ligne de données
  const handleEdit = (id, field, value) => {
    setTableData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Sauvegarder les modifications
  const handleSave = () => {
    setSuccess('Modifications sauvegardées avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Supprimer des lignes sélectionnées
  const handleDelete = () => {
    if (selectedRows.length === 0) {
      setError("Veuillez sélectionner au moins une ligne à supprimer.");
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.length} élément(s)?`)) {
      return;
    }

    setTableData(prevData => prevData.filter(item => !selectedRows.includes(item.id)));
    setSelectedRows([]);
    setSuccess('Ligne(s) supprimée(s) avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Gérer la sélection des lignes
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  // Sélectionner/désélectionner toutes les lignes
  const toggleSelectAll = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map(item => item.id));
    }
  };

  // Fonction pour générer des données de graphique simulées
  const generateChartData = () => {
    if (!tableData || tableData.length === 0) return null;
    
    return {
      labels: tableData.map((item, index) => `Échantillon ${index + 1}`),
      rc2j: tableData.map(item => item.rc2j || 0),
      rc7j: tableData.map(item => item.rc7j || 0),
      rc28j: tableData.map(item => item.rc28j || 0),
    };
  };

  const chartData = generateChartData();

  // Fonction pour calculer les statistiques
  const calculateStats = () => {
    if (tableData.length === 0) return null;
    
    return {
      moyenneRC2J: (tableData.reduce((sum, item) => sum + (item.rc2j || 0), 0) / tableData.length).toFixed(2),
      moyenneRC7J: (tableData.reduce((sum, item) => sum + (item.rc7j || 0), 0) / tableData.length).toFixed(2),
      moyenneRC28J: (tableData.reduce((sum, item) => sum + (item.rc28j || 0), 0) / tableData.length).toFixed(2),
      minRC28J: Math.min(...tableData.map(item => item.rc28j || 0)).toFixed(2),
      maxRC28J: Math.max(...tableData.map(item => item.rc28j || 0)).toFixed(2),
      moyennePFeu: (tableData.reduce((sum, item) => sum + (item.pfeu || 0), 0) / tableData.length).toFixed(2),
      count: tableData.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="trait-donnees-container">
      <Header />
      
      <h1 className="trait-donnees-title">Traitement Données</h1>
      
      {/* Messages d'alerte */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Navigation par onglets */}
      <div className="tabs-container">
        <button 
          className={activeTab === 'donnees' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('donnees')}
        >
          📄 Données Traitées
        </button>
        <button 
          className={activeTab === 'statistiques' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('statistiques')}
        >
          📊 Données Statistiques
        </button>
        <button 
          className={activeTab === 'graphiques' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('graphiques')}
        >
          📈 Graphiques
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'donnees' && (
          <div>
            {/* Sélections uniquement dans l'onglet Données Traitées */}
            <div className="inputs-layout">
              <div className="input-block">
                <label htmlFor="client">Choisir un client:</label>
                {loading ? (
                  <div>Chargement des clients...</div>
                ) : (
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
                )}
              </div>

              <div className="input-block">
                <label htmlFor="produit">Produit (CEM):</label>
                <select
                  id="produit"
                  value={selectedProduit}
                  onChange={e => setSelectedProduit(e.target.value)}
                  disabled={!selectedClient}
                >
                  <option value="">-- Choisir un produit --</option>
                  {produits.map(produit => (
                    <option key={produit.id} value={produit.id}>
                      {produit.nom}
                    </option>
                  ))}
                </select>
                {produitDescription && (
                  <div className="produit-description">
                    <strong>Description:</strong> {produitDescription}
                  </div>
                )}
              </div>

              <div className="input-block">
                <label>Phase de production:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="production"
                      checked={phase === 'production'}
                      onChange={() => setPhase('production')}
                      className="radio-input"
                      disabled={!selectedProduit}
                    />
                    Situation courante
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="developpement"
                      checked={phase === 'developpement'}
                      onChange={() => setPhase('developpement')}
                      className="radio-input"
                      disabled={!selectedProduit}
                    />
                    Nouveau type produit
                  </label>
                </div>
              </div>
            </div>

            {/* Actions sur les données */}
            <div className="actions-bar">
              <div className="file-actions">
                <label htmlFor="file-import" className="action-btn import-btn">
                  <i className="fas fa-file-import"></i> Importer
                </label>
                <input
                  id="file-import"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
                <button className="action-btn export-btn" onClick={handleExport} disabled={tableData.length === 0}>
                  <i className="fas fa-file-export"></i> Exporter
                </button>
                <button className="action-btn print-btn" onClick={handlePrint} disabled={tableData.length === 0}>
                  <i className="fas fa-print"></i> Imprimer
                </button>
              </div>
              
              <div className="data-actions">
                <button 
                  className="action-btn save-btn" 
                  onClick={handleSave}
                  disabled={tableData.length === 0}
                >
                  <i className="fas fa-save"></i> Sauvegarder
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={handleDelete}
                  disabled={selectedRows.length === 0}
                >
                  <i className="fas fa-trash"></i> Supprimer ({selectedRows.length})
                </button>
              </div>
            </div>

            {/* Tableau des données */}
            <h3>📄 Tableau des Résultats</h3>
            {tableData.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedRows.length === tableData.length && tableData.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>N° ech</th>
                      <th>Date</th>
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
                      <th>C3A</th>
                      <th>Ajout %</th>
                      <th>Type Ajout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(row.id)}
                            onChange={() => toggleRowSelection(row.id)}
                          />
                        </td>
                        <td>{row.num_ech}</td>
                        <td>{row.date}</td>
                        <td>
                          <input
                            type="number"
                            value={row.rc2j || ''}
                            onChange={(e) => handleEdit(row.id, 'rc2j', e.target.value)}
                            className="editable-cell"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.rc7j || ''}
                            onChange={(e) => handleEdit(row.id, 'rc7j', e.target.value)}
                            className="editable-cell"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.rc28j || ''}
                            onChange={(e) => handleEdit(row.id, 'rc28j', e.target.value)}
                            className="editable-cell"
                          />
                        </td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">
                {selectedClient && selectedProduit && phase ? 
                  "Aucune donnée disponible pour ces critères." : 
                  "Veuillez sélectionner un client, un produit et une phase pour afficher les données."}
              </p>
            )}
          </div>
        )}

        {activeTab === 'statistiques' && (
          <div className="stats-section">
            <h3>📊 Données Statistiques</h3>
            {stats ? (
              <div>
                <div className="stats-info">
                  <p>Client sélectionné: <strong>{clients.find(c => c.id == selectedClient)?.nom_raison_sociale || 'Aucun'}</strong></p>
                  <p>Produit sélectionné: <strong>{produits.find(p => p.id == selectedProduit)?.nom || 'Aucun'}</strong></p>
                  <p>Phase sélectionnée: <strong>{phase === 'production' ? 'Situation courante' : phase === 'developpement' ? 'Nouveau type produit' : 'Aucune'}</strong></p>
                </div>
                
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Paramètre</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nombre d'échantillons</td>
                      <td>{stats.count}</td>
                    </tr>
                    <tr>
                      <td>Moyenne RC 2J</td>
                      <td>{stats.moyenneRC2J} MPa</td>
                    </tr>
                    <tr>
                      <td>Moyenne RC 7J</td>
                      <td>{stats.moyenneRC7J} MPa</td>
                    </tr>
                    <tr>
                      <td>Moyenne RC 28J</td>
                      <td>{stats.moyenneRC28J} MPa</td>
                    </tr>
                    <tr>
                      <td>Minimum RC 28J</td>
                      <td>{stats.minRC28J} MPa</td>
                    </tr>
                    <tr>
                      <td>Maximum RC 28J</td>
                      <td>{stats.maxRC28J} MPa</td>
                    </tr>
                    <tr>
                      <td>Moyenne Perte au Feu</td>
                      <td>{stats.moyennePFeu} %</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">Veuillez d'abord sélectionner un client, un produit et une phase dans l'onglet "Données Traitées".</p>
            )}
          </div>
        )}

        {activeTab === 'graphiques' && (
          <div className="charts-section">
            <h3>📈 Graphiques des Résultats</h3>
            
            {chartData ? (
              <div className="charts-container">
                <div className="chart">
                  <h4>Résistance à la Compression (MPa)</h4>
                  <div className="chart-bars">
                    {chartData.rc2j.map((value, index) => (
                      <div key={index} className="bar-container">
                        <div className="bar-label">Éch {index + 1}</div>
                        <div className="bar-group">
                          <div 
                            className="bar bar-2j"
                            style={{ height: `${value * 2}px` }}
                            title={`RC2J: ${value} MPa`}
                          ></div>
                          <div 
                            className="bar bar-7j"
                            style={{ height: `${chartData.rc7j[index] * 2}px` }}
                            title={`RC7J: ${chartData.rc7j[index]} MPa`}
                          ></div>
                          <div 
                            className="bar bar-28j"
                            style={{ height: `${chartData.rc28j[index] * 2}px` }}
                            title={`RC28J: ${chartData.rc28j[index]} MPa`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#ff6b6b'}}></div>
                      <span>RC2J</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#4ecdc4'}}></div>
                      <span>RC7J</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#45b7d1'}}></div>
                      <span>RC28J</span>
                    </div>
                  </div>
                </div>

                <div className="chart">
                  <h4>Évolution Moyenne des Résistances</h4>
                  <div className="average-chart">
                    <div className="average-bar" title={`Moyenne RC2J: ${stats.moyenneRC2J} MPa`}>
                      <div className="average-value">2J</div>
                      <div 
                        className="average-fill" 
                        style={{ 
                          height: `${stats.moyenneRC2J * 2}px`, 
                          backgroundColor: '#ff6b6b' 
                        }}
                      ></div>
                    </div>
                    <div className="average-bar" title={`Moyenne RC7J: ${stats.moyenneRC7J} MPa`}>
                      <div className="average-value">7J</div>
                      <div 
                        className="average-fill" 
                        style={{ 
                          height: `${stats.moyenneRC7J * 2}px`, 
                          backgroundColor: '#4ecdc4' 
                        }}
                      ></div>
                    </div>
                    <div className="average-bar" title={`Moyenne RC28J: ${stats.moyenneRC28J} MPa`}>
                      <div className="average-value">28J</div>
                      <div 
                        className="average-fill" 
                        style={{ 
                          height: `${stats.moyenneRC28J * 2}px`, 
                          backgroundColor: '#45b7d1' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-data">Veuillez d'abord sélectionner un client, un produit et une phase dans l'onglet "Données Traitées".</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TraitDonnes;