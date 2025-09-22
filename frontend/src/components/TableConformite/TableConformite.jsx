import React, { useState, useEffect } from "react";
import "./TableConformite.css";
import { useData } from "../../context/DataContext";

// ============================================================
// Utility: calculate stats
// ============================================================
const calculateStats = (data, key) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  if (!values.length) {
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  const count = values.length;
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);
  const mean = (values.reduce((a, b) => a + b, 0) / count).toFixed(2);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance).toFixed(2);

  return { count, min, max, mean, std };
};

// ============================================================
// Utility: evaluate conformity vs limits
// ============================================================
const evaluateLimits = (data, key, li, ls, lg) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  if (!values.length) {
    return {
      belowLI: 0,
      aboveLS: 0,
      belowLG: 0,
      percentLI: 0,
      percentLS: 0,
      percentLG: 0,
    };
  }

  const total = values.length;
  const belowLI = li ? values.filter((v) => v < parseFloat(li)).length : 0;
  const aboveLS = ls ? values.filter((v) => v > parseFloat(ls)).length : 0;
  const belowLG = lg ? values.filter((v) => v < parseFloat(lg)).length : 0;

  return {
    belowLI,
    aboveLS,
    belowLG,
    percentLI: ((belowLI / total) * 100).toFixed(1),
    percentLS: ((aboveLS / total) * 100).toFixed(1),
    percentLG: ((belowLG / total) * 100).toFixed(1),
  };
};

// ============================================================
// Main Component
// ============================================================
const TableConformite = ({
  clientId,
  produitId,
  phase,
  selectedType,
  onTableDataChange,
  initialStart,
  initialEnd,
  produitDescription,
  clients = [],
  produits = [],
}) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger JSON de référence
  useEffect(() => {
    const fetchMockDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch("/Data/parnorm.json");
        if (!response.ok) throw new Error("Erreur lors du chargement des données");
        const data = await response.json();
        setMockDetails(data);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError("Impossible de charger les données de référence");
      } finally {
        setLoading(false);
      }
    };
    fetchMockDetails();
  }, []);

  // Mapping interne
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
    ajout_percent: "ajout_percent",
  };

  // Récupère les limites par classe et paramètre
  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !Array.isArray(mockDetails[mockKey])) {
      return { li: "-", ls: "-", lg: "-" };
    }

    let found = mockDetails[mockKey].find(
      (item) => item.classe?.toString().trim() === classe.toString().trim()
    );

    if (!found) found = mockDetails[mockKey].find((item) => item.classe === "Tous");

    return {
      li: found?.limit_inf ?? "-",
      ls: found?.limit_max ?? "-",
      lg: found?.garantie ?? "-",
    };
  };

  const dataToUse = filteredTableData || [];

  if (loading) return <p className="no-data">Chargement...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!dataToUse.length) return <p className="no-data">Aucun échantillon filtré.</p>;
  if (Object.keys(mockDetails).length === 0)
    return <p className="no-data">Pas de données de référence.</p>;

  // Paramètres dynamiques
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

  const allStats = parameters.reduce((acc, param) => {
    acc[param.key] = calculateStats(dataToUse, param.key);
    return acc;
  }, {});

  const classes = [
    "32.5 L", "32.5 N", "32.5 R",
    "42.5 L", "42.5 N", "42.5 R", 
    "52.5 L", "52.5 N", "52.5 R"
  ];

  // Gestion couleurs
  const getDeviationColor = (percent) =>
    parseFloat(percent) >= 5 ? "yellow" : "green";
  const getDefaultColor = (percent) =>
    parseFloat(percent) >= 5 ? "red" : "green";

  // Actions fictives
  const handleExport = () => alert("Export...");
  const handlePrint = () => window.print();
  const handleSave = () => alert("Sauvegarde...");

  return (
    <div className="cement-table-page">
      <div className="cement-table-container">
        {/* Header */}
        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>
              {clients.find((c) => c.id == clientId)?.nom_raison_sociale ||
                "Aucun client"}
            </strong>
          </p>
          <p>
            <strong>{produitDescription}</strong>
          </p>
          <p>
            Période: {filterPeriod.start} à {filterPeriod.end}
          </p>
          
        </div>

        {/* Table Conformité */}
        <div className="table-section">
          <h3>Conformité</h3>
          <table className="conformity-table">
            <thead>
              <tr>
                <th>Paramètre/Classe</th>
                {parameters.map((param) => (
                  <th key={param.key}>{param.label}</th>
                ))}
              </tr>
            </thead>
<tbody>
  {classes.map((classe) => {
    let isConforme = true;

    const cells = parameters.map((param) => {
      const limits = getLimitsByClass(classe, param.key);
      const evaluation = evaluateLimits(
        dataToUse,
        param.key,
        limits.li,
        limits.ls,
        limits.lg
      );
      const deviationPercent = Math.max(
        parseFloat(evaluation.percentLI || 0),
        parseFloat(evaluation.percentLS || 0)
      );
      const hasDeviation = deviationPercent >= 5;
      const hasDefault = parseFloat(evaluation.percentLG || 0) >= 5;

      if (hasDeviation || hasDefault) isConforme = false;

      return <td key={param.key}></td>;
    });

    return (
      <React.Fragment key={classe}>
        {/* Ligne Classe + Conforme / Non Conforme */}
        <tr key={`${classe}-name`}>
          <td>
            {classe}{" "}
            <strong
              style={{
                marginLeft: "10px",
                color: isConforme ? "green" : "red",
              }}
            >
              {isConforme ? "Conforme" : "Non Conforme"}
            </strong>
          </td>
          {cells}
        </tr>

        {/* Déviation */}
        <tr key={`${classe}-deviation`}>
          <td>% Déviation </td>
          {parameters.map((param) => {
            const limits = getLimitsByClass(classe, param.key);
            const evaluation = evaluateLimits(
              dataToUse,
              param.key,
              limits.li,
              limits.ls,
              limits.lg
            );
            const deviationPercent = Math.max(
              parseFloat(evaluation.percentLI || 0),
              parseFloat(evaluation.percentLS || 0)
            );

            let displayValue = "OK";
            let color = "green";
            if (deviationPercent >= 5) {
              displayValue = `${deviationPercent}%`;
              color = "red";
            }

            return (
              <td key={param.key} style={{ color, fontWeight: "bold" }}>
                {displayValue}
              </td>
            );
          })}
        </tr>

        {/* Défaut */}
        <tr key={`${classe}-default`}>
          <td>% Défaut </td>
          {parameters.map((param) => {
            const limits = getLimitsByClass(classe, param.key);
            const evaluation = evaluateLimits(
              dataToUse,
              param.key,
              limits.li,
              limits.ls,
              limits.lg
            );
            const percentLG = parseFloat(evaluation.percentLG || 0);

            let displayValue = "OK";
            let color = "green";
            if (percentLG >= 5) {
              displayValue = `${percentLG}%`;
              color = "red";
            }

            return (
              <td key={param.key} style={{ color, fontWeight: "bold" }}>
                {displayValue}
              </td>
            );
          })}
        </tr>

        {/* Contrôle Statistique */}
        <tr key={`${classe}-controlsatic`}>
          <td>Contrôle Statistique</td>
          {parameters.map((param) => {
            const limits = getLimitsByClass(classe, param.key);
            const evaluation = evaluateLimits(
              dataToUse,
              param.key,
              limits.li,
              limits.ls,
              limits.lg
            );
            const percentLG = parseFloat(evaluation.percentLG || 0);

            let displayValue = "Satisfaite";
            let color = "green";
            if (percentLG >= 5) {
              displayValue = "Non Satisfaite";
              color = "red";
            }

            return (
              <td key={param.key} style={{ color, fontWeight: "bold" }}>
                {displayValue}
              </td>
            );
          })}
        </tr>
      </React.Fragment>
    );
  })}
</tbody>

          </table>
        </div>

        {/* Légende */}
        <div className="legend">
          <p>
            <span className="green-box"></span> Déviation/Défaut % &lt; 5%
          </p>
          <p>
            <span className="yellow-box"></span> % Déviation ≥ 5%
          </p>
          <p>
            <span className="red-box"></span> % Défaut ≥ 5%
          </p>
          <p>
            <span className="grey-box"></span> Données ND/NS
          </p>
        </div>


      </div>

      {/* Actions */}
      <div className="actions-bar">
        <div className="file-actions">
          <button
            className="action-btn export-btn"
            onClick={handleExport}
            disabled={dataToUse.length === 0}
          >
            <i className="fas fa-file-export"></i> Exporter
          </button>
          <button
            className="action-btn print-btn"
            onClick={handlePrint}
            disabled={dataToUse.length === 0}
          >
            <i className="fas fa-print"></i> Imprimer
          </button>
        </div>
        <div className="data-actions">
          <button
            className="action-btn save-btn"
            onClick={handleSave}
            disabled={dataToUse.length === 0}
          >
            <i className="fas fa-save"></i> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableConformite;
