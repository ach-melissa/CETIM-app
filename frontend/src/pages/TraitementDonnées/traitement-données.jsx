import React, { useEffect, useState } from 'react';
import Header from '../../header/Header';
import * as XLSX from 'xlsx';
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
  
  // States for charts
  const [selectedParameter, setSelectedParameter] = useState('rc28j');
  const [selectedClass, setSelectedClass] = useState('42.5N');
  const [chartStats, setChartStats] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('excelData');
    if (savedData) {
      try {
        setTableData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading saved data:', e);
        setError('Error loading saved data');
      }
    }
  }, []);

  // Save data to localStorage whenever tableData changes
  useEffect(() => {
    if (tableData.length > 0) {
      localStorage.setItem('excelData', JSON.stringify(tableData));
    }
  }, [tableData]);

  // Parameter options
  const parameters = [
    { id: 'rc2j', label: 'Résistance 2 jours (RC2J)' },
    { id: 'rc7j', label: 'Résistance 7 jours (RC7J)' },
    { id: 'rc28j', label: 'Résistance 28 jours (RC28J)' },
    { id: 'tdprise', label: 'Temps de début de prise' },
    { id: 'stblt', label: 'Stabilité (expansion)' },
    { id: 'cl', label: 'Chaleur d\'hydratation' },
    { id: 'ptf', label: 'Perte au feu' },
    { id: 'resinso', label: 'Résidu insoluble' },
    { id: 'so3', label: 'SO3' },
    { id: 'chl', label: 'Chlorures' },
    { id: 'pouz', label: 'Pouzzolanicité' },
    { id: 'so3sr', label: 'SO3 (SR)' },
    { id: 'c3a', label: 'C3A (clinker)' },
    { id: 'pouzsr', label: 'Pouzzolanicité (SR)' }
  ];

  // Class options organized by type
  const classOptions = {
    'N': ['32.5N', '42.5N', '52.5N'],
    'R': ['32.5R', '42.5R', '52.5R'],
    'L': ['32.5L', '42.5L', '52.5L']
  };

  // Load clients list
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/clients')
      .then(res => {
        if (!res.ok) throw new Error('Erreur réseau');
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
        
        // Mock data for testing
        setClients([
          { id: 1, nom_raison_sociale: 'CETIM - Centre d\'Études et de Contrôle des Matériaux' },
          { id: 2, nom_raison_sociale: 'ENPC - Entreprise Nationale des Produits de Construction' },
          { id: 3, nom_raison_sociale: 'SONACIM - Société Nationale des Ciments' },
          { id: 4, nom_raison_sociale: 'LAFARGE Cement Company' },
          { id: 5, nom_raison_sociale: 'HOLCIM Algérie' }
        ]);
      });
  }, []);

  // Load products when a client is selected
  useEffect(() => {
    if (!selectedClient) {
      setProduits([]);
      setSelectedProduit('');
      setProduitDescription('');
      return;
    }

    // Mock products data
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

  // Update description of selected product
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

  // Load table data when all criteria are selected
  useEffect(() => {
    if (!selectedClient || !selectedProduit || !phase) {
      // Don't clear tableData if we have saved data
      if (tableData.length === 0) {
        const savedData = localStorage.getItem('excelData');
        if (savedData) {
          try {
            setTableData(JSON.parse(savedData));
          } catch (e) {
            console.error('Error loading saved data:', e);
          }
        }
      }
      return;
    }

    // If we have saved data, use it instead of mock data
    const savedData = localStorage.getItem('excelData');
    if (savedData) {
      try {
        setTableData(JSON.parse(savedData));
        return;
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }

    // Mock table data (only if no saved data)
    const donneesFactices = [
      { id: 1, num_ech: 'E001', date: '2023-10-01', rc2j: 25.4, rc7j: 35.2, rc28j: 45.8, prise: '120 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.1, r_insoluble: 0.8, so3: 3.2, chlorure: 0.01, c3a: 7.5, ajout_percent: 5, type_ajout: 'Calcaire' },
      { id: 2, num_ech: 'E002', date: '2023-10-02', rc2j: 26.1, rc7j: 36.5, rc28j: 46.2, prise: '125 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.2, r_insoluble: 0.7, so3: 3.1, chlorure: 0.02, c3a: 7.8, ajout_percent: 6, type_ajout: 'Calcaire' },
      { id: 3, num_ech: 'E003', date: '2023-10-03', rc2j: 24.8, rc7j: 34.7, rc28j: 44.9, prise: '118 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.0, r_insoluble: 0.9, so3: 3.3, chlorure: 0.015, c3a: 7.2, ajout_percent: 4, type_ajout: 'Calcaire' },
      { id: 4, num_ech: 'E004', date: '2023-10-04', rc2j: 27.2, rc7j: 37.8, rc28j: 48.3, prise: '122 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 2.3, r_insoluble: 0.6, so3: 3.0, chlorure: 0.018, c3a: 8.1, ajout_percent: 5.5, type_ajout: 'Calcaire' },
      { id: 5, num_ech: 'E005', date: '2023-10-05', rc2j: 23.9, rc7j: 33.5, rc28j: 43.7, prise: '115 min', stabilite: 'OK', hydratation: 'Normal', pfeu: 1.9, r_insoluble: 1.0, so3: 3.4, chlorure: 0.012, c3a: 7.0, ajout_percent: 4.5, type_ajout: 'Calcaire' }
    ];

    setTableData(donneesFactices);
  }, [selectedClient, selectedProduit, phase]);

  // Calculate statistics for charts
  useEffect(() => {
    if (tableData.length === 0 || !selectedParameter) {
      setChartStats(null);
      return;
    }

    // Filter data based on selected parameter
    const values = tableData.map(item => item[selectedParameter]).filter(val => val !== undefined);
    
    if (values.length === 0) {
      setChartStats(null);
      return;
    }

    // Calculate statistics
    const moyenne = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Define limits based on selected class
    let limiteInf, limiteSup, limiteGarantie;
    
    switch(selectedClass) {
      case '32.5N':
        limiteInf = 12.0;
        limiteSup = 52.5;
        limiteGarantie = 32.5;
        break;
      case '42.5N':
        limiteInf = 20.0;
        limiteSup = 62.5;
        limiteGarantie = 42.5;
        break;
      case '52.5N':
        limiteInf = 30.0;
        limiteSup = 72.5;
        limiteGarantie = 52.5;
        break;
      default:
        limiteInf = 20.0;
        limiteSup = 62.5;
        limiteGarantie = 42.5;
    }
    
    // Count values outside limits
    const countBelowInf = values.filter(v => v < limiteInf).length;
    const countAboveSup = values.filter(v => v > limiteSup).length;
    const countBelowGarantie = values.filter(v => v < limiteGarantie).length;
    
    const percentBelowInf = (countBelowInf / values.length * 100).toFixed(1);
    const percentAboveSup = (countAboveSup / values.length * 100).toFixed(1);
    const percentBelowGarantie = (countBelowGarantie / values.length * 100).toFixed(1);

    setChartStats({
      moyenne: moyenne.toFixed(3),
      min: min.toFixed(2),
      max: max.toFixed(2),
      count: values.length,
      limiteInf,
      limiteSup,
      limiteGarantie,
      countBelowInf,
      countAboveSup,
      countBelowGarantie,
      percentBelowInf,
      percentAboveSup,
      percentBelowGarantie
    });
  }, [tableData, selectedParameter, selectedClass]);

  // Excel file import handler
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if a client is selected
    if (!selectedClient) {
      setError("Veuillez d'abord sélectionner un client.");
      return;
    }

    const allowedExtensions = ['.xls', '.xlsx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('❌ Seuls les fichiers Excel (.xls, .xlsx) sont autorisés.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Process the Excel data and add it to the table
        processExcelData(jsonData);
        
        setSuccess('Fichier Excel importé avec succès! Les données ont été ajoutées au tableau.');
        setTimeout(() => setSuccess(''), 5000);
      } catch (error) {
        console.error('Erreur lors du traitement du fichier Excel:', error);
        setError('Erreur lors du traitement du fichier Excel. Veuillez vérifier le format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Process Excel data and add to table
  const processExcelData = (excelData) => {
    if (!excelData || excelData.length < 2) {
      setError('Le fichier Excel ne contient pas de données valides.');
      return;
    }

    // Extract headers (first row)
    const headers = excelData[0].map(header => header.toLowerCase().replace(/\s+/g, '_'));
    
    // Process data rows
    const newData = [];
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      if (row.length === 0) continue; // Skip empty rows
      
      const newRow = { id: Date.now() + i }; // Generate unique ID
      
      // Map Excel columns to our data structure
      headers.forEach((header, index) => {
        if (index < row.length) {
          // Convert header names to match our table structure
          let mappedHeader = header;
          if (header.includes('num') || header.includes('éch') || header.includes('ech')) mappedHeader = 'num_ech';
          if (header.includes('date')) mappedHeader = 'date';
          if (header.includes('rc2j') || header.includes('2j')) mappedHeader = 'rc2j';
          if (header.includes('rc7j') || header.includes('7j')) mappedHeader = 'rc7j';
          if (header.includes('rc28j') || header.includes('28j')) mappedHeader = 'rc28j';
          if (header.includes('prise')) mappedHeader = 'prise';
          if (header.includes('stabilit') || header.includes('stab')) mappedHeader = 'stabilite';
          if (header.includes('hydratation')) mappedHeader = 'hydratation';
          if (header.includes('feu') || header.includes('p.feu')) mappedHeader = 'pfeu';
          if (header.includes('insoluble')) mappedHeader = 'r_insoluble';
          if (header.includes('so3')) mappedHeader = 'so3';
          if (header.includes('chlorure')) mappedHeader = 'chlorure';
          if (header.includes('c3a')) mappedHeader = 'c3a';
          if (header.includes('ajout') && header.includes('%')) mappedHeader = 'ajout_percent';
          if (header.includes('type') && header.includes('ajout')) mappedHeader = 'type_ajout';
          
          // Convert numeric values
          if (['rc2j', 'rc7j', 'rc28j', 'pfeu', 'r_insoluble', 'so3', 'chlorure', 'c3a', 'ajout_percent'].includes(mappedHeader)) {
            newRow[mappedHeader] = parseFloat(row[index]) || 0;
          } else {
            newRow[mappedHeader] = row[index];
          }
        }
      });
      
      // Ensure required fields have values
      if (!newRow.num_ech) newRow.num_ech = `IMP-${Date.now() + i}`;
      if (!newRow.date) newRow.date = new Date().toISOString().split('T')[0];
      
      newData.push(newRow);
    }
    
    // Add the new data to the existing table
    setTableData(prevData => [...prevData, ...newData]);
  };

  // Export data handler
  const handleExport = () => {
    if (tableData.length === 0) {
      setError("Aucune donnée à exporter.");
      return;
    }

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données Traitées");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "donnees_traitees.xlsx");
    
    setSuccess('Données exportées avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Print data handler
  const handlePrint = () => {
    window.print();
  };

  // Edit a data row
  const handleEdit = (id, field, value) => {
    setTableData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Save changes
  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('excelData', JSON.stringify(tableData));
    
    setSuccess('Modifications sauvegardées avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Delete selected rows
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

  // Clear all data
  const handleClearAll = () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données? Cette action est irréversible.")) {
      return;
    }

    setTableData([]);
    localStorage.removeItem('excelData');
    setSelectedRows([]);
    setSuccess('Toutes les données ont été supprimées avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Toggle row selection
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  // Toggle select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === tableData.length && tableData.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map(item => item.id));
    }
  };

  // Generate mock chart data
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

  // Calculate statistics
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
      
      {/* Alert messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Tab navigation */}
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

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'donnees' && (
          <div>
            {/* Selections only in Données Traitées tab */}
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
                      value='developpement'
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

            {/* Data actions */}
            <div className="actions-bar">
              <div className="file-actions">
                <label htmlFor="file-import" className="action-btn import-btn">
                  <i className="fas fa-file-import"></i> Importer Excel
                </label>
                <input
                  id="file-import"
                  type="file"
                  accept=".xlsx,.xls"
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
                <button 
                  className="action-btn clear-btn" 
                  onClick={handleClearAll}
                  disabled={tableData.length === 0}
                >
                  <i className="fas fa-broom"></i> Tout effacer
                </button>
              </div>
            </div>

            {/* Data table */}
            <h3>📄 Tableau des Résultats ({tableData.length} lignes)</h3>
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
            
            {/* Chart controls */}
            <div className="chart-controls">
              <div className="chart-input">
                <label htmlFor="parameter">Paramètre:</label>
                <select
                  id="parameter"
                  value={selectedParameter}
                  onChange={e => setSelectedParameter(e.target.value)}
                >
                  {parameters.map(param => (
                    <option key={param.id} value={param.id}>{param.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Class selection with radio buttons */}
              <div className="chart-input">
                <label >Classe:</label>
                <div className="radio-groups-container">
                  {Object.entries(classOptions).map(([type, classes]) => (
                    <div key={type} className="radio-group">
                      
                      <div className="radio-options">
                        {classes.map((className) => (
                          <div key={className} className="radio-item">
                            <input
                              type="radio"
                              id={className}
                              name="cementClass"
                              value={className}
                              checked={selectedClass === className}
                              onChange={() => setSelectedClass(className)}
                              className="radio-input"
                            />
                            <label htmlFor={className} className="radio-label">
                              {className}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {chartData && chartStats ? (
              <div className="charts-container">
                {/* Bar chart */}
                <div className="chart">
                  <h4>Résistance à la Compression (MPa) - {selectedParameter.toUpperCase()}</h4>
                  <div className="chart-bars">
                    {chartData[selectedParameter].map((value, index) => (
                      <div key={index} className="bar-container">
                        <div className="bar-label">Éch {index + 1}</div>
                        <div className="bar-group">
                          <div 
                            className="bar"
                            style={{ height: `${value * 2}px` }}
                            title={`${selectedParameter.toUpperCase()}: ${value} MPa`}
                          ></div>
                        </div>
                        <div className="bar-value">{value} MPa</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="chart-stats">
                  <h4>Résistance courante {selectedParameter.toUpperCase()} - Classe {selectedClass}</h4>
                  
                  {chartStats ? (
                    <div className="stats-grid">
                      <div className="stats-column">
                        <h5>Classe</h5>
                        <div className="class-types">
                          <div>32.5L ● 42.5L ● 52.5L</div>
                          <div>32.5N ● 42.5N● 52.5N</div>
                          <div>32.5R ● 42.5R ● 52.5R</div>
                        </div>
                      </div>
                      
                      <div className="stats-column">
                        <h5>Limite inférieure</h5>
                        <div>{selectedClass} &lt;= {chartStats.limiteInf} MPa : {chartStats.countBelowInf} ({chartStats.percentBelowInf}%)</div>
                        
                        <h5>Limite supérieure</h5>
                        <div>{selectedClass} &gt;= {chartStats.limiteSup} MPa : {chartStats.countAboveSup} ({chartStats.percentAboveSup}%)</div>
                        
                        <h5>Limite garantie</h5>
                        <div>{selectedClass} &lt;= {chartStats.limiteGarantie} MPa : {chartStats.countBelowGarantie} ({chartStats.percentBelowGarantie}%)</div>
                      </div>
                      
                      <div className="stats-column">
                        <h5>Moyenne</h5>
                        <div className="average-value">{chartStats.moyenne} MPa</div>
                      </div>
                    </div>
                  ) : (
                    <p>Calcul des statistiques en cours...</p>
                  )}
                  
                  <div className="sample-count">
                    <strong>{chartStats ? chartStats.count : 0} : 1</strong>
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