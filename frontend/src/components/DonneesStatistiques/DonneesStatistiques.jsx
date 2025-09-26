// src/components/DonneesStatistiques/DonneesStatistiques.jsx
import React, { useState, useEffect, useRef } from "react";
import "./DonneesStatistiques.css";
import { useData } from "../../context/DataContext";

// ============================================================
// Utility functions
// ============================================================

const calculateStats = (data, key) => {
  const missingValues = [];
  const values = [];
  
  data.forEach((row, index) => {
    const value = row[key];
    
    const isMissing = 
      value === null || 
      value === undefined || 
      value === "" || 
      value === " " || 
      value === "NULL" || 
      value === "null" ||
      value === "undefined" ||
      String(value).trim() === "" ||
      String(value).toLowerCase() === "null" ||
      String(value).toLowerCase() === "undefined";
    
    if (isMissing) {
      missingValues.push({ line: index + 1, value: value, type: typeof value });
    } else {
      try {
        const stringValue = String(value).trim().replace(',', '.');
        const numericValue = parseFloat(stringValue);
        
        if (!isNaN(numericValue) && isFinite(numericValue)) {
          values.push(numericValue);
        } else {
          missingValues.push({ line: index + 1, value: value, type: typeof value, reason: "NaN or Infinite" });
        }
      } catch (error) {
        missingValues.push({ line: index + 1, value: value, type: typeof value, reason: "Conversion error" });
      }
    }
  });

  if (values.length === 0) {
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  const count = values.length;
  const min = values.reduce((a, b) => Math.min(a, b), values[0]);
  const max = values.reduce((a, b) => Math.max(a, b), values[0]);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance);
  
  return {
    count,
    min: min.toFixed(2),
    max: max.toFixed(2),
    mean: mean.toFixed(2),
    std: std.toFixed(2),
  };
};

const evaluateLimits = (data, key, li, ls, lg) => {
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === "-") return NaN;
    return parseFloat(String(val).replace(',', '.'));
  };

  const values = data.map((row) => safeParse(row[key])).filter((v) => !isNaN(v));
  
  if (!values.length) {
    return { belowLI: "-", aboveLS: "-", belowLG: "-", percentLI: "-", percentLS: "-", percentLG: "-" };
  }

  const liNum = safeParse(li);
  const lsNum = safeParse(ls);
  const lgNum = safeParse(lg);

  const belowLI = !isNaN(liNum) ? values.filter((v) => v < liNum).length : 0;
  const aboveLS = !isNaN(lsNum) ? values.filter((v) => v > lsNum).length : 0;
  const belowLG = !isNaN(lgNum) ? values.filter((v) => v < lgNum).length : 0;
  const total = values.length;

  return {
    belowLI: belowLI > 0 ? belowLI : "-",
    aboveLS: aboveLS > 0 ? aboveLS : "-",
    belowLG: belowLG > 0 ? belowLG : "-",
    percentLI: belowLI > 0 ? ((belowLI / total) * 100).toFixed(1) : "-",
    percentLS: aboveLS > 0 ? ((aboveLS / total) * 100).toFixed(1) : "-",
    percentLG: belowLG > 0 ? ((belowLG / total) * 100).toFixed(1) : "-",
  };
};

// ============================================================
// DonneesStatistiques Component
// ============================================================
const DonneesStatistiques = ({ 
  clientId, 
  clientTypeCimentId, 
  produitInfo,
  produitDescription, 
  clients = [], 
  produits = [] 
}) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const c3aProducts = ["CEM I-SR 0", "CEM I-SR 3", "CEM I-SR 5", "CEM IV/A-SR", "CEM IV/B-SR"];
  const ajoutProducts = [
    "CEM II/A-S", "CEM II/B-S", "CEM II/A-D", "CEM II/A-P", "CEM II/B-P",
    "CEM II/A-Q", "CEM II/B-Q", "CEM II/A-V", "CEM II/B-V",
    "CEM II/A-W", "CEM II/B-W", "CEM II/A-T", "CEM II/B-T",
    "CEM II/A-L", "CEM II/B-L", "CEM II/A-LL", "CEM II/B-LL",
    "CEM II/A-M", "CEM II/B-M"
  ];

  // Get product type and famille from produitInfo with fallbacks
  const selectedProductType = produitInfo?.nom || produitInfo?.code || "";
  const selectedProductFamille = produitInfo?.famille?.code || "";
  const selectedProductFamilleName = produitInfo?.famille?.nom || "";

  const determineFamilleFromType = (productType) => {
    if (!productType) return "";
    
    const familleMatch = productType.match(/^(CEM [I|II|III|IV|V]+)/);
    if (familleMatch) {
      return familleMatch[1];
    }
    
    return "";
  };

  // Final famille values with fallback
  const finalFamilleCode = selectedProductFamille || determineFamilleFromType(selectedProductType);
  const finalFamilleName = selectedProductFamilleName || finalFamilleCode;

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
    ajt: "ajout",
    c3a: "C3A",
  };

  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !mockDetails[mockKey]) {
      return { li: "-", ls: "-", lg: "-" };
    }

    const parameterData = mockDetails[mockKey];
    
    if (!parameterData[finalFamilleCode]) {
      return { li: "-", ls: "-", lg: "-" };
    }

    const familleData = parameterData[finalFamilleCode];

    // For "ajout" parameter, the structure is different
    if (key === "ajt") {
      const ajoutCode = selectedProductType.split('/').pop()?.split('-').pop()?.trim();
      
      if (!ajoutCode || !familleData[ajoutCode]) {
        return { li: "-", ls: "-", lg: "-" };
      }

      const ajoutData = familleData[ajoutCode];
      
      return {
        li: ajoutData.limitInf ?? ajoutData.limit_inf ?? "-",
        ls: ajoutData.limitSup ?? ajoutData.limit_max ?? "-",
        lg: ajoutData.garantie ?? "-"
      };
    }

    // For other parameters, search for the class data
    let classData = null;
    
    if (Array.isArray(familleData)) {
      classData = familleData.find(item => item.classe === classe);
    } else if (typeof familleData === 'object' && familleData[classe]) {
      classData = familleData[classe];
    } else {
      for (const key in familleData) {
        const subData = familleData[key];
        if (Array.isArray(subData)) {
          const found = subData.find(item => item.classe === classe);
          if (found) {
            classData = found;
            break;
          }
        } else if (typeof subData === 'object' && subData[classe]) {
          classData = subData[classe];
          break;
        } else if (typeof subData === 'object' && (subData.limit_inf || subData.limitInf)) {
          classData = subData;
          break;
        }
      }
    }

    if (!classData) {
      return { li: "-", ls: "-", lg: "-" };
    }

    return {
      li: classData.limit_inf ?? classData.limitInf ?? "-",
      ls: classData.limit_max ?? classData.limitSup ?? classData.limitMax ?? "-",
      lg: classData.garantie ?? classData.garantieValue ?? "-",
    };
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

  // Add C3A if selected product is in c3aProducts
  if (c3aProducts.includes(selectedProductType)) {
    parameters.push({ key: "c3a", label: "C3A" });
  }

  // Add Ajout if selected product is in ajoutProducts
  if (ajoutProducts.includes(selectedProductType)) {
    parameters.push({ key: "ajt", label: "Ajout" });
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

  const classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"];

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
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.belowLI}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LI</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.percentLI}</td>;
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
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.aboveLS}</td>;
            })}
          </tr>
          <tr>
            <td>% &gt; LS</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.percentLS}</td>;
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
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.belowLG}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LG</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.percentLG}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="stats-section">
      <div style={{ marginBottom: "1rem" }}>
        <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
        <h2>Données Statistiques</h2>
        {produitInfo && (
          <>
            <p><strong> {produitInfo.nom} ( {produitInfo.description} )</strong></p>
          </>
        )}
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
    </div>
  );
};

export default DonneesStatistiques;