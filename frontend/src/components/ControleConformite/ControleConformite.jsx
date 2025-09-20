import React, { useState, useEffect } from "react";
import './ControleConformite.css';
import { useData } from "../../context/DataContext";

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

const ControleConformite = ({
  clientId, 
  produitId, 
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

  // Function to render class section table
  const renderClassSection = (classe) => {
    // Calculate compliance for this specific class
    const classCompliance = {};
    parameters.forEach(param => {
      const limits = getLimitsByClass(classe, param.key);
      const stats = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
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
          <div style={{ marginBottom: "1rem" }}>
            <p>
              <strong>
                {clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}
              </strong>
            </p>
            <h2>Contrôle de conformité / classe de résistance</h2>
            <p><strong>{produitDescription}</strong></p>
            <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
          </div>
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
                {selectedType === "1" ? (
                  // 👉 Show C3A for CEM I
                  <div className="parameter-item">
                    <span>C3A</span>
                    <span>
                      {classCompliance.c3a?.stats?.percentLI !== "-" 
                        ? `${classCompliance.c3a.stats.percentLI}% < ${classCompliance.c3a.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.c3a?.stats?.percentLI}%</span>
                  </div>
                ) : selectedType ? (
                  // 👉 Show Ajout for other CEM types
                  <div className="parameter-item">
                    <span>Ajout(Calcaire)</span>
                    <span>
                      {classCompliance.ajout_percent?.stats?.percentLI !== "-" 
                        ? `${classCompliance.ajout_percent.stats.percentLI}% < ${classCompliance.ajout_percent.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.ajout_percent?.stats?.percentLI}%</span>
                  </div>
                ) : null}
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
                {selectedType === "1" ? (
                  // 👉 Show C3A for CEM I
                  <div className="parameter-item">
                    <span>C3A</span>
                    <span>
                      {classCompliance.c3a?.stats?.percentLI !== "-" 
                        ? `${classCompliance.c3a.stats.percentLI}% < ${classCompliance.c3a.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.c3a?.stats?.percentLI}%</span>
                  </div>
                ) : selectedType ? (
                  // 👉 Show Ajout for other CEM types
                  <div className="parameter-item">
                    <span>Ajout(Calcaire)</span>
                    <span>
                      {classCompliance.ajout_percent?.stats?.percentLI !== "-" 
                        ? `${classCompliance.ajout_percent.stats.percentLI}% < ${classCompliance.ajout_percent.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.ajout_percent?.stats?.percentLI}%</span>
                  </div>
                ) : null}
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

  if (!dataToUse || dataToUse.length === 0) {
    return (
      <div className="cement-report-container">
        <h2>Aucune donnée disponible pour le contrôle</h2>
      </div>
    );
  }

  // Dummy handlers
  const handleExport = () => alert("Exporting...");
  const handlePrint = () => alert("Printing...");
  const handleSave = () => alert("Saving...");

  return (
    <div className="cement-report-container">
      {/* Render all class sections */}
      {classes.map(classe => renderClassSection(classe))}

      {/* Data actions */}
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

export default ControleConformite;