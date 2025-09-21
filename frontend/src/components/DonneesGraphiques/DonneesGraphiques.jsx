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
const onlyNumberPart = (s) => {
  if (!s) return null;
  const m = String(s).match(/[\d]+(?:[.,]\d+)?/);
  return m ? m[0].replace(",", ".") : null;
};
const safeParse = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).toString().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
const parseLimit = (val) => {
  // return number when possible, else trimmed string, else null
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
export default function DonneesGraphiques({
  selectedType,        // optional (could be number or string)
  selectedCement,      // optional object { type_code, famille_code } if you have it
}) {
  const { filteredTableData = [], filterPeriod = {} } = useData();

  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await fetch("/Data/parnorm.json");
        if (!res.ok) throw new Error("parnorm.json introuvable");
        const data = await res.json();
        setMockDetails(data);
      } catch (err) {
        console.error("Erreur fetch parnorm.json:", err);
        setMockDetails({});
      } finally {
        setLoading(false);
      }
    };
    fetchLimits();
  }, []);

  // mapping front-end keys -> json keys (vérifie ces noms avec ton fichier)
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
    ajout: "Ajout",
  };

  // recherche robuste d'une ligne limits dans mockDetails
  const getLimitsByClass = (classe, paramKey, typeCodeMaybe) => {
    const mockKey = keyMapping[paramKey];
    if (!mockKey || !mockDetails[mockKey]) return { li: null, ls: null, lg: null };

    const arr = mockDetails[mockKey];
    const normClasse = normalize(classe);
    const normType = normalize(typeCodeMaybe ?? (selectedCement?.type_code ?? selectedType ?? ""));

    // 1) exact match classe + type_code/famille if provided
    let found = arr.find((it) => {
      return normalize(it.classe) === normClasse && (normType === "" || normalize(it.type_code) === normType || normalize(it.famille_code) === normType);
    });

    // 2) match only classe (normalized)
    if (!found) {
      found = arr.find((it) => normalize(it.classe) === normClasse);
    }

    // 3) try matching by number part (ex: "42.5N" vs "42.5 N")
    if (!found) {
      const wantNum = onlyNumberPart(classe);
      if (wantNum) {
        found = arr.find((it) => {
          const num = onlyNumberPart(it.classe);
          return num === wantNum;
        });
      }
    }

    // 4) fallback to "Tous" or first element
    if (!found) {
      found = arr.find((it) => normalize(it.classe) === normalize("Tous")) || arr[0] || null;
    }

    if (!found) return { li: null, ls: null, lg: null };

    return {
      li: parseLimit(found.limit_inf),
      ls: parseLimit(found.limit_max),
      lg: parseLimit(found.garantie),
      _raw: found, // utile pour debug
    };
  };

  // paramètres visibles
  const parameters = [
    { key: "rc2j", label: "Résistance courante 2 jrs " },
    { key: "rc7j", label: "Résistance courante 7 jrs" },
    { key: "rc28j", label: "Résistance courante 28 jrs" },
    { key: "prise", label: "Temp debut de prise " },
    { key: "stabilite", label: "Stabilité" },
    { key: "hydratation", label: "Chaaleur d'Hydratation" },
    { key: "pfeu", label: "Pert au Feu" },
    { key: "r_insoluble", label: "Résidu Insoluble" },
    { key: "so3", label: "Teneur en sulfate" },
    { key: "chlorure", label: "Chlorure" },
    { key: "pouzzolanicite", label: "Pouzzolanicité" },
    { key: "c3a", label: "C3A" },
    { key: "ajout", label: "Ajout" },

  ];


  const classes = ["32.5L", "32.5N", "32.5R", "42.5L", "42.5N", "42.5R", "52.5L", "52.5N", "52.5R"];

  // limites actuelles (number OR string OR null)
  const currentLimits = useMemo(() => {
    if (!selectedParameter || !selectedClass) return { li: null, ls: null, lg: null };
    return getLimitsByClass(selectedClass, selectedParameter);
  }, [selectedParameter, selectedClass, mockDetails, selectedType, selectedCement]);

  // chart data
  const chartData = useMemo(() => {
    if (!selectedParameter) return [];
    return (filteredTableData || []).map((row, i) => ({
      x: i + 1,
      y: safeParse(row[selectedParameter]),
      raw: row,
    }));
  }, [filteredTableData, selectedParameter]);

  // derived stats
  const derivedStats = useMemo(() => {
    const vals = chartData.map((p) => p.y).filter((v) => !isNaN(v));
    const basic = computeBasicStats(vals);

    const li = typeof currentLimits.li === "number" ? currentLimits.li : null;
    const ls = typeof currentLimits.ls === "number" ? currentLimits.ls : null;
    const lg = typeof currentLimits.lg === "number" ? currentLimits.lg : null;

    const countBelow = (limit) => (limit != null ? vals.filter((v) => v < limit).length : 0);
    const countAbove = (limit) => (limit != null ? vals.filter((v) => v > limit).length : 0);
    const percent = (n) => (basic.count ? Math.round((n / basic.count) * 100) : 0);

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
  if (!filteredTableData?.length) return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;


  return (
    <div className="dg-root">
      <div className="dg-header">
        <h2>Données Graphiques</h2>
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
      </div>

      <div className="dg-top-controls">
        <div className="dg-parameter-selector">
          <h3>Paramètre</h3>
          <select value={selectedParameter} onChange={(e) => setSelectedParameter(e.target.value)}>
            <option value="">-- Sélectionner un paramètre --</option>
            {parameters.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        <div className="dg-classes-section">
          <h3>Classe</h3>
          <div className="dg-class-list">
            {classes.map((c) => (
              <label key={c} className={`dg-class ${selectedClass === c ? "active" : ""}`}>
                <input type="radio" name="dg-class" value={c} checked={selectedClass === c} onChange={() => setSelectedClass(c)} />
                <span className="dg-class-text">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="dg-main">
        <div className="dg-chart-card">
          <h3>{selectedParameter && selectedClass ? `${parameters.find(p => p.key === selectedParameter)?.label} | Classe ${selectedClass}` : "Sélectionnez paramètre & classe"}</h3>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Échantillon" />
              <YAxis dataKey="y" name={selectedParameter} />
              <Tooltip formatter={(val) => (isNaN(val) ? "-" : Number(val).toFixed(2))} />
              <Legend />
              <Scatter name="Mesures" data={chartData} fill="#FFC107" shape="circle" />
              {typeof derivedStats.limiteInf === "number" && <ReferenceLine y={derivedStats.limiteInf} stroke="#2B90FF" label="LI" />}
              {typeof derivedStats.limiteSup === "number" && <ReferenceLine y={derivedStats.limiteSup} stroke="#18A558" label="LS" />}
              {typeof derivedStats.limiteGarantie === "number" && <ReferenceLine y={derivedStats.limiteGarantie} stroke="#E53935" label="LG" />}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <aside className="dg-side-panel">
          <div className="dg-stats-card">
            <h3>Statistiques</h3>
            <div className="dg-stat-row"><span>Moyenne</span><strong>{derivedStats.moyenne ?? "-"}</strong></div>
            <div className="dg-divider" />
            <div className="dg-limit-row"><div className="limit-dot li" /><div><div>LI</div><div>{String(currentLimits.li ?? "-")}</div></div></div>
            <div className="dg-limit-row"><div className="limit-dot ls" /><div><div>LS</div><div>{String(currentLimits.ls ?? "-")}</div></div></div>
            <div className="dg-limit-row"><div className="limit-dot lg" /><div><div>LG</div><div>{String(currentLimits.lg ?? "-")}</div></div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

