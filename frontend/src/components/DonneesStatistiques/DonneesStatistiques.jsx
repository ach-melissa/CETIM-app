// src/components/DonneesStatistiques/DonneesStatistiques.jsx
import React, { useState, useEffect } from "react";
import "./DonneesStatistiques.css";
import { useData } from "../../context/DataContext";

// ============================================================
// Utility functions
// ============================================================
const calculateStats = (data, key) => {
  const values = data.map((row) => parseFloat(row[key])).filter((v) => !isNaN(v));
  if (!values.length) return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  const count = values.length;
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);
  const mean = (values.reduce((a, b) => a + b, 0) / count).toFixed(2);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance).toFixed(2);
  return { count, min, max, mean, std };
};

const evaluateLimits = (data, key, li, ls, lg) => {
  const values = data.map((row) => parseFloat(row[key])).filter((v) => !isNaN(v));
  if (!values.length) return { belowLI: "-", aboveLS: "-", belowLG: "-", percentLI: "-", percentLS: "-", percentLG: "-" };
  const belowLI = li && li !== "-" ? values.filter((v) => v < parseFloat(li)).length : 0;
  const aboveLS = ls && ls !== "-" ? values.filter((v) => v > parseFloat(ls)).length : 0;
  const belowLG = lg && lg !== "-" ? values.filter((v) => v < parseFloat(lg)).length : 0;
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
// DonneesStatistiques Component
// ============================================================
const DonneesStatistiques = ({ clientId, produitId, start, end, selectedType, produitDescription, clients = []  }) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger les données depuis le fichier JSON
  useEffect(() => {
    const fetchMockDetails = async () => {
      try {
        const response = await fetch('/Data/parnorm.json');
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        const data = await response.json();
        setMockDetails(data);
      } catch (error) {
        console.error('Erreur de chargement des données:', error);
        setMockDetails({});
      } finally {
        setLoading(false);
      }
    };
    fetchMockDetails();
  }, []);

  const getLimitsByClass = (classe, key) => {
    const keyMapping = {
      rc2j: "resistance_2j",
      rc7j: "resistance_7j",
      rc28j: "resistance_28j",
      prise: "temps_debut_prise",
      stabilite: "stabilite",
      hydratation: "chaleur_hydratation",
      so3: "SO3",
      c3a: "C3A",
      pfeu: "pert_au_feu",
      r_insoluble: "residu_insoluble",
      chlorure: "teneur_chlour",
      ajout_percent: "",
    };

    const mockKey = keyMapping[key];
    if (!mockKey || !mockDetails[mockKey]) return { li: "-", ls: "-", lg: "-" };
    
    let found = mockDetails[mockKey].find((item) => item.classe === classe);
    if (!found) found = mockDetails[mockKey].find((item) => item.classe === "Tous");
    if (!found && mockDetails[mockKey].length > 0) found = mockDetails[mockKey][0];
    
    return { 
      li: found?.limit_inf ?? "-", 
      ls: found?.limit_max ?? "-", 
      lg: found?.garantie ?? "-" 
    };
  };

  const dataToUse = filteredTableData || [];

  if (loading) return <p className="no-data">Chargement des données de référence...</p>;
  if (!dataToUse.length) return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

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

  if (Number(selectedType) === 1) parameters.push({ key: "c3a", label: "C3A" });
  else if (selectedType) parameters.push({ key: "ajout_percent", label: "Ajout (%)" });

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

  const classes = ["32.5L", "32.5N", "32.5R", "42.5L", "42.5N", "42.5R", "52.5L", "52.5N", "52.5R"];

  const renderClassSection = (classe) => (
    <div className="class-section" key={classe}>
      <h4>CLASSE {classe}</h4>
      <table className="stats-table">
        <tbody>
          <tr>
            <td>Limite inférieure (LI)</td>
            {parameters.map((param) => (
              <td key={param.key}>{getLimitsByClass(classe, param.key).li}</td>
            ))}
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
            {parameters.map((param) => (
              <td key={param.key}>{getLimitsByClass(classe, param.key).ls}</td>
            ))}
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
            {parameters.map((param) => (
              <td key={param.key}>{getLimitsByClass(classe, param.key).lg}</td>
            ))}
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

  // Dummy handlers
  const handleExport = () => alert("Exporting...");
  const handlePrint = () => alert("Printing...");
  const handleSave = () => alert("Saving...");

  return (
    <div className="stats-section">
      <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>
              {clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}
            </strong>
          </p>
        <h2>Données Statistiques</h2>
         <p><strong>{produitDescription}</strong></p>
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
        
      </div>

      <table className="stats-table">
        <thead>
          <tr>
            <th>Statistique</th>
            {parameters.map((param) => (
              <th key={param.key}>{param.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {statRows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              {parameters.map((param) => (
                <td key={param.key}>{allStats[param.key][row.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {classes.map((classe) => renderClassSection(classe))}

      <div className="actions-bar">
        <div className="file-actions">
          <button className="action-btn export-btn" onClick={handleExport} disabled={!dataToUse.length}>
            Exporter
          </button>
          <button className="action-btn print-btn" onClick={handlePrint} disabled={!dataToUse.length}>
            Imprimer
          </button>
        </div>
        <div className="data-actions">
          <button className="action-btn save-btn" onClick={handleSave} disabled={!dataToUse.length}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};


export default DonneesStatistiques;