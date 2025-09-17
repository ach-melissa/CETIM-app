import React, { useState, useMemo } from 'react';
import './ControleConformite.css';

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

const ControleConformite = ({
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
  onBack
}) => {
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

  // Calculate all stats for all parameters
  const allStats = parameters.reduce((acc, param) => {
    acc[param.key] = calculateStats(tableData, param.key);
    return acc;
  }, {});

  // List of all classes to display
  const classes = ["32.5L", "32.5N", "32.5R", "42.5L", "42.5N", "42.5R", "52.5L", "52.5N", "52.5R"];

  // Function to render class section table
  const renderClassSection = (classe) => {
    // Calculate compliance for this specific class
    const classCompliance = {};
    parameters.forEach(param => {
      const limits = getLimitsByClass(classe, param.key);
      const stats = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
      classCompliance[param.key] = { limits, stats };
    });

    // Determine if this class is overall compliant
    const isClassConforme = parameters.every(param => {
      const compliance = classCompliance[param.key];
      return compliance.stats.belowLI === "-" && 
             compliance.stats.aboveLS === "-" && 
             compliance.stats.belowLG === "-";
    });

    return (
      <div className="class-section" key={classe}>
              <div className="report-header">
        <p><strong>{clients.find(c => c.id == selectedClient)?.nom_raison_sociale || 'Aucun'}</strong></p>    
        <h2>Contrôle de conformité / classe de résistance</h2>
        <h3>{selectedProduit && ` ${produits.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>
        <h3>Période du .../.../... au  ../../...</h3>
       
    <hr className="strong-hr" />
  <h3>CLASSE {classe}</h3>
  
  {/* Deviations Sections */}
  <div className="sections-horizontal">
    <div className="section-box">
      <h4>Déviations Limites inférieures</h4>
      <div className="parameter-list">
        <div className="parameter-item">
          <span>Résistance à court terme à 02 j (RC2J)</span>
          <span>{classCompliance.rc2j.stats.percentLI !== "-" 
            ? `${classCompliance.rc2j.stats.percentLI}% < ${classCompliance.rc2j.limits.li}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.rc2j.stats.percentLI}%</span>
        </div>
        <div className="parameter-item">
          <span>Résistance courante 28j (RC28J)</span>
          <span>{classCompliance.rc28j.stats.percentLI !== "-" 
            ? `${classCompliance.rc28j.stats.percentLI}% < ${classCompliance.rc28j.limits.li}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.rc28j.stats.percentLI}%</span>
        </div>
        <div className="parameter-item">
          <span>Temps de début de prise (Prise)</span>
          <span>{classCompliance.prise.stats.percentLI !== "-" 
            ? `${classCompliance.prise.stats.percentLI}% < ${classCompliance.prise.limits.li}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.prise.stats.percentLI}%</span>
        </div>
        <div className="parameter-item">
          <span>Ajout(e) (Calcaire)</span>
          <span>{classCompliance.ajout_percent.stats.percentLI !== "-" 
            ? `${classCompliance.ajout_percent.stats.percentLI}% < ${classCompliance.ajout_percent.limits.li}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.ajout_percent.stats.percentLI}%</span>
        </div>
      </div>
    </div>
  </div>
  
  <div className="sections-horizontal">
    <div className="section-box">
      <h4>Déviations Limites supérieures</h4>
      <div className="parameter-list">
        <div className="parameter-item">
          <span>Résistance courante 28j (RC28J)</span>
          <span>{classCompliance.rc28j.stats.percentLS !== "-" 
            ? `${classCompliance.rc28j.stats.percentLS}% > ${classCompliance.rc28j.limits.ls}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.rc28j.stats.percentLS}%</span>
        </div>
        <div className="parameter-item">
          <span>Stabilité (Stabilite)</span>
          <span>{classCompliance.stabilite.stats.percentLS !== "-" 
            ? `${classCompliance.stabilite.stats.percentLS}% > ${classCompliance.stabilite.limits.ls}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.stabilite.stats.percentLS}%</span>
        </div>
        <div className="parameter-item">
          <span>Sulfate (SO3)</span>
          <span>{classCompliance.so3.stats.percentLS !== "-" 
            ? `${classCompliance.so3.stats.percentLS}% > ${classCompliance.so3.limits.ls}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.so3.stats.percentLS}%</span>
        </div>
        <div className="parameter-item">
          <span>Chlorure (Chlorure)</span>
          <span>{classCompliance.chlorure.stats.percentLS !== "-" 
            ? `${classCompliance.chlorure.stats.percentLS}% > ${classCompliance.chlorure.limits.ls}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.chlorure.stats.percentLS}%</span>
        </div>
        <div className="parameter-item">
          <span>Ajout(e) (Calcaire)</span>
          <span>{classCompliance.ajout_percent.stats.percentLS !== "-" 
            ? `${classCompliance.ajout_percent.stats.percentLS}% > ${classCompliance.ajout_percent.limits.ls}` 
            : "Aucune déviation"}</span>
          <span>Déviation={classCompliance.ajout_percent.stats.percentLS}%</span>
        </div>
      </div>
    </div>
  </div>

  <div className="sections-horizontal">
    <div className="section-box">
      <h4>Défauts Limites garanties</h4>
      <div className="parameter-list">
        <div className="parameter-item">
          <span>Résistance à court terme à 02 j (RC2J)</span>
          <span>{classCompliance.rc2j.stats.percentLG !== "-" 
            ? `${classCompliance.rc2j.stats.percentLG}% < ${classCompliance.rc2j.limits.lg}` 
            : "Aucun défaut"}</span>
          <span>Défaut={classCompliance.rc2j.stats.percentLG}%</span>
        </div>
        <div className="parameter-item">
          <span>Résistance courante 28j (RC28J)</span>
          <span>{classCompliance.rc28j.stats.percentLG !== "-" 
            ? `${classCompliance.rc28j.stats.percentLG}% < ${classCompliance.rc28j.limits.lg}` 
            : "Aucun défaut"}</span>
          <span>Défaut={classCompliance.rc28j.stats.percentLG}%</span>
        </div>
        <div className="parameter-item">
          <span>Temps de début de prise (Prise)</span>
          <span>{classCompliance.prise.stats.percentLG !== "-" 
            ? `${classCompliance.prise.stats.percentLG}% < ${classCompliance.prise.limits.lg}` 
            : "Aucun défaut"}</span>
          <span>Défaut={classCompliance.prise.stats.percentLG}%</span>
        </div>
        <div className="parameter-item">
          <span>Stabilité (Stabilite)</span>
          <span>{classCompliance.stabilite.stats.percentLG !== "-" 
            ? `${classCompliance.stabilite.stats.percentLG}% > ${classCompliance.stabilite.limits.lg}` 
            : "Aucun défaut"}</span>
          <span>Défaut={classCompliance.stabilite.stats.percentLG}%</span>
        </div>
        <div className="parameter-item">
          <span>Sulfate (SO3)</span>
          <span>{classCompliance.so3.stats.percentLG !== "-" 
            ? `${classCompliance.so3.stats.percentLG}% > ${classCompliance.so3.limits.lg}` 
            : "Aucun défaut"}</span>
          <span>Défaut={classCompliance.so3.stats.percentLG}%</span>
        </div>
        <div className="parameter-item">
          <span>Chlorure (Chlorure)</span>
          <span>{classCompliance.chlorure.stats.percentLG !== "-" 
            ? `${classCompliance.chlorure.stats.percentLG}% > ${classCompliance.chlorure.limits.lg}` 
            : "Aucun défaut"}</span>
          <span>Défaut={classCompliance.chlorure.stats.percentLG}%</span>
        </div>
      </div>
    </div>
  </div>

  {/* Additional sections from the image */}
  <div className="sections-horizontal">
    <div className="section-box">
      <h4>Contrôle par Mesures des résistances mécaniques</h4>
      <div className="parameter-list">
        <div className="parameter-item">
          <span>Résistance à court terme à 02 j (RC2J) LI</span>
          <span>{allStats.rc2j.mean !== "-" ? `x-kass= ${allStats.rc2j.mean} > ${classCompliance.rc2j.limits.li}` : "Données insuffisantes"}</span>
        </div>
        <div className="parameter-item">
          <span>Résistance courante 28j (RC28J) LS</span>
          <span>{allStats.rc28j.mean !== "-" ? `x-kass= ${allStats.rc28j.mean} < ${classCompliance.rc28j.limits.ls}` : "Données insuffisantes"}</span>
        </div>
        <div className="parameter-item">
          <span>Résistance courante 28j (RC28J) L1</span>
          <span>{allStats.rc28j.mean !== "-" ? `x-kass= ${allStats.rc28j.mean} > ${classCompliance.rc28j.limits.lg}` : "Données insuffisantes"}</span>
        </div>
        <div className="parameter-item">
          <span>Temps de début de prise (Prise) LI</span>
          <span>{allStats.prise.mean !== "-" ? `x-kass= ${allStats.prise.mean} > ${classCompliance.prise.limits.li}` : "Données insuffisantes"}</span>
        </div>
      </div>
    </div>
  </div>

  <div className="sections-horizontal">
    <div className="section-box">
      <h4>Contrôle par Attributs propriétés physiques & chimiques</h4>
      <div className="parameter-list">
        <div className="parameter-item">
          <span>Stabilité (Stabilite)</span>
          <span>{classCompliance.stabilite.stats.aboveLS === "-" ? "Équation satisfaite" : "Équation non satisfaite"}</span>
        </div>
        <div className="parameter-item">
          <span>Sulfate (SO3)</span>
          <span>{classCompliance.so3.stats.aboveLS === "-" ? "Équation satisfaite" : "Équation non satisfaite"}</span>
        </div>
        <div className="parameter-item">
          <span>Chlorure (Chlorure)</span>
          <span>{classCompliance.chlorure.stats.aboveLS === "-" ? "Équation satisfaite" : "Équation non satisfaite"}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Class Conclusion */}
  <div className="conclusion-section">
    <div className="conformity-summary">
        <h4>CONCLUSION :....................... </h4>
    </div>
    <div className="conformity-box" >
      <strong>CONFORMITÉ: {isClassConforme ? 'CONFORME' : 'NON CONFORME'}</strong>
    </div>
  </div>
  
  <hr className="section-divider" />
</div>

         


      
        
      </div>
    );
    
  };

  if (!tableData || tableData.length === 0) {
    return (
      <div className="cement-report-container">
        <h2>Aucune donnée disponible pour le contrôle</h2>
        <button onClick={onBack}>← Retour</button>
      </div>
    );
  }

  return (
    <div className="cement-report-container">


      {/* Render all class sections */}
      {classes.map(classe => renderClassSection(classe))}


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

export default ControleConformite;
