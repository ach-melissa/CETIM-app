import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./TraitDonnes.css";

import DonneesTraitees from "../components/DonneesTraitees/DonneesTraitees";
import DonneesStatistiques from "../components/DonneesStatistiques/DonneesStatistiques";
import DonneesGraphiques from "../components/DonneesGraphiques/DonneesGraphiques";

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

  // Mock types data
  const typeFactices = [
    { id: 1, nom: 'CEM I', description: 'Ciment Portland' },
    { id: 2, nom: 'CEM II', description: 'Ciment Portland avec ajoute' },
    { id: 3, nom: 'CEM III', description: 'Ciment de haut fourneau' },
    { id: 4, nom: 'CEM IV', description: 'Ciment pouzzolanique' },
    { id: 5, nom: 'CEM V', description: 'Ciment composé' }
  ];

  // Mock products data
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

  // Load clients list
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/clients')
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

    // Mock data for demonstration
    const donneesFactices = [
      { id: 1, num_ech: 'ECH001', date: '2023-01-15', rc2j: 15.2, rc7j: 28.5, rc28j: 42.3, prise: '2:15', stabilite: '0.5', hydratation: '250', pfeu: 2.1, r_insoluble: 0.8, so3: 3.2, chlorure: 0.05, c3a: 8.5, ajout_percent: 15, type_ajout: 'Laitier' },
      { id: 2, num_ech: 'ECH002', date: '2023-01-16', rc2j: 16.8, rc7j: 30.1, rc28j: 45.2, prise: '2:10', stabilite: '0.4', hydratation: '255', pfeu: 2.0, r_insoluble: 0.7, so3: 3.1, chlorure: 0.04, c3a: 8.2, ajout_percent: 16, type_ajout: 'Laitier' },
      { id: 3, num_ech: 'ECH003', date: '2023-01-17', rc2j: 14.5, rc7j: 27.8, rc28j: 40.9, prise: '2:20', stabilite: '0.6', hydratation: '248', pfeu: 2.2, r_insoluble: 0.9, so3: 3.3, chlorure: 0.06, c3a: 8.7, ajout_percent: 14, type_ajout: 'Laitier' },
    ];
    
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
      isResistance: ['rc2j', 'rc7j', 'rc28j'].includes(selectedParameter)
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données? Cette action is irréversible.")) {
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

  return (
    <div className="trait-donnees-container">
      
      
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
          <DonneesTraitees
            tableData={tableData} 
            clients={clients}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            loading={loading}
            typeFactices={typeFactices}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            produitsFiltres={produitsFiltres}
            selectedProduit={selectedProduit}
            handleProduitChange={handleProduitChange}
            produitDescription={produitDescription}
            phase={phase}
            setPhase={setPhase}
            selectedRows={selectedRows}
            toggleRowSelection={toggleRowSelection}
            toggleSelectAll={toggleSelectAll}
            handleEdit={handleEdit}
            handleFileImport={handleFileImport}
            handleExport={handleExport}
            handlePrint={handlePrint}
            handleSave={handleSave}
            handleDelete={handleDelete}
            handleClearAll={handleClearAll}
          />
        )}

        {activeTab === 'statistiques' && (
          <DonneesStatistiques
            tableData={tableData} 
            clients={clients}
            selectedClient={selectedClient}
            selectedProduit={selectedProduit}
            produits={produits}
            produitDescription={produitDescription}
            selectedType={selectedType}
            handleExport={handleExport}
            handlePrint={handlePrint}
            handleSave={handleSave}
          />
        )}

        {activeTab === 'graphiques' && (
          <DonneesGraphiques
            tableData={tableData} 
            parameters={parameters}
            selectedParameter={selectedParameter}
            setSelectedParameter={setSelectedParameter}
            classOptions={classOptions}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            chartStats={chartStats}
            handleExport={handleExport}
            handlePrint={handlePrint}
            handleSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

export default TraitDonnes;