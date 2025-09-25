// src/components/DonneesGraphiques/DonneesGraphiques.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import "./DonneesGraphiques.css";
import { useData } from "../../context/DataContext";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ---------- utils ---------- */
const normalize = (s) => String(s ?? "").replace(/\s+/g, "").toUpperCase();

const safeParse = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).toString().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

const parseLimit = (val) => {
  if (val === null || val === undefined) return null;
  const num = safeParse(val);
  if (!isNaN(num)) return num;
  const str = String(val).trim();
  return str === "" ? null : str;
};

const computeBasicStats = (vals = [], totalSamples = vals.length) => {
  const numbers = vals.map(safeParse).filter((n) => !isNaN(n));
  if (!numbers.length) {
    return { count: 0, mean: null, min: null, max: null };
  }

  const sum = numbers.reduce((a, b) => a + b, 0);

  return {
    count: numbers.length,              // valid results
    mean: sum / totalSamples,           // ✅ divided by total échantillons
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
};

/* ---------- component ---------- */
export default function DonneesGraphiques({ 
  clientId, 
  clientTypeCimentId, 
  produitInfo,
  produitDescription, 
  clients = [], 
  produits = [] 
}) {
  const { filteredTableData = [], filterPeriod = {} } = useData();

  const [limitsData, setLimitsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
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
      console.log("=== PRODUIT INFO COMPLETE STRUCTURE (Graphiques) ===", produitInfo);
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

  // Determine famille from product type if not available in produitInfo
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

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await fetch("/Data/parnorm.json");
        if (!res.ok) throw new Error("parnorm.json introuvable");
        const data = await res.json();
        setLimitsData(data);
        
        console.log("=== COMPLETE JSON STRUCTURE (Graphiques) ===");
        console.log(data);
        console.log("=== END JSON STRUCTURE ===");
        
      } catch (err) {
        console.error("Erreur fetch parnorm.json:", err);
        setLimitsData({});
      } finally {
        setLoading(false);
      }
    };
    fetchLimits();
  }, []);

  // Map parameter keys to match your JSON structure
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
    if (!mockKey || !limitsData[mockKey]) {
      addDebugLog(`❌ Parameter "${mockKey}" not found in JSON`);
      return { li: null, ls: null, lg: null };
    }

    const parameterData = limitsData[mockKey];
    
    let debugMessage = `🔍 Searching: ${mockKey} -> ${finalFamilleCode} -> ${selectedProductType} -> ${classe}`;
    
    // Check if famille exists in this parameter
    if (!parameterData[finalFamilleCode]) {
      const availableFamilles = Object.keys(parameterData).join(", ");
      debugMessage += `\n❌ Famille "${finalFamilleCode}" not found in ${mockKey}. Available: ${availableFamilles}`;
      addDebugLog(debugMessage);
      return { li: null, ls: null, lg: null };
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
        return { li: null, ls: null, lg: null };
      }

      const ajoutData = familleData[ajoutCode];
      debugMessage += `\n✅ Ajout code "${ajoutCode}" found`;
      
      const limits = {
        li: parseLimit(ajoutData.limitInf ?? ajoutData.limit_inf),
        ls: parseLimit(ajoutData.limitSup ?? ajoutData.limit_max),
        lg: parseLimit(ajoutData.garantie)
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
      return { li: null, ls: null, lg: null };
    }

    const limits = {
      li: parseLimit(classData.limit_inf ?? classData.limitInf),
      ls: parseLimit(classData.limit_max ?? classData.limitSup ?? classData.limitMax),
      lg: parseLimit(classData.garantie ?? classData.garantieValue),
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

  // Parameters list
  let parameters = [
    { key: "rc2j", label: "Résistance courante 2 jrs" },
    { key: "rc7j", label: "Résistance courante 7 jrs" },
    { key: "rc28j", label: "Résistance courante 28 jrs" },
    { key: "prise", label: "Temp debut de prise" },
    { key: "stabilite", label: "Stabilité" },
    { key: "hydratation", label: "Chaleur d'Hydratation" },
    { key: "pfeu", label: "Perte au Feu" },
    { key: "r_insoluble", label: "Résidu Insoluble" },
    { key: "so3", label: "Teneur en sulfate" },
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

  const classes = [
    "32.5 L", "32.5 N", "32.5 R",
    "42.5 L", "42.5 N", "42.5 R", 
    "52.5 L", "52.5 N", "52.5 R"
  ];

  const currentLimits = useMemo(() => {
    if (!selectedParameter || !selectedClass) {
      return { li: null, ls: null, lg: null };
    }
    return getLimitsByClass(selectedClass, selectedParameter);
  }, [selectedParameter, selectedClass, limitsData, finalFamilleCode, selectedProductType]);

  const chartData = useMemo(() => {
    if (!selectedParameter) return [];
    return (filteredTableData || []).map((row, i) => ({
      x: i + 1,
      y: safeParse(row[selectedParameter]),
      raw: row,
    }));
  }, [filteredTableData, selectedParameter]);

  const derivedStats = useMemo(() => {
    if (!selectedParameter) return {};

    // take Y values from chartData (already parsed)
    const vals = chartData.map((p) => p.y);

    // ✅ totalSamples = filteredTableData.length (even if some values NaN)
    const basic = computeBasicStats(vals, filteredTableData.length);

    const li = typeof currentLimits.li === "number" ? currentLimits.li : null;
    const ls = typeof currentLimits.ls === "number" ? currentLimits.ls : null;
    const lg = typeof currentLimits.lg === "number" ? currentLimits.lg : null;

    const countBelow = (limit) =>
      limit != null ? vals.filter((v) => v < limit).length : 0;
    const countAbove = (limit) =>
      limit != null ? vals.filter((v) => v > limit).length : 0;
    const percent = (n) =>
      filteredTableData.length
        ? Math.round((n / filteredTableData.length) * 100)
        : 0;

    return {
      ...basic,
      moyenne: basic.mean != null ? Number(basic.mean.toFixed(2)) : null,
      limiteInf: li,
      limiteSup: ls,
      limiteGarantie: lg,
      countBelowInf: countBelow(li),
      countAboveSup: countAbove(ls),
      countBelowGarantie: countBelow(lg),
      percentBelowInf: percent(countBelow(li)),
      percentAboveSup: percent(countAbove(ls)),
      percentBelowGarantie: percent(countBelow(lg)),
    };
  }, [chartData, currentLimits, selectedParameter, filteredTableData.length]);

  if (loading) return <p className="no-data">Chargement des limites...</p>;
  if (!filteredTableData?.length)
    return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

  return (
    <div className="dg-root">
      <div className="dg-header">
        <h2>Données Graphiques</h2>
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
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
      </div>

      {/* Debug information */}
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
      </div>

      <div className="dg-top-controls">
        <div className="dg-parameter-selector">
          <h3>Paramètre</h3>
          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
          >
            <option value="">-- Sélectionner un paramètre --</option>
            {parameters.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="dg-classes-section">
          <h3>Classe</h3>
          <div className="dg-class-list">
            {classes.map((c) => (
              <label
                key={c}
                className={`dg-class ${selectedClass === c ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="dg-class"
                  value={c}
                  checked={selectedClass === c}
                  onChange={() => setSelectedClass(c)}
                />
                <span className="dg-class-text">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="dg-main">
        <div className="dg-chart-card">
          <h3>
            {selectedParameter && selectedClass
              ? `${parameters.find((p) => p.key === selectedParameter)?.label} | Classe ${selectedClass}`
              : "Sélectionnez paramètre & classe"}
          </h3>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Échantillon"  />
              <YAxis dataKey="y" name={selectedParameter} ticks={[0, 15, 30, 45, 60, 75]} />
              <Tooltip
                formatter={(val) =>
                  isNaN(val) ? "-" : Number(val).toFixed(2)
                }
              />
              <Legend />
              <Scatter
                name="Mesures"
                data={chartData}
                fill="#FFC107"
                shape="circle"
                size={5}
              />

              {typeof derivedStats.moyenne === "number" && !isNaN(derivedStats.moyenne) && (
                <ReferenceLine
                  y={derivedStats.moyenne}
                  stroke="#800020"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: "Moyenne", position: "right", fill: "#800020" }}
                />
              )}
              
              {/* Reference Lines with proper validation */}
              {typeof currentLimits.li === "number" && !isNaN(currentLimits.li) && (
                <ReferenceLine
                  y={currentLimits.li}
                  stroke="#2B90FF"
                  strokeWidth={2}
                  label={{ value: "LI", position: "right", fill: "#2B90FF" }}
                />
              )}
              {typeof currentLimits.ls === "number" && !isNaN(currentLimits.ls) && (
                <ReferenceLine
                  y={currentLimits.ls}
                  stroke="#18A558"
                  strokeWidth={2}
                  label={{ value: "LS", position: "right", fill: "#18A558" }}
                />
              )}
              {typeof currentLimits.lg === "number" && !isNaN(currentLimits.lg) && (
                <ReferenceLine
                  y={currentLimits.lg}
                  stroke="#E53935"
                  strokeWidth={2}
                  label={{ value: "LG", position: "right", fill: "#E53935" }}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <aside className="dg-side-panel">
          <div className="dg-stats-card">
            <h3>Statistiques</h3>
            <div className="dg-stat-row">
              <span>Moyenne</span>
              <strong>{derivedStats.moyenne ?? "-"}</strong>
            </div>
            <div className="dg-divider" />
            <div className="dg-limit-row">
              <div className="limit-dot li" />
              <div>
                <div>LI</div>
                <div>{currentLimits.li ?? "-"}</div>
              </div>
            </div>
            <div className="dg-limit-row">
              <div className="limit-dot ls" />
              <div>
                <div>LS</div>
                <div>{currentLimits.ls ?? "-"}</div>
              </div>
            </div>
            <div className="dg-limit-row">
              <div className="limit-dot lg" />
              <div>
                <div>LG</div>
                <div>{currentLimits.lg ?? "-"}</div>
              </div>
            </div>
            
            {/* Additional statistics */}
            {currentLimits.li !== null && (
              <div className="dg-stat-row">
                <span>En dessous de LI</span>
                <strong>{derivedStats.countBelowInf} ({derivedStats.percentBelowInf}%)</strong>
              </div>
            )}

            {currentLimits.ls !== null && (
              <div className="dg-stat-row">
                <span>Au dessus de LS</span>
                <strong>{derivedStats.countAboveSup} ({derivedStats.percentAboveSup}%)</strong>
              </div>
            )}

            {currentLimits.lg !== null && (
              <div className="dg-stat-row">
                <span>En dessous de LG</span>
                <strong>{derivedStats.countBelowGarantie} ({derivedStats.percentBelowGarantie}%)</strong>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
