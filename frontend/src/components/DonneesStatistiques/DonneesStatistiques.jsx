// src/components/DonneesStatistiques/DonneesStatistiques.jsx
import React, { useState, useEffect, useRef } from "react";
import "./DonneesStatistiques.css";
import { useData } from "../../context/DataContext";

// ============================================================
// Utility functions
// ============================================================
const calculateStats = (data, key) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  const totalSamples = data.length;

  if (!values.length) {
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  const count = values.length;
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);
  const mean = (values.reduce((a, b) => a + b, 0) / totalSamples).toFixed(2);

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
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
  const [debugInfo, setDebugInfo] = useState("");
  const debugLogRef = useRef([]);

  const c3aProducts = ["CEM I-SR 0", "CEM I-SR 3", "CEM I-SR 5", "CEM IV/A-SR", "CEM IV/B-SR"];
  const ajoutProducts = [
    "CEM II/A-S", "CEM II/B-S", "CEM II/A-D", "CEM II/A-P", "CEM II/B-P",
    "CEM II/A-Q", "CEM II/B-Q", "CEM II/A-V", "CEM II/B-V",
    "CEM II/A-W", "CEM II/B-W", "CEM II/A-T", "CEM II/B-T",
    "CEM II/A-L", "CEM II/B-L", "CEM II/A-LL", "CEM II/B-LL",
    "CEM II/A-M", "CEM II/B-M"
  ];

  // Debug: Log the complete produitInfo structure
  useEffect(() => {
    if (produitInfo) {
      console.log("=== PRODUIT INFO COMPLETE STRUCTURE ===", produitInfo);
      console.log("Produit nom:", produitInfo.nom);
      console.log("Produit description:", produitInfo.description);
      console.log("Produit famille:", produitInfo.famille);
      console.log("Famille code:", produitInfo.famille?.code);
      console.log("Famille nom:", produitInfo.famille?.nom);
    }
  }, [produitInfo]);

  // Get product type and famille from produitInfo with fallbacks
  const selectedProductType = produitInfo?.nom || produitInfo?.code || "";
  const selectedProductFamille = produitInfo?.famille?.code || "";
  const selectedProductFamilleName = produitInfo?.famille?.nom || "";

  // FIXED: Better famille detection from product type
  const determineFamilleFromType = (productType) => {
    if (!productType) return "";
    
    // Match the complete famille pattern (CEM I, CEM II, etc.)
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
        
        console.log("=== COMPLETE JSON STRUCTURE ===");
        console.log(data);
        console.log("=== END JSON STRUCTURE ===");
        
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

  // Function to add debug logs without causing re-renders
  const addDebugLog = (message) => {
    debugLogRef.current.push(`${new Date().toLocaleTimeString()}: ${message}`);
    if (debugLogRef.current.length > 50) {
      debugLogRef.current = debugLogRef.current.slice(-50);
    }
  };

  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !mockDetails[mockKey]) {
      addDebugLog(`❌ Parameter "${mockKey}" not found in JSON`);
      return { li: "-", ls: "-", lg: "-" };
    }

    const parameterData = mockDetails[mockKey];
    
    let debugMessage = `🔍 Searching: ${mockKey} -> ${finalFamilleCode} -> ${selectedProductType} -> ${classe}`;
    
    // Check if famille exists in this parameter
    if (!parameterData[finalFamilleCode]) {
      const availableFamilles = Object.keys(parameterData).join(", ");
      debugMessage += `\n❌ Famille "${finalFamilleCode}" not found in ${mockKey}. Available: ${availableFamilles}`;
      addDebugLog(debugMessage);
      return { li: "-", ls: "-", lg: "-" };
    }

    const familleData = parameterData[finalFamilleCode];
    debugMessage += `\n✅ Famille "${finalFamilleCode}" found in ${mockKey}`;

    // For "ajout" parameter, the structure is different
    if (key === "ajt") {
      debugMessage += `\n🔄 Special handling for "ajout" parameter`;
      
      // Extract the ajout code from the product type (e.g., "M" from "CEM II/B-M")
      const ajoutCode = selectedProductType.split('/').pop()?.split('-').pop()?.trim();
      debugMessage += `\n🔍 Extracted ajout code: "${ajoutCode}" from product type: "${selectedProductType}"`;
      
      if (!ajoutCode || !familleData[ajoutCode]) {
        const availableAjoutCodes = Object.keys(familleData).join(", ");
        debugMessage += `\n❌ Ajout code "${ajoutCode}" not found. Available: ${availableAjoutCodes}`;
        addDebugLog(debugMessage);
        return { li: "-", ls: "-", lg: "-" };
      }

      const ajoutData = familleData[ajoutCode];
      debugMessage += `\n✅ Ajout code "${ajoutCode}" found`;
      
      const limits = {
        li: ajoutData.limitInf ?? ajoutData.limit_inf ?? "-",
        ls: ajoutData.limitSup ?? ajoutData.limit_max ?? "-",
        lg: ajoutData.garantie ?? "-"
      };
      
      debugMessage += `\n✅ Ajout limits: LI=${limits.li}, LS=${limits.ls}, LG=${limits.lg}`;
      addDebugLog(debugMessage);
      return limits;
    }

    // For other parameters, search for the class data
    debugMessage += `\n📊 Searching for class "${classe}" in famille data`;
    
    let classData = null;
    
    // First, check if familleData is an array of classes
    if (Array.isArray(familleData)) {
      classData = familleData.find(item => item.classe === classe);
      if (classData) debugMessage += `\n✅ Found class "${classe}" in array structure`;
    } 
    // If not array, check if it's an object with class keys
    else if (typeof familleData === 'object' && familleData[classe]) {
      classData = familleData[classe];
      if (classData) debugMessage += `\n✅ Found class "${classe}" in object structure`;
    }
    // If not found, search in nested structures
    else {
      for (const key in familleData) {
        const subData = familleData[key];
        if (Array.isArray(subData)) {
          const found = subData.find(item => item.classe === classe);
          if (found) {
            classData = found;
            debugMessage += `\n✅ Found class "${classe}" in sub-key "${key}" (array)`;
            break;
          }
        } else if (typeof subData === 'object' && subData[classe]) {
          classData = subData[classe];
          debugMessage += `\n✅ Found class "${classe}" in sub-key "${key}" (object)`;
          break;
        } else if (typeof subData === 'object' && (subData.limit_inf || subData.limitInf)) {
          // Direct limits object
          classData = subData;
          debugMessage += `\n✅ Found direct limits in sub-key "${key}"`;
          break;
        }
      }
    }

    if (!classData) {
      debugMessage += `\n❌ No data found for class "${classe}" in famille "${finalFamilleCode}"`;
      debugMessage += `\n📋 Available keys in famille data: ${Object.keys(familleData).join(', ')}`;
      addDebugLog(debugMessage);
      return { li: "-", ls: "-", lg: "-" };
    }

    const limits = {
      li: classData.limit_inf ?? classData.limitInf ?? "-",
      ls: classData.limit_max ?? classData.limitSup ?? classData.limitMax ?? "-",
      lg: classData.garantie ?? classData.garantieValue ?? "-",
    };

    debugMessage += `\n✅ Limits found for class "${classe}": LI=${limits.li}, LS=${limits.ls}, LG=${limits.lg}`;
    addDebugLog(debugMessage);

    return limits;
  };

  // Update debug info only when needed
  useEffect(() => {
    if (debugLogRef.current.length > 0) {
      setDebugInfo(debugLogRef.current.join('\n'));
    }
  }, [filteredTableData, selectedProductType, finalFamilleCode]);

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
            <p><strong>Produit: {produitInfo.nom}</strong></p>
            <p><strong>Description: {produitInfo.description}</strong></p>
            {finalFamilleCode && (
              <p>
                <strong>Famille: {finalFamilleName} ({finalFamilleCode})</strong>
                {!selectedProductFamille && <span style={{color: 'orange', fontSize: '12px'}}> *Détectée automatiquement</span>}
              </p>
            )}
          </>
        )}
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
      </div>

      {/* Enhanced Debug information */}
      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '15px', 
        marginBottom: '15px', 
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🔧 Debug Information</h4>
        <div style={{ marginBottom: '10px' }}>
          <strong>Selected Product:</strong> {selectedProductType || "None"}<br/>
          <strong>Selected Famille from DB:</strong> {selectedProductFamilleName} ({selectedProductFamille || "NULL"})<br/>
          <strong>Final Famille Used:</strong> {finalFamilleName} ({finalFamilleCode})<br/>
          <strong>Client Type Cement ID:</strong> {clientTypeCimentId || "None"}
        </div>
        
        <div>
          <strong>Available Familles in JSON:</strong><br/>
          {Object.keys(mockDetails).length > 0 ? (
            Object.keys(mockDetails).map(famille => (
              <div key={famille} style={{ marginLeft: '10px' }}>
                • {famille}: {Object.keys(mockDetails[famille] || {}).join(', ')}
              </div>
            ))
          ) : (
            "Loading..."
          )}
        </div>
        
        {debugInfo && (
          <div style={{ marginTop: '10px' }}>
            <strong>Search Logs:</strong>
            <pre style={{ 
              backgroundColor: '#fff', 
              padding: '10px', 
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              marginTop: '5px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {debugInfo}
            </pre>
          </div>
        )}
        
        <button 
          onClick={() => {
            console.log("=== PRODUIT INFO COMPLETE ===", produitInfo);
            console.log("=== PRODUIT FAMEILLE DETAILS ===", produitInfo?.famille);
            console.log("=== FINAL FAMILLE ===", finalFamilleCode);
            console.log("=== AVAILABLE FAMILLES ===", Object.keys(mockDetails));
            // Log specific famille data for debugging
            if (finalFamilleCode && mockDetails.resistance_2j) {
              console.log(`=== ${finalFamilleCode} DATA in resistance_2j ===`, mockDetails.resistance_2j[finalFamilleCode]);
            }
          }}
          style={{
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '10px'
          }}
        >
          Log Complete Details to Console
        </button>
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