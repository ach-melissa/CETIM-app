import React, { useState, useEffect } from 'react';
import Header from '../../header/Header';
import * as XLSX from 'xlsx';
import './TraitDonnes.css';

const TraitDonnes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [produits, setProduits] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState('');
  const [produitDescription, setProduitDescription] = useState('');
  const [selectedType, setSelectedType] = useState("");
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

  // Mock types data (was missing)
  const typeFactices = [
    { id: 1, nom: 'CEM I', description: 'Ciment Portland' },
    { id: 2, nom: 'CEM II', description: 'Ciment Portland avec ajoute' },
    { id: 3, nom: 'CEM III', description: 'Ciment de haut fourneau' },
    { id: 4, nom: 'CEM IV', description: 'Ciment pouzzolanique' },
    { id: 5, nom: 'CEM V', description: 'Ciment composé' }
  ];

  // Mock products data (moved outside useEffect for reuse)
  const produitsFactices = [
    { id: 1, typeId: 1, nom: 'CEM I', description: 'Ciment Portland' },
    { id: 2, typeId: 2, nom: 'CEM II/A-S', description: 'Ciment Portland au laitier' },
    { id: 3, typeId: 2, nom: 'CEM II/B-S', description: 'Ciment Portland au laitier' },
    { id: 4, typeId: 2, nom: 'CEM II/A-D', description: 'Ciment Portland a la fumée de silice' },
    { id: 5, typeId: 2, nom: 'CEM II/A-P', description: 'Ciment Portland a la pouzzolane' },
    { id: 6, typeId: 2, nom: 'CEM II/B-P', description: 'Ciment Portland a la pouzzolane' },
    { id: 7, typeId: 2, nom: 'CEM II/A-Q', description: 'Ciment Portland a la pouzzolane' },
    { id: 8, typeId: 2, nom: 'CEM II/B-Q', description: 'Ciment Portland a la pouzzolane' },
    { id: 9, typeId: 2, nom: 'CEM II/A-V', description: 'Ciment Portland aux cendres volantes' },
    { id: 10, typeId: 2, nom: 'CEM II/B-V', description: 'Ciment Portland aux cendres volantes' },
    { id: 11, typeId: 2, nom: 'CEM II/A-W', description: 'Ciment Portland aux cendres volantes' },
    { id: 12, typeId: 2, nom: 'CEM II/B-W', description: 'Ciment Portland aux cendres volantes' },
    { id: 13, typeId: 2, nom: 'CEM II/A-T', description: 'Ciment Portland au schiste calciné' },
    { id: 14, typeId: 2, nom: 'CEM II/B-T', description: 'Ciment Portland au schiste calciné' },
    { id: 15, typeId: 2, nom: 'CEM II/A-L', description: 'Ciment Portland au calcaire' },
    { id: 16, typeId: 2, nom: 'CEM II/B-L', description: 'Ciment Portland au calcaire' },
    { id: 17, typeId: 2, nom: 'CEM II/A-LL', description: 'Ciment Portland au calcaire' },
    { id: 18, typeId: 2, nom: 'CEM II/B-LL', description: 'Ciment Portland au calcaire' },
    { id: 19, typeId: 2, nom: 'CEM II/A-M', description: 'Ciment Portland composé' },
    { id: 20, typeId: 2, nom: 'CEM II/B-M', description: 'Ciment Portland composé' },
    { id: 21, typeId: 3, nom: 'CEM III/A', description: 'Ciment de haut fourneau' },
    { id: 22, typeId: 3, nom: 'CEM III/B', description: 'Ciment de haut fourneau' },
    { id: 23, typeId: 3, nom: 'CEM III/C', description: 'Ciment de haut fourneau' },
    { id: 24, typeId: 4, nom: 'CEM IV/A', description: 'Ciment pouzzolanique' },
    { id: 25, typeId: 4, nom: 'CEM IV/B', description: 'Ciment pouzzolanique' },
    { id: 26, typeId: 5, nom: 'CEM V/A', description: 'Ciment composé' },
    { id: 27, typeId: 5, nom: 'CEM V/B', description: 'Ciment composé' },
  ];

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

    // Use the mock products data
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

  // Filter products based on selected type
  const produitsFiltres = produits.filter(
    (produit) => produit.typeId === Number(selectedType)
  );

  // Handle product selection
  const handleProduitChange = (e) => {
    const produitId = Number(e.target.value);
    setSelectedProduit(produitId);

    const produit = produits.find((p) => p.id === produitId);
    setProduitDescription(produit ? produit.description : "");
  };

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



    setTableData(donneesFactices);
  }, [selectedClient, selectedProduit, phase, tableData.length]);

  // Calculate statistics for charts
  useEffect(() => {
    if (tableData.length === 0 || !selectedParameter) {
      setChartStats(null);
      return;
    }

    // Filter data based on selected parameter
    const values = tableData.map(item => item[selectedParameter])
      .filter(val => val !== undefined && val !== null && !isNaN(val));
    
    if (values.length === 0) {
      setChartStats(null);
      return;
    }

    // Calculate basic statistics for all parameters
    const numericValues = values.map(val => typeof val === 'string' ? parseFloat(val) : val);
    const moyenne = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    
    // Only calculate class-based limits for resistance parameters
    let stats = {
      moyenne: moyenne.toFixed(3),
      min: min.toFixed(2),
      max: max.toFixed(2),
      count: numericValues.length,
    };
    
    // Add class-based statistics only for resistance parameters
    if (stats.isResistance) {
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
        // Add cases for R and L classes if needed
        default:
          limiteInf = 20.0;
          limiteSup = 62.5;
          limiteGarantie = 42.5;
      }
      
      // Count values outside limits
      const countBelowInf = numericValues.filter(v => v < limiteInf).length;
      const countAboveSup = numericValues.filter(v => v > limiteSup).length;
      const countBelowGarantie = numericValues.filter(v => v < limiteGarantie).length;
      
      const percentBelowInf = (countBelowInf / numericValues.length * 100).toFixed(1);
      const percentAboveSup = (countAboveSup / numericValues.length * 100).toFixed(1);
      const percentBelowGarantie = (countBelowGarantie / numericValues.length * 100).toFixed(1);

      // Add resistance-specific stats
      stats = {
        ...stats,
        limiteInf,
        limiteSup,
        limiteGarantie,
        countBelowInf,
        countAboveSup,
        countBelowGarantie,
        percentBelowInf,
        percentAboveSup,
        percentBelowGarantie
      };
    }
    
    setChartStats(stats);
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
    values: tableData.map(item => item[selectedParameter] || 0),
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
      
{/*       Alert messages 
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
*/}
      {/* Tab navigation */}
      <div className="tabs-container">
        <button 
          className={activeTab === 'donnees' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('donnees')}
        >
           Données Traitées
        </button>
        <button 
          className={activeTab === 'statistiques' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('statistiques')}
        >
          Données Statistiques
        </button>
        <button 
          className={activeTab === 'graphiques' ? 'active-tab' : 'tab'}
          onClick={() => setActiveTab('graphiques')}
        >
           Graphiques
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
        <label htmlFor="type">Type (CEM):</label>
        <select
          id="type"
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedProduit(""); // reset produit
            setProduitDescription("");
          }}
        >
          <option value="">-- Choisir type --</option>
          {typeFactices.map((type) => (
            <option key={type.id} value={type.id}>
              {type.nom}
            </option>
          ))}
        </select>

        <label htmlFor="produit">Produit:</label>
        <select
          id="produit"
          value={selectedProduit}
          onChange={handleProduitChange}
          disabled={!selectedType}
        >
          <option value="">-- Choisir produit --</option>
          {produitsFiltres.map((produit) => (
            <option key={produit.id} value={produit.id}>
              {produit.nom}
            </option>
          ))}
        </select>

{/*     {produitDescription && (
          <div className="produit-description">
            <strong>Description:</strong> {produitDescription}
          </div>
        )}
*/}      
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
        </div>
        <div className="radio-group">
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

{/* Data table        " to calculate combien d'echantillon {tableData.length} lignes  */}
    <h1></h1>
    <h2>Données à traiter</h2>
    <h2>Périod du ...... au ...........</h2>
    <h3> {selectedProduit && ` ${produits.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>
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
          <th>Ech</th>
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
          {/* Show C3A column only for CEM I */}
          {selectedType && selectedType === "1" && (
            <th>C3A</th>
          )}
          {/* Show additional columns only for CEM II, III, IV, V */}
          {selectedType && selectedType !== "1" && (
            <>
              <th>Ajout(Type Ajout) %</th>
            </>
          )}
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
    <td>
      <input
        type="text"
        value={row.prise || ''}
        onChange={(e) => handleEdit(row.id, 'prise', e.target.value)}
        className="editable-cell"
      />
    </td>
    <td>
      <input
        type="text"
        value={row.stabilite || ''}
        onChange={(e) => handleEdit(row.id, 'stabilite', e.target.value)}
        className="editable-cell"
      />
    </td>
    <td>
      <input
        type="text"
        value={row.hydratation || ''}
        onChange={(e) => handleEdit(row.id, 'hydratation', e.target.value)}
        className="editable-cell"
      />
    </td>
    <td>
      <input
        type="number"
        value={row.pfeu || ''}
        onChange={(e) => handleEdit(row.id, 'pfeu', e.target.value)}
        className="editable-cell"
      />
    </td>
    <td>
      <input
        type="number"
        value={row.r_insoluble || ''}
        onChange={(e) => handleEdit(row.id, 'r_insoluble', e.target.value)}
        className="editable-cell"
      />
    </td>
    <td>
      <input
        type="number"
        value={row.so3 || ''}
        onChange={(e) => handleEdit(row.id, 'so3', e.target.value)}
        className="editable-cell"
      />
    </td>
    <td>
      <input
        type="number"
        value={row.chlorure || ''}
        onChange={(e) => handleEdit(row.id, 'chlorure', e.target.value)}
        className="editable-cell"
      />
    </td>
    {/* Show C3A column only for CEM I */}
    {selectedType && selectedType === "1" && (
      <td>
        <input
          type="number"
          value={row.c3a || ''}
          onChange={(e) => handleEdit(row.id, 'c3a', e.target.value)}
          className="editable-cell"
        />
      </td>
    )}
    {/* Show additional columns only for CEM II, III, IV, V */}
    {selectedType && selectedType !== "1" && (
      <>
        <td>
          <input
            type="number"
            value={row.ajout_percent || ''}
            onChange={(e) => handleEdit(row.id, 'ajout_percent', e.target.value)}
            className="editable-cell"
          />
        </td>
      </>
    )}
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

  </div>
)}
        

        {activeTab === 'statistiques' && (
          <div className="stats-section" >
            <p><strong>{clients.find(c => c.id == selectedClient)?.nom_raison_sociale || 'Aucun'}</strong></p>    
            <h2> Données Statistiques</h2>
            <h3> {selectedProduit && ` ${produits.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>
{stats ? (
  <div>
    <table className="stats-table">
      <thead>
        <tr>
          <th>Paramètre</th>
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
          {selectedType === "1" && <th>C3A</th>}
          {selectedType !== "1" && <th>Ajout %</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Nombre</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          {selectedType === "1" ? <td></td> : <td></td>}
        </tr>
        <tr>
          <td>Minimum</td>
          <td></td>
          <td></td>
          <td></td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          {selectedType === "1" ? <td></td> : <td></td>}
        </tr>
        <tr>
          <td>Maximum</td>
          <td></td>
          <td></td>
          <td></td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          {selectedType === "1" ? <td></td> : <td></td>}
        </tr>
        <tr>
          <td>Moyenne</td>
          <td></td>
          <td></td>
          <td></td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          {selectedType === "1" ? <td></td> : <td></td>}
        </tr>
        <tr>
          <td>Écart type</td>
          <td></td>
          <td></td>
          <td></td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          {selectedType === "1" ? <td></td> : <td></td>}
        </tr>


        <h4>CLASSE 32.5L</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
<h4>CLASSE 32.5N</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>


            
<h4>CLASSE 32.5R</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>


            
<h4>CLASSE 42.5L</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>

            
<h4>CLASSE 42.5N</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>

            
<h4>CLASSE 42.5R</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>

            
<h4>CLASSE 52.5L</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>

            
<h4>CLASSE 52.5N</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>


            
<h4>CLASSE 52.5R</h4> 
    <tr>
      <td>Limite inférieure (LI)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LI</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite supérieure (LS)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &gt; LS</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Limite garantie (LG)</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>N &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>% &lt; LG</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
      </tbody>
    </table>
  </div>
) : (
  <p className="no-data">
    Veuillez d'abord sélectionner un client, un produit et une phase.
  </p>
)}

                 {/* Data actions */}
            <div className="actions-bar">
              <div className="file-actions">

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
              </div>
            </div>
          </div>
          
        )}


        
{activeTab === 'graphiques' && (
        <div className="charts-section">
          {/* Chart controls */}
          <label htmlFor="parameter">Conformité de :</label>
          <select
            id="parameter"
            value={selectedParameter}
            onChange={e => setSelectedParameter(e.target.value)}
          >
            {parameters.map(param => (
              <option key={param.id} value={param.id}>{param.label}</option>
            ))}
          </select>

          <div className="chart-controls">
            <div className="chart-input">
              <p>Le Graphe :</p>
            </div>
            
 {/* Class selection - show for all parameters */}
<div className="chart-input">
  <label>Classe:</label>
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

            {/* Show statistics for all parameters */}
            {chartStats && (
              <div className="stats-display">
                <div className="stats-column">
                  <h5>Moyenne</h5>
                  <div className="average-value">{chartStats.moyenne}</div>
                  
                  <h5>Minimum</h5>
                  <div>{chartStats.min}</div>
                  
                  <h5>Maximum</h5>
                  <div>{chartStats.max}</div>
                  
                  <h5>Nombre d'échantillons</h5>
                  <div>{chartStats.count}</div>
                </div>
                
                {/* Show class-based statistics only for resistance parameters */}
                {chartStats.isResistance && (
                  <div className="stats-column">
                    <h5>Limite inférieure</h5>
                    <div>{selectedClass} &lt;= {chartStats.limiteInf} MPa : {chartStats.countBelowInf} ({chartStats.percentBelowInf}%)</div>
                    
                    <h5>Limite supérieure</h5>
                    <div>{selectedClass} &gt;= {chartStats.limiteSup} MPa : {chartStats.countAboveSup} ({chartStats.percentAboveSup}%)</div>
                    
                    <h5>Limite garantie</h5>
                    <div>{selectedClass} &lt;= {chartStats.limiteGarantie} MPa : {chartStats.countBelowGarantie} ({chartStats.percentBelowGarantie}%)</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Data actions */}
          <div className="actions-bar">
            <div className="file-actions">
              <button className="action-btn export-btn" onClick={handleExport} disabled={tableData.length === 0}>
                <i className="fas fa-file-export"></i> Exporter
              </button>
              <button className="action-btn print-btn" onClick={handlePrint} disabled={tableData.length === 0}>
                <i className="fas fa-print"></i> Imprimer
              </button>
              <button 
                className="action-btn save-btn" 
                onClick={handleSave}
                disabled={tableData.length === 0}
              >
                <i className="fas fa-save"></i> Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}


      </div>
    </div>
  );
};

export default TraitDonnes;