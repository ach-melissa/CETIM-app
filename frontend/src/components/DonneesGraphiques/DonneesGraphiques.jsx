import React, { useEffect, useMemo, useState } from "react";
import "./DonneesGraphiques.css";
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

const safeParse = (v) => {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? NaN : n;
};

const computeBasicStats = (vals = []) => {
  const numbers = vals.map(safeParse).filter((n) => !isNaN(n));
  if (!numbers.length) return { count: 0, mean: null, min: null, max: null };
  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return { count, mean, min, max };
};

export default function DonneesGraphiques({
  parameters = [],
  selectedParameter,
  setSelectedParameter = () => {},
  classOptions = {},
  selectedClass,
  setSelectedClass = () => {},
  chartStats = {},
  tableData = [],
  handleExport = () => {},
  handlePrint = () => {},
  handleSave = () => {},
}) {
  const [localParameter, setLocalParameter] = useState(selectedParameter || "");

  // if the parent didn't pass parameter list, infer from tableData
  const inferredParameters = useMemo(() => {
    if (parameters && parameters.length) return parameters;
    if (!tableData || !tableData.length) return [];
    const first = tableData.find(Boolean);
    if (!first) return [];
    return Object.keys(first)
      .filter((k) => k !== "id" && k !== "date")
      .map((k) => ({ id: k, label: k }))
      .filter((p) => {
        // keep keys that contain numeric values somewhere
        return tableData.some((row) => !isNaN(safeParse(row[p.id])));
      });
  }, [parameters, tableData]);

  // keep selectedParameter synced with parent OR local state
  useEffect(() => {
    if (!selectedParameter && inferredParameters.length) {
      setLocalParameter(inferredParameters[0].id);
      setSelectedParameter(inferredParameters[0].id);
    }
    // if parent controls it, use it
    if (selectedParameter) setLocalParameter(selectedParameter);
  }, [selectedParameter, inferredParameters, setSelectedParameter]);

  const effectiveParameter = selectedParameter || localParameter;

  const chartData = useMemo(() => {
    if (!effectiveParameter) return [];
    return (tableData || []).map((row, i) => ({
      x: i + 1,
      y: safeParse(row[effectiveParameter]),
      raw: row,
    }));
  }, [tableData, effectiveParameter]);

  // compute stats (mean, counts). If chartStats prop is provided with limits, use them
  const derivedStats = useMemo(() => {
    const vals = chartData.map((p) => p.y).filter((v) => !isNaN(v));
    const basic = computeBasicStats(vals);

    // use provided lines if available
    const li = chartStats.limiteInf ?? null;
    const ls = chartStats.limiteSup ?? null;
    const lg = chartStats.limiteGarantie ?? null;

    const countBelowLi = li != null ? vals.filter((v) => v < Number(li)).length : 0;
    const countAboveLs = ls != null ? vals.filter((v) => v > Number(ls)).length : 0;
    const countBelowLg = lg != null ? vals.filter((v) => v < Number(lg)).length : 0;
    const percent = (n) => (basic.count ? Math.round((n / basic.count) * 100) : 0);

    return {
      ...basic,
      moyenne: basic.mean != null ? Number(basic.mean.toFixed(2)) : null,
      limiteInf: li != null ? Number(li) : null,
      limiteSup: ls != null ? Number(ls) : null,
      limiteGarantie: lg != null ? Number(lg) : null,
      countBelowInf: countBelowLi,
      countAboveSup: countAboveLs,
      countBelowGarantie: countBelowLg,
      percentBelowInf: percent(countBelowLi),
      percentAboveSup: percent(countAboveLs),
      percentBelowGarantie: percent(countBelowLg),
    };
  }, [chartData, chartStats]);

  // Generate title based on selected class
  const getTitle = () => {
    if (!selectedClass) return "Résistance courante 28 | classe 42.5 N";
    return `Résistance courante 28 | classe ${selectedClass}`;
  };

  // tooltip formatter
  const tooltipFormatter = (value, name, props) => {
    if (value === null || value === undefined || isNaN(value)) return ["-", name];
    return [value, name];
  };

  return (
    <div className="dg-root">
      <div className="dg-header">
        <h2>{getTitle()}</h2>
      </div>

      <div className="dg-top-controls">
        <div className="dg-classes-section">
          <h3>Classes</h3>
          <div className="dg-class-groups">
            {Object.entries(classOptions || {}).map(([famille, classes]) => (
              <div className="dg-class-group" key={famille}>
                
                <div className="dg-class-list">
                  {(classes || []).map((c) => (
                    <label key={c} className={`dg-class ${selectedClass === c ? "active" : ""}`}>
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
            ))}
          </div>
        </div>
      </div>

      <div className="dg-main">
        <div className="dg-chart-card">
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Echantillon" tick={{ fontSize: 12 }} />
              <YAxis dataKey="y" name={effectiveParameter} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipFormatter} cursor={{ strokeDasharray: "3 3" }} />
              <Legend />

              <Scatter
                name="Mesures"
                data={chartData}
                fill="#FFC107"
                shape="square"
                line={false}
                legendType="square"
                size={80}
              />

              {derivedStats.limiteInf != null && (
                <ReferenceLine
                  y={derivedStats.limiteInf}
                  stroke="#2B90FF"
                  strokeWidth={2}
                  label={{ value: "LI", position: "right" }}
                />
              )}
              {derivedStats.limiteSup != null && (
                <ReferenceLine
                  y={derivedStats.limiteSup}
                  stroke="#18A558"
                  strokeWidth={2}
                  label={{ value: "LS", position: "right" }}
                />
              )}
              {derivedStats.limiteGarantie != null && (
                <ReferenceLine
                  y={derivedStats.limiteGarantie}
                  stroke="#E53935"
                  strokeWidth={2}
                  label={{ value: "LG", position: "right" }}
                />
              )}
              {derivedStats.moyenne != null && (
                <ReferenceLine
                  y={derivedStats.moyenne}
                  stroke="#8B5E3C"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ value: "Moyenne", position: "right" }}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <aside className="dg-side-panel">
          <div className="dg-stats-card">
            <h3>Statistiques</h3>
            <div className="dg-stat-row">
              <span>Nombre d'échantillons</span>
              <strong>{derivedStats.count}</strong>
            </div>
            <div className="dg-stat-row">
              <span>Moyenne</span>
              <strong>{derivedStats.moyenne ?? "-"}</strong>
            </div>
            <div className="dg-stat-row">
              <span>Min</span>
              <strong>{derivedStats.min ?? "-"}</strong>
            </div>
            <div className="dg-stat-row">
              <span>Max</span>
              <strong>{derivedStats.max ?? "-"}</strong>
            </div>

            <div className="dg-divider" />

            <div className="dg-limit-section">
              <div className="dg-limit-row">
                <div className="limit-dot li" />
                <div>
                  <div className="limit-label">Limite inférieure</div>
                  <div className="limit-value">{derivedStats.limiteInf ?? "-"}</div>
                  <div className="limit-sub">
                    N &lt;= 42,5 MPa : {derivedStats.countBelowInf} ({derivedStats.percentBelowInf}%)
                  </div>
                </div>
              </div>

              <div className="dg-limit-row">
                <div className="limit-dot ls" />
                <div>
                  <div className="limit-label">Limite supérieure</div>
                  <div className="limit-value">{derivedStats.limiteSup ?? "-"}</div>
                  <div className="limit-sub">
                    N &gt;= 62,5 MPa : {derivedStats.countAboveSup} ({derivedStats.percentAboveSup}%)
                  </div>
                </div>
              </div>

              <div className="dg-limit-row">
                <div className="limit-dot lg" />
                <div>
                  <div className="limit-label">Limite garantie</div>
                  <div className="limit-value">{derivedStats.limiteGarantie ?? "-"}</div>
                  <div className="limit-sub">
                    N &lt;= 40 MPa : {derivedStats.countBelowGarantie} ({derivedStats.percentBelowGarantie}%)
                  </div>
                </div>
              </div>
            </div>

            <div className="dg-divider" />
            
            <div className="dg-average-row">
              <span>Moyenne</span>
              <strong className="average-value">{derivedStats.moyenne ?? "-"}</strong>
            </div>
          </div>
          
          <div className="dg-actions">
            <button className="btn ghost" onClick={handleExport} disabled={!tableData.length}>
              Exporter
            </button>
            <button className="btn ghost" onClick={handlePrint} disabled={!tableData.length}>
              Imprimer
            </button>
            <button className="btn primary" onClick={handleSave} disabled={!tableData.length}>
              Sauvegarder
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}