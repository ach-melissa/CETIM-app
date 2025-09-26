// src/components/DonneesStatistiques/DonneesStatistiques.jsx
import React, { useState, useEffect } from "react";
import "./DonneesStatistiques.css";
import { useData } from "../../context/DataContext";

// ============================================================
// Utility functions
// ============================================================
const calculateStats = (data, key) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  const totalSamples = data.length; // nbr total d'échantillons (filtered table size)

  if (!values.length) {
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  const count = values.length;
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);

  // ✅ mean divided by total number of samples, not just valid ones
  const mean = (values.reduce((a, b) => a + b, 0) / totalSamples).toFixed(2);

  // std still based on valid results
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance).toFixed(2);

  return { count, min, max, mean, std };
};

const evaluateLimits = (data, key, li, ls, lg) => {
  const values = data.map((row) => parseFloat(row[key])).filter((v) => !isNaN(v));
  if (!values.length) {
    return { belowLI: "-", aboveLS: "-", belowLG: "-", percentLI: "-", percentLS: "-", percentLG: "-" };
  }

  const liNum = li !== "-" ? parseFloat(li) : null;
  const lsNum = ls !== "-" ? parseFloat(ls) : null;
  const lgNum = lg !== "-" ? parseFloat(lg) : null;

  const belowLI = liNum ? values.filter((v) => v < liNum).length : 0;
  const aboveLS = lsNum ? values.filter((v) => v > lsNum).length : 0;
  const belowLG = lgNum ? values.filter((v) => v < lgNum).length : 0;
  const total = values.length;

  return {
    belowLI: belowLI || "-",
    aboveLS: aboveLS || "-",
    belowLG: belowLG || "-",
    percentLI: total && belowLI ? ((belowLI / total) * 100).toFixed(1) : "-",
    percentLS: total && aboveLS ? ((aboveLS / total) * 100).toFixed(1) : "-",
    percentLG: total && belowLG ? ((belowLG / total) * 100).toFixed(1) : "-",
  };
};

// ============================================================
// Export Modal Component
// ============================================================
const ExportModal = ({ isOpen, onClose, onExport, tables }) => {
  const [selectedTables, setSelectedTables] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Select all tables by default
      setSelectedTables(tables.map(table => table.id));
    }
  }, [isOpen, tables]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTables(tables.map(table => table.id));
    } else {
      setSelectedTables([]);
    }
  };

  const handleTableToggle = (tableId, checked) => {
    if (checked) {
      setSelectedTables(prev => [...prev, tableId]);
    } else {
      setSelectedTables(prev => prev.filter(id => id !== tableId));
    }
  };

  const handleExport = () => {
    onExport(selectedTables);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Exporter les tables</h3>
        <p>Sélectionnez les tables à exporter vers Word:</p>
        
        <div className="table-selection">
          <label className="select-all-label">
            <input
              type="checkbox"
              checked={selectedTables.length === tables.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            Sélectionner toutes les tables
          </label>
          
          <div className="table-list">
            {tables.map((table) => (
              <label key={table.id} className="table-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTables.includes(table.id)}
                  onChange={(e) => handleTableToggle(table.id, e.target.checked)}
                />
                {table.name}
              </label>
            ))}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button 
            className="btn-export" 
            onClick={handleExport}
            disabled={selectedTables.length === 0}
          >
            Exporter vers Word
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Word Export Function
// ============================================================
const exportToWord = (tablesData, clientName, productDescription, selectedProductFamily, selectedProductType, filterPeriod, selectedTables) => {
  // Create a simple HTML content for Word
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Données Statistiques</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin: 0; color: #2c3e50; }
        .header h2 { font-size: 16px; margin: 5px 0; color: #34495e; }
        .info-section { margin-bottom: 20px; font-size: 12px; }
        .stats-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 10px; }
        .stats-table th, .stats-table td { border: 1px solid #000; padding: 4px 6px; text-align: center; }
        .stats-table th { background-color: #f0f0f0; font-weight: bold; }
        .stats-table td:first-child { text-align: left; font-weight: bold; background-color: #f8f8f8; }
        .class-section { margin-bottom: 30px; page-break-after: always; }
        .class-title { background-color: #2c3e50; color: white; padding: 8px; font-weight: bold; text-align: center; margin-bottom: 10px; }
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <div class="header">
        
        <h2>Données Statistiques</h2>
        <h1><strong>Client:</strong> ${clientName}</h1>
       
      </div>
      
      <div class="info-section">
        
        ${selectedProductFamily ? `<p><strong>Famille:</strong> ${selectedProductFamily}</p>` : ''}
        ${selectedProductType ? `<p><strong>Type:</strong> ${selectedProductType}</p>` : ''}
        <p><strong>Période:</strong> ${filterPeriod.start} à ${filterPeriod.end}</p>
      </div>
      
      ${tablesData.filter(table => selectedTables.includes(table.id)).map(table => table.content).join('')}
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `donnees_statistiques_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================
// DonneesStatistiques Component
// ============================================================
const DonneesStatistiques = ({ clientId, produitId, selectedType, produitDescription, clients = [], produits = [] }) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedProductFamily, setSelectedProductFamily] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const c3aProducts = ["CEM I-SR 0", "CEM I-SR 3", "CEM I-SR 5", "CEM IV/A-SR", "CEM IV/B-SR"];
  const ajoutProducts = [
    "CEM II/A-S", "CEM II/B-S", "CEM II/A-D", "CEM II/A-P", "CEM II/B-P",
    "CEM II/A-Q", "CEM II/B-Q", "CEM II/A-V", "CEM II/B-V",
    "CEM II/A-W", "CEM II/B-W", "CEM II/A-T", "CEM II/B-T",
    "CEM II/A-L", "CEM II/B-L", "CEM II/A-LL", "CEM II/B-LL",
    "CEM II/A-M", "CEM II/B-M"
  ];

  // Get the selected product type and family
  useEffect(() => {
    if (produitId && produits.length) {
      const product = produits.find(p => p.id == produitId);
      if (product) {
        setSelectedProductType(product.type_code || "");
        setSelectedProductFamily(product.famille_code || "");
      }
    }
  }, [produitId, produits]);

  // Charger les données depuis le fichier JSON
  useEffect(() => {
    const fetchMockDetails = async () => {
      try {
        const response = await fetch("/Data/parnorm.json");
        if (!response.ok) throw new Error("Erreur lors du chargement des données");
        const data = await response.json();
        setMockDetails(data);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
        setMockDetails({});
      } finally {
        setLoading(false);
      }
    };
    fetchMockDetails();
  }, []);

  // Map front-end keys -> JSON keys
  const keyMapping = {
    rc2j: "resistance_2j",
    rc7j: "resistance_7j",
    rc28j: "resistance_28j",
    prise: "temps_debut_prise",
    stabilite: "stabilite",
    hydratation: "chaleur_hydratation",
    pfeu: "pert_au_feu",
    r_insoluble: "residu_insoluble",
    so3: "SO3",
    chlorure: "teneur_chlour",
    ajt : "ajout",
    c3a: "C3A",
  };

  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !mockDetails[mockKey]) return { li: "-", ls: "-", lg: "-" };

    // Navigate the nested structure: parameter -> family -> type -> classes
    const parameterData = mockDetails[mockKey];
    
    // If we have both family and type, try to find the exact match
    if (selectedProductFamily && selectedProductType && parameterData[selectedProductFamily]) {
      const familyData = parameterData[selectedProductFamily];
      
      if (familyData[selectedProductType]) {
        const typeData = familyData[selectedProductType];
        const found = typeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: found.limit_inf ?? "-",
            ls: found.limit_max ?? "-",
            lg: found.garantie ?? "-",
          };
        }
      }
    }
    
    // If exact match not found, try to find in the general family section
    if (selectedProductFamily && parameterData[selectedProductFamily]) {
      const familyData = parameterData[selectedProductFamily];
      
      // Look for a general type (like "CEM I" without specific subtype)
      if (familyData[selectedProductFamily]) {
        const generalTypeData = familyData[selectedProductFamily];
        const found = generalTypeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: found.limit_inf ?? "-",
            ls: found.limit_max ?? "-",
            lg: found.garantie ?? "-",
          };
        }
      }
      
      // If still not found, try any type in the family
      for (const typeKey in familyData) {
        const typeData = familyData[typeKey];
        const found = typeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: found.limit_inf ?? "-",
            ls: found.limit_max ?? "-",
            lg: found.garantie ?? "-",
          };
        }
      }
    }
    
    // If still not found, try any family and type
    for (const familyKey in parameterData) {
      const familyData = parameterData[familyKey];
      for (const typeKey in familyData) {
        const typeData = familyData[typeKey];
        const found = typeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: found.limit_inf ?? "-",
            ls: found.limit_max ?? "-",
            lg: found.garantie ?? "-",
          };
        }
      }
    }
    
     if (key === "c3a") {
    if (parameterData[selectedProductFamily]?.[selectedProductType]) {
      const found = parameterData[selectedProductFamily][selectedProductType].find(item => item.classe === classe);
      if (found) return { li: found.limit_inf ?? "-", ls: found.limit_max ?? "-", lg: found.garantie ?? "-" };
    }
  } else if (key === "ajt") {
    // Ajout is simpler, keyed by product type directly
    if (parameterData[selectedProductType]) {
      return {
        li: parameterData[selectedProductType].limitInf ?? "-",
        ls: parameterData[selectedProductType].limitSup ?? "-",
        lg: "-"
      };
    }
  }

    // Default fallback
    return { li: "-", ls: "-", lg: "-" };
  };

  const dataToUse = filteredTableData || [];

  if (loading) return <p className="no-data">Chargement des données de référence...</p>;
  if (!dataToUse.length) return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

  // Default parameters
  let parameters = [
    { key: "rc2j", label: "RC2J" },
    { key: "rc7j", label: "RC7J" },
    { key: "rc28j", label: "RC28J" },
    { key: "prise", label: "Prise" },
    { key: "stabilite", label: "Stabilité" },
    { key: "hydratation", label: "Hydratation" },
    { key: "pfeu", label: "P. Feu" },
    { key: "r_insoluble", label: "R. Insoluble" },
    { key: "so3", label: "SO3" },
    { key: "chlorure", label: "Chlorure" },
  ];

  if (selectedType === 1) {
    // Add C3A if selected product is in c3aProducts
    if (c3aProducts.includes(selectedProductType)) {
      parameters.push({ key: "c3a", label: "C3A" });
    }

    // Add Ajout if selected product is in ajoutProducts
    if (ajoutProducts.includes(selectedProductType)) {
      parameters.push({ key: "ajt", label: "Ajout" });
    }
  }

  const allStats = parameters.reduce((acc, param) => {
    acc[param.key] = calculateStats(dataToUse, param.key);
    return acc;
  }, {});

  const statRows = [
    { key: "count", label: "Nombre" },
    { key: "min", label: "Min" },
    { key: "max", label: "Max" },
    { key: "mean", label: "Moyenne" },
    { key: "std", label: "Écart type" },
  ];

  const classes = ["32.5 L" , "32.5 N", "32.5 R","42.5 L" , "42.5 N", "42.5 R" , "52.5 L" , "52.5 N", "52.5 R"];

  const renderClassSection = (classe) => (
    <div className="class-section" key={classe}>
      <h4>CLASSE {classe}</h4>
      <table className="stats-table">
        <tbody>
          <tr>
            <td>Limite inférieure (LI)</td>
            {parameters.map((param) => <td key={param.key}>{getLimitsByClass(classe, param.key).li}</td>)}
          </tr>
          <tr>
            <td>N &lt; LI</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).belowLI}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LI</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).percentLI}</td>;
            })}
          </tr>
          <tr>
            <td>Limite supérieure (LS)</td>
            {parameters.map((param) => <td key={param.key}>{getLimitsByClass(classe, param.key).ls}</td>)}
          </tr>
          <tr>
            <td>N &gt; LS</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).aboveLS}</td>;
            })}
          </tr>
          <tr>
            <td>% &gt; LS</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).percentLS}</td>;
            })}
          </tr>
          <tr>
            <td>Limite garantie (LG)</td>
            {parameters.map((param) => <td key={param.key}>{getLimitsByClass(classe, param.key).lg}</td>)}
          </tr>
          <tr>
            <td>N &lt; LG</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).belowLG}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LG</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).percentLG}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Prepare tables data for export
  const prepareTablesForExport = () => {
    const tables = [];
    
    // Global stats table
    const globalStatsContent = `
      <div class="class-section">
        <div class="class-title">STATISTIQUES GLOBALES</div>
        <table class="stats-table">
          <thead>
            <tr>
              <th>Statistique</th>
              ${parameters.map((param) => `<th>${param.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${statRows.map((row) => `
              <tr>
                <td>${row.label}</td>
                ${parameters.map((param) => `<td>${allStats[param.key][row.key]}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    tables.push({ id: 'global', name: 'Statistiques Globales', content: globalStatsContent });
    
    // Class tables
    classes.forEach((classe, index) => {
      const classContent = `
        <div class="class-section">
          <div class="class-title">CLASSE ${classe}</div>
          <table class="stats-table">
            <tbody>
              <tr>
                <td>Limite inférieure (LI)</td>
                ${parameters.map((param) => `<td>${getLimitsByClass(classe, param.key).li}</td>`).join('')}
              </tr>
              <tr>
                <td>N &lt; LI</td>
                ${parameters.map((param) => {
                  const limits = getLimitsByClass(classe, param.key);
                  return `<td>${evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).belowLI}</td>`;
                }).join('')}
              </tr>
              <tr>
                <td>% &lt; LI</td>
                ${parameters.map((param) => {
                  const limits = getLimitsByClass(classe, param.key);
                  return `<td>${evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).percentLI}</td>`;
                }).join('')}
              </tr>
              <tr>
                <td>Limite supérieure (LS)</td>
                ${parameters.map((param) => `<td>${getLimitsByClass(classe, param.key).ls}</td>`).join('')}
              </tr>
              <tr>
                <td>N &gt; LS</td>
                ${parameters.map((param) => {
                  const limits = getLimitsByClass(classe, param.key);
                  return `<td>${evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).aboveLS}</td>`;
                }).join('')}
              </tr>
              <tr>
                <td>% &gt; LS</td>
                ${parameters.map((param) => {
                  const limits = getLimitsByClass(classe, param.key);
                  return `<td>${evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).percentLS}</td>`;
                }).join('')}
              </tr>
              <tr>
                <td>Limite garantie (LG)</td>
                ${parameters.map((param) => `<td>${getLimitsByClass(classe, param.key).lg}</td>`).join('')}
              </tr>
              <tr>
                <td>N &lt; LG</td>
                ${parameters.map((param) => {
                  const limits = getLimitsByClass(classe, param.key);
                  return `<td>${evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).belowLG}</td>`;
                }).join('')}
              </tr>
              <tr>
                <td>% &lt; LG</td>
                ${parameters.map((param) => {
                  const limits = getLimitsByClass(classe, param.key);
                  return `<td>${evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg).percentLG}</td>`;
                }).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      `;
      
      tables.push({ id: `class-${index}`, name: `CLASSE ${classe}`, content: classContent });
    });
    
    return tables;
  };

  const handleExport = (selectedTableIds) => {
    const clientName = clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client";
    const tablesData = prepareTablesForExport();
    exportToWord(tablesData, clientName, produitDescription, selectedProductFamily, selectedProductType, filterPeriod, selectedTableIds);
  };

  return (
    <div className="stats-section">
      
      <div style={{ marginBottom: "1rem" }}>
        {/* Export Button */}
        <button 
          className="export-btn action-btn"
          onClick={() => setExportModalOpen(true)}
          style={{ marginTop: '10px' }}
        >
          Exporter vers Word
        </button>
        <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
       
        <h2>Données Statistiques</h2>
        
        <p><strong>{produitDescription}</strong></p>
        {selectedProductFamily && <p><strong>Famille: {selectedProductFamily}</strong></p>}
        {selectedProductType && <p><strong>Type: {selectedProductType}</strong></p>}
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
        
      </div>

      {/* Global stats */}
      <table className="stats-table">
        <thead>
          <tr>
            <th>Statistique</th>
            {parameters.map((param) => <th key={param.key}>{param.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {statRows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              {parameters.map((param) => <td key={param.key}>{allStats[param.key][row.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Limits per class */}
      {classes.map((classe) => renderClassSection(classe))}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        tables={prepareTablesForExport()}
      />
    </div>
  );
};

export default DonneesStatistiques;