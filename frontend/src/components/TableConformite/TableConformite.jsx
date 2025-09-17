 import React, { useState, useMemo } from 'react';
import './TableConformite.css';

  // Mock details
  const mockDetails = {
    // Mécanique
    resistance_2j: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "52.5 N", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "42.5 R", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-S", classe: "32.5 R", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: null, resistance_max: null, garantie: null },
    ],
    resistance_7j: [
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "32.5 L", resistance_min: "12.0", resistance_max: null, garantie: "10.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
    ],
    resistance_28j: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "52.5 N", resistance_min: "52.5", resistance_max: "72.5", garantie: "50.0" },
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "42.5 R", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-S", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-V", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "32.5 L", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "42.5 L", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM III", type_code: "CEM III/C", classe: "32.5 L", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/B", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM V", type_code: "CEM V/B", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
    ],

    // Physique
    temps_debut_prise: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "32.5 N", resistance_min: "75", resistance_max: null, garantie: "60" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "60", resistance_max: null, garantie: "50" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 R", resistance_min: "75", resistance_max: null, garantie: "60" },
    ],
    stabilite: [
      { famille_code: "ALL", type_code: "ALL", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: "10" },
    ],
    chaleur_hydratation: [
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: "300" },
    ],

    // Chimique
    SO3: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "32.5 N", resistance_min: null, resistance_max: "3.5", garantie: "4.0" },
    ],
    SO3_supp: [
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "32.5 N", resistance_min: null, resistance_max: "3.0", garantie: "3.0" },
    ],
    C3A: [
      { famille_code: "CEM I", type_code: "CEM I-SR0", classe: "Tous", resistance_min: null, resistance_max: "0.0", garantie: "2.0" },
    ],
    pert_au_feu: [
      { famille_code: "CEM II", type_code: "CEM II/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: "4.5" },
    ],
    residu_insoluble: [
      { famille_code: "CEM II", type_code: "CEM II/B", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: "4.5" },
    ],
    teneur_chlour: [
      { famille_code: "ALL", type_code: "ALL", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: "0.1" },
    ],
    pouzzolanicite: [
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: "25", resistance_max: null, garantie: "20" },
    ],
    pouzzolanicite_supp: [
      { famille_code: "CEM IV", type_code: "CEM IV/B", classe: "SR", resistance_min: "25", resistance_max: null, garantie: "20" },
    ],
  };

// Utility function to calculate stats
const calculateStats = (data, key) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) {
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  const count = values.length;
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);
  const mean = (values.reduce((a, b) => a + b, 0) / count).toFixed(2);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance).toFixed(2);

  return { count, min, max, mean, std };
};

// Count how many values are < LI, > LS, < LG
const evaluateLimits = (data, key, li, ls, lg) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return { 
    belowLI: "-", 
    aboveLS: "-", 
    belowLG: "-", 
    percentLI: "-", 
    percentLS: "-", 
    percentLG: "-" 
  };

  const belowLI = li && li !== "-" && li !== "" ? values.filter((v) => v < parseFloat(li)).length : 0;
  const aboveLS = ls && ls !== "-" && ls !== "" ? values.filter((v) => v > parseFloat(ls)).length : 0;
  const belowLG = lg && lg !== "-" && lg !== "" ? values.filter((v) => v < parseFloat(lg)).length : 0;

  const total = values.length;
  return {
    belowLI: belowLI > 0 ? belowLI : "-",
    aboveLS: aboveLS > 0 ? aboveLS : "-",
    belowLG: belowLG > 0 ? belowLG : "-",
    percentLI: total > 0 && belowLI > 0 ? ((belowLI / total) * 100).toFixed(1)   : "-",
    percentLS: total > 0 && aboveLS > 0 ? ((aboveLS / total) * 100).toFixed(1)  : "-",
    percentLG: total > 0 && belowLG > 0 ? ((belowLG / total) * 100).toFixed(1)  : "-"
  };
};

// Helper function to get limits from mockDetails
const getLimitsByClass = (classe, key) => {
  // Map parameter keys to mockDetails keys
  const keyMapping = {
    "rc2j": "resistance_2j",
    "rc7j": "resistance_7j",
    "rc28j": "resistance_28j",
    "prise": "temps_debut_prise",
    "stabilite": "stabilite",
    "hydratation": "chaleur_hydratation",
    "so3": "SO3",
    "c3a": "C3A",
    "pfeu": "pert_au_feu",
    "r_insoluble": "residu_insoluble",
    "chlorure": "teneur_chlour",
    "ajout_percent": "" // No specific limits for this parameter
  };

  const mockKey = keyMapping[key];
  if (!mockKey || !mockDetails[mockKey]) return { li: "-", ls: "-", lg: "-" };

  // First try to find exact class match
  let found = mockDetails[mockKey].find(item => item.classe === classe);
  
  // If not found, try to find "Tous" (all classes)
  if (!found) {
    found = mockDetails[mockKey].find(item => item.classe === "Tous");
  }
  
  // If still not found, try to find any class that might be relevant
  if (!found && mockDetails[mockKey].length > 0) {
    found = mockDetails[mockKey][0];
  }

  return {
    li: found?.resistance_min ?? "-",
    ls: found?.resistance_max ?? "-",
    lg: found?.garantie ?? "-",
  };
};


const TableConformite = ({   
  clients,
  selectedClient,
  selectedProduit,
  produits,
  produitDescription,
  selectedType,
  tableData,
  handleExport,
  handlePrint,
  handleSave,
  onBack }) => {

  // List of all parameters we want to analyze
  const parameters = [
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

  if (selectedType === "1") {
    parameters.push({ key: "c3a", label: "C3A" });
  } else {
    parameters.push({ key: "ajout_percent", label: "Ajout (%)" });
  }

  // List of all classes to display
  const classes = ["32.5L", "32.5N", "32.5R", "42.5L", "42.5N", "42.5R", "52.5L", "52.5N", "52.5R"];

  // Function to determine cell color based on deviation/defect percentage
  const getCellColor = (deviationPercent, defectPercent) => {
    if (deviationPercent === "-" || defectPercent === "-") return "grey";
    if (parseFloat(defectPercent) > 5) return "red";
    if (parseFloat(deviationPercent) > 5) return "yellow";
    return "green";
  };

  return (
    <div className="cement-table-page">
      <div className="cement-table-container">
        <p><strong>{clients.find(c => c.id == selectedClient)?.nom_raison_sociale || 'Aucun'}</strong></p>    
        <h2>Données Statistiques</h2>
        <h3>{selectedProduit && ` ${produits.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>
       
        <table>
          <thead>
            <tr>
              <th>Paramètre</th>
              {parameters.map(param => (
                <th key={param.key}>{param.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* For each class, create multiple rows */}
{classes.map(classe => (
  <>
    {/* Class name row */}
    <tr key={`${classe}-name`}>
      <td>{classe}</td>
      {parameters.map(param => {
        const limits = getLimitsByClass(classe, param.key);
        const evaluation = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
        const cellColor = getCellColor(evaluation.percentLS, evaluation.percentLG);
        return <td key={param.key} className={cellColor}></td>;
      })}
    </tr>
    
    {/* Deviation percentage row */}
    <tr key={`${classe}-deviation`}>
      <td>Déviations %</td>
      {parameters.map(param => {
        const limits = getLimitsByClass(classe, param.key);
        const evaluation = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
        const cellColor = getCellColor(evaluation.percentLS, evaluation.percentLG);
        return (
          <td key={param.key} className={cellColor}>
            {evaluation.percentLS !== "-" ? `${evaluation.percentLS}%` : "-"}
          </td>
        );
      })}
    </tr>
    
    {/* Defect percentage row */}
    <tr key={`${classe}-defect`}>
      <td>Défauts %</td>
      {parameters.map(param => {
        const limits = getLimitsByClass(classe, param.key);
        const evaluation = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
        const cellColor = getCellColor(evaluation.percentLS, evaluation.percentLG);
        return (
          <td key={param.key} className={cellColor}>
            {evaluation.percentLG !== "-" ? `${evaluation.percentLG}%` : "-"}
          </td>
        );
      })}
    </tr>
    
    {/* Statistical control row */}
    <tr key={`${classe}-control`}>
      <td>Contrôle Statistique</td>
      {parameters.map(param => {
        const limits = getLimitsByClass(classe, param.key);
        const evaluation = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
        const cellColor = getCellColor(evaluation.percentLS, evaluation.percentLG);
        return <td key={param.key} className={cellColor}></td>;
      })}
    </tr>
  </>
))}
          </tbody>
        </table>

        <div className="legend">
          <p>
            <span className="green-box"></span> % Déviation/Défaut ≤ 5%
          </p>
          <p>
            <span className="yellow-box"></span> % Déviation &gt; 5%
          </p>
          <p>
            <span className="red-box"></span> % Défaut &gt; 5%
          </p>
          <p>
            <span className="grey-box"></span> ND/NS Données non disponibles /
            Insuffisantes
          </p>
        </div>
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

        <div className="back-button-container">
            <button onClick={onBack}>← Retour aux Graphiques</button>
        </div>
      </div>
    </div>
  );
};

export default TableConformite;