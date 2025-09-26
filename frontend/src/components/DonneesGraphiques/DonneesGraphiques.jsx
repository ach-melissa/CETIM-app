// src/components/DonneesGraphiques/DonneesGraphiques.jsx
import React, { useEffect, useMemo, useState } from "react";
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

const parseLimit = (val) => {
  if (val === null || val === undefined) return null;
  
  if (val === "" || val === "-") return null;
  
  const num = parseFloat(String(val).replace(',', '.'));
  if (!isNaN(num)) return num;
  
  const str = String(val).trim();
  return str === "" ? null : str;
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

  // Determine famille from product type if not available in produitInfo
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

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await fetch("/Data/parnorm.json");
        if (!res.ok) throw new Error("parnorm.json introuvable");
        const data = await res.json();
        setLimitsData(data);
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

  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !limitsData[mockKey]) {
      return { li: null, ls: null, lg: null };
    }

    const parameterData = limitsData[mockKey];
    
    if (!parameterData[finalFamilleCode]) {
      return { li: null, ls: null, lg: null };
    }

    const familleData = parameterData[finalFamilleCode];

    // For "ajout" parameter, the structure is different
    if (key === "ajt") {
      const ajoutCode = selectedProductType.split('/').pop()?.split('-').pop()?.trim();
      
      if (!ajoutCode || !familleData[ajoutCode]) {
        return { li: null, ls: null, lg: null };
      }

      const ajoutData = familleData[ajoutCode];
      
      const limits = {
        li: parseLimit(ajoutData.limitInf ?? ajoutData.limit_inf),
        ls: parseLimit(ajoutData.limitSup ?? ajoutData.limit_max),
        lg: parseLimit(ajoutData.garantie)
      };
      
      return limits;
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
      return { li: null, ls: null, lg: null };
    }

    const limits = {
      li: parseLimit(classData.limit_inf ?? classData.limitInf),
      ls: parseLimit(classData.limit_max ?? classData.limitSup ?? classData.limitMax),
      lg: parseLimit(classData.garantie ?? classData.garantieValue),
    };

    return limits;
  };

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

  // Utiliser calculateStats pour calculer les statistiques
  const derivedStats = useMemo(() => {
    if (!selectedParameter || !filteredTableData.length) {
      return { 
        count: 0, 
        min: "-", 
        max: "-", 
        mean: "-", 
        std: "-",
        belowLI: "-", 
        aboveLS: "-", 
        belowLG: "-", 
        percentLI: "-", 
        percentLS: "-", 
        percentLG: "-" 
      };
    }

    // Calculer les statistiques de base
    const basicStats = calculateStats(filteredTableData, selectedParameter);
    
    // Évaluer les limites
    const limitStats = evaluateLimits(
      filteredTableData, 
      selectedParameter, 
      currentLimits.li, 
      currentLimits.ls, 
      currentLimits.lg
    );

    return {
      ...basicStats,
      ...limitStats,
      // Assurer la compatibilité avec le code existant
      moyenne: basicStats.mean !== "-" ? Number(basicStats.mean) : null,
      limiteInf: currentLimits.li,
      limiteSup: currentLimits.ls,
      limiteGarantie: currentLimits.lg,
      // Mapper les noms pour la compatibilité
      countBelowInf: limitStats.belowLI !== "-" ? limitStats.belowLI : 0,
      countAboveSup: limitStats.aboveLS !== "-" ? limitStats.aboveLS : 0,
      countBelowGarantie: limitStats.belowLG !== "-" ? limitStats.belowLG : 0,
      percentBelowInf: limitStats.percentLI !== "-" ? parseFloat(limitStats.percentLI) : 0,
      percentAboveSup: limitStats.percentLS !== "-" ? parseFloat(limitStats.percentLS) : 0,
      percentBelowGarantie: limitStats.percentLG !== "-" ? parseFloat(limitStats.percentLG) : 0,
    };
  }, [filteredTableData, selectedParameter, currentLimits]);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    if (!selectedParameter) return [];
    
    return filteredTableData.map((row, i) => {
      const value = row[selectedParameter];
      let numericValue = NaN;
      
      // Utiliser la même logique de parsing que calculateStats
      if (value !== null && value !== undefined && value !== "" && value !== " " && 
          value !== "NULL" && value !== "null" && value !== "undefined") {
        try {
          const stringValue = String(value).trim().replace(',', '.');
          numericValue = parseFloat(stringValue);
          if (isNaN(numericValue) || !isFinite(numericValue)) {
            numericValue = NaN;
          }
        } catch (error) {
          numericValue = NaN;
        }
      }
      
      return {
        x: i + 1,
        y: numericValue,
        raw: row,
      };
    });
  }, [filteredTableData, selectedParameter]);

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
                data={chartData.filter(point => !isNaN(point.y))}
                fill="#FFC107"
                shape="circle"
                size={5}
              />

              {derivedStats.mean !== "-" && !isNaN(derivedStats.mean) && (
                <ReferenceLine
                  y={parseFloat(derivedStats.mean)}
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
              <strong>{derivedStats.mean !== "-" ? derivedStats.mean : "-"}</strong>
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
                <strong>{derivedStats.belowLI} {derivedStats.percentLI !== "-" ? `(${derivedStats.percentLI}%)` : ""}</strong>
              </div>
            )}

            {currentLimits.ls !== null && (
              <div className="dg-stat-row">
                <span>Au dessus de LS</span>
                <strong>{derivedStats.aboveLS} {derivedStats.percentLS !== "-" ? `(${derivedStats.percentLS}%)` : ""}</strong>
              </div>
            )}

            {currentLimits.lg !== null && (
              <div className="dg-stat-row">
                <span>En dessous de LG</span>
                <strong>{derivedStats.belowLG} {derivedStats.percentLG !== "-" ? `(${derivedStats.percentLG}%)` : ""}</strong>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
