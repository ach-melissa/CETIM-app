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

// -------- Utils --------
const safeParse = (v) => {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? NaN : n;
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

// -------- Component --------
export default function DonneesGraphiques({
  clientId,
  produitId,
  selectedType,
  produitDescription,
  clients = [],
  produits = [],
  selectedCement,
}) {
  const { filteredTableData, filterPeriod } = useData();

  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // Charger les limites depuis JSON
  useEffect(() => {
    const fetchMockDetails = async () => {
      try {
        const res = await fetch("/Data/parnorm.json");
        if (!res.ok) throw new Error("Erreur lors du chargement des données");
        const data = await res.json();
        setMockDetails(data);
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setMockDetails({});
      } finally {
        setLoading(false);
      }
    };
    fetchMockDetails();
  }, []);

  // Mapping paramètres -> clés du JSON
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

  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !mockDetails[mockKey]) return { li: "-", ls: "-", lg: "-" };
    let found = mockDetails[mockKey].find((i) => i.classe === classe)
      || mockDetails[mockKey].find((i) => i.classe === "Tous")
      || mockDetails[mockKey][0];
    return {
      li: found?.limit_inf ?? "-",
      ls: found?.limit_max ?? "-",
      lg: found?.garantie ?? "-",
    };
  };

  // Liste des paramètres disponibles
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

  const classes = ["32.5L", "32.5N", "32.5R", "42.5L", "42.5N", "42.5R", "52.5L", "52.5N", "52.5R"];

  // Limites en fonction classe + paramètre
  const currentLimits = useMemo(() => {
    if (!selectedClass || !selectedParameter) return { li: "-", ls: "-", lg: "-" };
    return getLimitsByClass(selectedClass, selectedParameter);
  }, [selectedClass, selectedParameter, mockDetails]);

  // Données chart
  const chartData = useMemo(() => {
    if (!selectedParameter) return [];
    return (filteredTableData || []).map((row, i) => ({
      x: i + 1,
      y: safeParse(row[selectedParameter]),
    }));
  }, [filteredTableData, selectedParameter]);

  // Stats dérivées
  const derivedStats = useMemo(() => {
    const vals = chartData.map((p) => p.y).filter((v) => !isNaN(v));
    const basic = computeBasicStats(vals);

    const li = currentLimits.li !== "-" ? parseFloat(currentLimits.li) : null;
    const ls = currentLimits.ls !== "-" ? parseFloat(currentLimits.ls) : null;
    const lg = currentLimits.lg !== "-" ? parseFloat(currentLimits.lg) : null;

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

  // Labels lisibles
  const parameterLabels = {
    rc2j: "Résistance à 2 jours",
    rc7j: "Résistance à 7 jours",
    rc28j: "Résistance à 28 jours",
    prise: "Temps de début de prise",
    stabilite: "Stabilité",
    hydratation: "Chaleur d'hydratation",
    so3: "SO3",
    c3a: "C3A",
    pfeu: "Pertes au feu",
    r_insoluble: "Résidu insoluble",
    chlorure: "Teneur en chlorure",
    ajout_percent: "Pourcentage d'ajout",
  };

  const getTitle = () =>
    selectedClass && selectedParameter
      ? `${parameterLabels[selectedParameter] || selectedParameter} | Classe ${selectedClass}`
      : "Sélectionnez un paramètre et une classe";

  const tooltipFormatter = (val, name) =>
    isNaN(val) ? ["-", name] : [val.toFixed(2), name];

  // Actions
  const handleExport = () => alert("Exporting...");
  const handlePrint = () => alert("Printing...");
  const handleSave = () => alert("Saving...");

  // --- Render ---
  if (loading) return <p className="no-data">Chargement des données de référence...</p>;
  if (!filteredTableData?.length) return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

  return (
    <div className="dg-root">
      <div className="dg-header">
        <h2>Données Graphiques</h2>
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>

        {selectedCement && (
          <div className="selected-cement-info">
            <h3>{selectedCement.name}</h3>
            <p>Type: {selectedCement.type} | Classe: {selectedCement.class}</p>
            {selectedCement.description && <p><strong>Description:</strong> {selectedCement.description}</p>}
          </div>
        )}
      </div>

      <div className="dg-top-controls">
        {/* Paramètre */}
        <div className="dg-parameter-selector">
          <h3>Paramètre</h3>
          <select value={selectedParameter} onChange={(e) => setSelectedParameter(e.target.value)}>
            <option value="">-- Sélectionner un paramètre --</option>
            {parameters.map((param) => (
              <option key={param.key} value={param.key}>{param.label}</option>
            ))}
          </select>
        </div>

        {/* Classes */}
        <div className="dg-classes-section">
          <h3>Classes de Résistance</h3>
          <div className="dg-class-list">
            {classes.map((classe) => (
              <label key={classe} className={`dg-class ${selectedClass === classe ? "active" : ""}`}>
                <input
                  type="radio"
                  name="dg-class"
                  value={classe}
                  checked={selectedClass === classe}
                  onChange={() => setSelectedClass(classe)}
                />
                <span className="dg-class-text">{classe}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="dg-main">
        {/* Chart */}
        <div className="dg-chart-card">
          <h3>{getTitle()}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Échantillon" tick={{ fontSize: 12 }} />
              <YAxis dataKey="y" name={selectedParameter} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipFormatter} cursor={{ strokeDasharray: "3 3" }} />
              <Legend />

              <Scatter name="Mesures" data={chartData} fill="#FFC107" shape="square" size={8} />

              {derivedStats.limiteInf != null && (
                <ReferenceLine y={derivedStats.limiteInf} stroke="#2B90FF" strokeWidth={2} label={{ value: "LI", position: "right" }} />
              )}
              {derivedStats.limiteSup != null && (
                <ReferenceLine y={derivedStats.limiteSup} stroke="#18A558" strokeWidth={2} label={{ value: "LS", position: "right" }} />
              )}
              {derivedStats.limiteGarantie != null && (
                <ReferenceLine y={derivedStats.limiteGarantie} stroke="#E53935" strokeWidth={2} label={{ value: "LG", position: "right" }} />
              )}
              {derivedStats.moyenne != null && (
                <ReferenceLine y={derivedStats.moyenne} stroke="#8B5E3C" strokeDasharray="5 5" strokeWidth={2} label={{ value: "Moyenne", position: "right" }} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Side panel */}
        <aside className="dg-side-panel">
          <div className="dg-stats-card">
            <h3>Statistiques</h3>
            <div className="dg-stat-row"><span>Nombre d'échantillons</span><strong>{derivedStats.count}</strong></div>
            <div className="dg-stat-row"><span>Moyenne</span><strong>{derivedStats.moyenne ?? "-"}</strong></div>
            <div className="dg-stat-row"><span>Min</span><strong>{derivedStats.min ?? "-"}</strong></div>
            <div className="dg-stat-row"><span>Max</span><strong>{derivedStats.max ?? "-"}</strong></div>

            <div className="dg-divider" />

            {/* Limits section */}
            <div className="dg-limit-section">
              <div className="dg-limit-row">
                <div className="limit-dot li" />
                <div>
                  <div className="limit-label">Limite inférieure (LI)</div>
                  <div className="limit-value">{derivedStats.limiteInf ?? "-"}</div>
                  <div className="limit-sub">N &lt; LI: {derivedStats.countBelowInf} ({derivedStats.percentBelowInf}%)</div>
                </div>
              </div>
              <div className="dg-limit-row">
                <div className="limit-dot ls" />
                <div>
                  <div className="limit-label">Limite supérieure (LS)</div>
                  <div className="limit-value">{derivedStats.limiteSup ?? "-"}</div>
                  <div className="limit-sub">N &gt; LS: {derivedStats.countAboveSup} ({derivedStats.percentAboveSup}%)</div>
                </div>
              </div>
              <div className="dg-limit-row">
                <div className="limit-dot lg" />
                <div>
                  <div className="limit-label">Limite garantie (LG)</div>
                  <div className="limit-value">{derivedStats.limiteGarantie ?? "-"}</div>
                  <div className="limit-sub">N &lt; LG: {derivedStats.countBelowGarantie} ({derivedStats.percentBelowGarantie}%)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dg-actions">
            <button className="btn ghost" onClick={handleExport} disabled={!filteredTableData.length}>Exporter</button>
            <button className="btn ghost" onClick={handlePrint} disabled={!filteredTableData.length}>Imprimer</button>
            <button className="btn primary" onClick={handleSave} disabled={!filteredTableData.length}>Sauvegarder</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
