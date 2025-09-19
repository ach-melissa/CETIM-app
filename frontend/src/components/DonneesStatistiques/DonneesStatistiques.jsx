import React, { useEffect, useState } from "react";
import "./DonneesStatistiques.css";

// ============================================================
// Mock details (limits and guarantees per cement class/type)
// ============================================================
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

// ============================================================
// Utility functions
// ============================================================

// Calculate stats (count, min, max, mean, std)
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

// Count values relative to LI / LS / LG
const evaluateLimits = (data, key, li, ls, lg) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return { belowLI: "-", aboveLS: "-", belowLG: "-", percentLI: "-", percentLS: "-", percentLG: "-" };

  const belowLI = li && li !== "-" ? values.filter((v) => v < parseFloat(li)).length : 0;
  const aboveLS = ls && ls !== "-" ? values.filter((v) => v > parseFloat(ls)).length : 0;
  const belowLG = lg && lg !== "-" ? values.filter((v) => v < parseFloat(lg)).length : 0;

  const total = values.length;
  return {
    belowLI: belowLI > 0 ? belowLI : "-",
    aboveLS: aboveLS > 0 ? aboveLS : "-",
    belowLG: belowLG > 0 ? belowLG : "-",
    percentLI: total > 0 && belowLI > 0 ? ((belowLI / total) * 100).toFixed(1) : "-",
    percentLS: total > 0 && aboveLS > 0 ? ((aboveLS / total) * 100).toFixed(1) : "-",
    percentLG: total > 0 && belowLG > 0 ? ((belowLG / total) * 100).toFixed(1) : "-",
  };
};

// Get LI / LS / LG limits for a given class and parameter
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
    ajout_percent: "", // no specific limits
  };

  const mockKey = keyMapping[key];
  if (!mockKey || !mockDetails[mockKey]) return { li: "-", ls: "-", lg: "-" };

  let found = mockDetails[mockKey].find((item) => item.classe === classe);
  if (!found) found = mockDetails[mockKey].find((item) => item.classe === "Tous");
  if (!found && mockDetails[mockKey].length > 0) found = mockDetails[mockKey][0];

  return {
    li: found?.resistance_min ?? "-",
    ls: found?.resistance_max ?? "-",
    lg: found?.garantie ?? "-",
  };
};

// ============================================================
// Component
// ============================================================
const DonneesStatistiques = ({
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
  startDate,
  endDate,
}) => {
  // Parameters list
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

  if (Number(selectedType) === 1) {
    parameters.push({ key: "c3a", label: "C3A" });
  } else if (selectedType) {
    parameters.push({ key: "ajout_percent", label: "Ajout (%)" });
  }

  // Compute stats
  const allStats = parameters.reduce((acc, param) => {
    acc[param.key] = calculateStats(tableData, param.key);
    return acc;
  }, {});

  // Rows for global stats
  const statRows = [
    { key: "count", label: "Nombre" },
    { key: "min", label: "Min" },
    { key: "max", label: "Max" },
    { key: "mean", label: "Moyenne" },
    { key: "std", label: "Écart type" },
  ];

  // Classes list
  const classes = ["32.5L", "32.5N", "32.5R", "42.5L", "42.5N", "42.5R", "52.5L", "52.5N", "52.5R"];

  // Render class-specific section
  const renderClassSection = (classe) => (
    <div className="class-section" key={classe}>
      <h4>CLASSE {classe}</h4>
      <table className="stats-table">
        <tbody>
          <tr>
            <td>Limite inférieure (LI)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{limits.li}</td>;
            })}
          </tr>
          <tr>
            <td>N &lt; LI</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const ev = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{ev.belowLI}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LI</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const ev = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{ev.percentLI}</td>;
            })}
          </tr>
          <tr>
            <td>Limite supérieure (LS)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{limits.ls}</td>;
            })}
          </tr>
          <tr>
            <td>N &gt; LS</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const ev = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{ev.aboveLS}</td>;
            })}
          </tr>
          <tr>
            <td>% &gt; LS</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const ev = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{ev.percentLS}</td>;
            })}
          </tr>
          <tr>
            <td>Limite garantie (LG)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{limits.lg}</td>;
            })}
          </tr>
          <tr>
            <td>N &lt; LG</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const ev = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{ev.belowLG}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LG</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const ev = evaluateLimits(tableData, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{ev.percentLG}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="stats-section">
      <p><strong>{clients.find((c) => c.id == selectedClient)?.nom_raison_sociale || "Aucun client"}</strong></p>
      <h2>Données Statistiques</h2>
      <h2>Période du {startDate || "......"} au {endDate || "........"}</h2>
      <h3>
        {selectedProduit && `${produits.find((p) => p.id == selectedProduit)?.nom}`}{" "}
        ({produitDescription})
      </h3>

      {tableData.length > 0 ? (
        <div>
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

          {/* Class sections */}
          {classes.map((classe) => renderClassSection(classe))}
        </div>
      ) : (
        <p className="no-data">Veuillez d'abord importer / sélectionner des données.</p>
      )}

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
          <button className="action-btn save-btn" onClick={handleSave} disabled={tableData.length === 0}>
            <i className="fas fa-save"></i> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonneesStatistiques;
