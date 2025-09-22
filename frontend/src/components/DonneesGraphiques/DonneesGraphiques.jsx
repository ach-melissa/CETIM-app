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

const computeBasicStats = (vals = []) => {
  const numbers = vals.map(safeParse).filter((n) => !isNaN(n));
  if (!numbers.length) return { count: 0, mean: null, min: null, max: null };
  const sum = numbers.reduce((a, b) => a + b, 0);
  return {
    count: numbers.length,
    mean: sum / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
};

/* ---------- component ---------- */
export default function DonneesGraphiques({ selectedType, selectedCement }) {
  const { filteredTableData = [], filterPeriod = {} } = useData();

  const [limitsData, setLimitsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedProductFamily, setSelectedProductFamily] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");

  useEffect(() => {
    if (selectedCement) {
      setSelectedProductFamily(selectedCement.famille_code || "");
      setSelectedProductType(selectedCement.type_code || "");
    }
  }, [selectedCement]);

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

  // Map parameter keys to match your JSON structure (same as DonneesStatistiques)
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
    pouzzolanicite: "pouzzolanicite",
    c3a: "C3A",
    ajout: "ajout"
  };

  // Use the same getLimitsByClass function 
  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !limitsData[mockKey]) return { li: null, ls: null, lg: null };

    // Navigate the nested structure: parameter -> family -> type -> classes
    const parameterData = limitsData[mockKey];
    
    // If we have both family and type, try to find the exact match
    if (selectedProductFamily && selectedProductType && parameterData[selectedProductFamily]) {
      const familyData = parameterData[selectedProductFamily];
      
      if (familyData[selectedProductType]) {
        const typeData = familyData[selectedProductType];
        const found = typeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: parseLimit(found.limit_inf),
            ls: parseLimit(found.limit_max),
            lg: parseLimit(found.garantie),
          };
        }
      }
    }
    
    // If exact match not found, try to find in the general family section
    if (selectedProductFamily && parameterData[selectedProductFamily]) {
      const familyData = parameterData[selectedProductFamily];
      
      // Look for a general type (like "CEM I" without specific subtype)
      if (familyData[selectedProductFamily]) {
        const generalTypeData = familyData[selectedProductFamily];
        const found = generalTypeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: parseLimit(found.limit_inf),
            ls: parseLimit(found.limit_max),
            lg: parseLimit(found.garantie),
          };
        }
      }
      
      // If still not found, try any type in the family
      for (const typeKey in familyData) {
        const typeData = familyData[typeKey];
        const found = typeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: parseLimit(found.limit_inf),
            ls: parseLimit(found.limit_max),
            lg: parseLimit(found.garantie),
          };
        }
      }
    }
    
    // If still not found, try any family and type
    for (const familyKey in parameterData) {
      const familyData = parameterData[familyKey];
      for (const typeKey in familyData) {
        const typeData = familyData[typeKey];
        const found = typeData.find(item => item.classe === classe);
        if (found) {
          return {
            li: parseLimit(found.limit_inf),
            ls: parseLimit(found.limit_max),
            lg: parseLimit(found.garantie),
          };
        }
      }
    }
    
    // Default fallback
    return { li: null, ls: null, lg: null };
  };

  const parameters = [
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
    { key: "pouzzolanicite", label: "Pouzzolanicité" },
  ];
  
  // Add C3A only for type 1 (like in DonneesStatistiques)
  if (Number(selectedType) === 1) {
    parameters.push({ key: "c3a", label: "C3A" });
  }
  
  parameters.push({ key: "ajout", label: "Ajout" });

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
  }, [selectedParameter, selectedClass, limitsData, selectedProductFamily, selectedProductType]);

  const chartData = useMemo(() => {
    if (!selectedParameter) return [];
    return (filteredTableData || []).map((row, i) => ({
      x: i + 1,
      y: safeParse(row[selectedParameter]),
      raw: row,
    }));
  }, [filteredTableData, selectedParameter]);

  const derivedStats = useMemo(() => {
    const vals = chartData.map((p) => p.y).filter((v) => !isNaN(v));
    const basic = computeBasicStats(vals);

    const li = typeof currentLimits.li === "number" ? currentLimits.li : null;
    const ls = typeof currentLimits.ls === "number" ? currentLimits.ls : null;
    const lg = typeof currentLimits.lg === "number" ? currentLimits.lg : null;

    const countBelow = (limit) => limit != null ? vals.filter((v) => v < limit).length : 0;
    const countAbove = (limit) => limit != null ? vals.filter((v) => v > limit).length : 0;
    const percent = (n) => basic.count ? Math.round((n / basic.count) * 100) : 0;

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
  }, [chartData, currentLimits]);

  if (loading) return <p className="no-data">Chargement des limites...</p>;
  if (!filteredTableData?.length)
    return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

  return (
    <div className="dg-root">
      <div className="dg-header">
        <h2>Données Graphiques</h2>
        <p>
          Période: {filterPeriod.start} à {filterPeriod.end}
        </p>
        {selectedProductFamily && <p><strong>Famille: {selectedProductFamily}</strong></p>}
        {selectedProductType && <p><strong>Type: {selectedProductType}</strong></p>}
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
              <XAxis dataKey="x" name="Échantillon" />
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
              />
              
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



