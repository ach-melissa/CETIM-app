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
  LineChart,
  Line,
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

  // Vérifier si les limites sont définies
  const hasLI = !isNaN(liNum);
  const hasLS = !isNaN(lsNum);
  const hasLG = !isNaN(lgNum);

  const belowLI = hasLI ? values.filter((v) => v < liNum).length : 0;
  const aboveLS = hasLS ? values.filter((v) => v > lsNum).length : 0;
  
  // ✅ CORRECTION : Logique améliorée pour belowLG selon le type de paramètre
  let belowLG = 0;
  
  if (hasLG) {
    const resistanceParams = ['rc2j', 'rc7j', 'rc28j', 'prise'];
    const isResistanceParam = resistanceParams.includes(key);
    
    if (isResistanceParam) {
      // Résistances : belowLG = valeurs TROP BAISSES
      belowLG = values.filter((v) => v < lgNum).length;
    } else {
      // Autres paramètres : belowLG = valeurs TROP ÉLEVÉES
      belowLG = values.filter((v) => v > lgNum).length;
    }
  }

  const total = values.length;

  return {
    belowLI: hasLI ? belowLI : 0,
    aboveLS: hasLS ? aboveLS : 0,
    belowLG: hasLG ? belowLG : 0,
    percentLI: hasLI ? ((belowLI / total) * 100).toFixed(1) : "0.0",
    percentLS: hasLS ? ((aboveLS / total) * 100).toFixed(1) : "0.0",
    percentLG: hasLG ? ((belowLG / total) * 100).toFixed(1) : "0.0",
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

// Function to extract and format date from row data
const extractDateFromRow = (row, index) => {
  // Try different possible date field names
  const dateFields = [
    'date', 'Date', 'DATE', 
    'date_essai', 'date_prelevement', 'created_at',
    'ech_date', 'sample_date', 'test_date',
    'datemesure', 'date_mesure', 'date_chantier',
    'date_reception', 'date_analyse', 'date_fabrication'
  ];
  
  // Also check for any field that contains 'date' (case insensitive)
  const allFields = Object.keys(row);
  const dateLikeFields = allFields.filter(field => 
    field.toLowerCase().includes('date') || 
    field.toLowerCase().includes('jour') ||
    field.toLowerCase().includes('time')
  );
  
  // Combine explicit and discovered date fields
  const allDateFields = [...new Set([...dateFields, ...dateLikeFields])];

  for (const field of allDateFields) {
    if (row[field] && row[field] !== "" && row[field] !== " ") {
      const dateValue = row[field];
      
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // If it's a string, try to parse it with different formats
      if (typeof dateValue === 'string') {
        // Remove any extra characters like commas, currency symbols, etc.
        const cleanDateString = dateValue.toString().replace(/[,\s€$]/g, '').trim();
        
        if (cleanDateString === "" || cleanDateString === "NULL" || cleanDateString === "null") {
          continue;
        }
        
        // Try parsing as ISO format (YYYY-MM-DD)
        let parsedDate = new Date(cleanDateString);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
        
        // Try DD/MM/YYYY format (most common in French)
        const slashParts = cleanDateString.split('/');
        if (slashParts.length === 3) {
          const day = slashParts[0].padStart(2, '0');
          const month = slashParts[1].padStart(2, '0');
          const year = slashParts[2].length === 2 ? `20${slashParts[2]}` : slashParts[2];
          parsedDate = new Date(`${year}-${month}-${day}`);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
        
        // Try DD-MM-YYYY format
        const dashParts = cleanDateString.split('-');
        if (dashParts.length === 3) {
          if (dashParts[0].length === 4) {
            // YYYY-MM-DD format
            parsedDate = new Date(cleanDateString);
          } else {
            // DD-MM-YYYY format
            const day = dashParts[0].padStart(2, '0');
            const month = dashParts[1].padStart(2, '0');
            const year = dashParts[2].length === 2 ? `20${dashParts[2]}` : dashParts[2];
            parsedDate = new Date(`${year}-${month}-${day}`);
          }
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
        
        // Try MM/DD/YYYY format (common in some systems)
        if (slashParts.length === 3) {
          const month = slashParts[0].padStart(2, '0');
          const day = slashParts[1].padStart(2, '0');
          const year = slashParts[2].length === 2 ? `20${slashParts[2]}` : slashParts[2];
          parsedDate = new Date(`${year}-${month}-${day}`);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
      
      // If it's a timestamp (number)
      if (typeof dateValue === 'number') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
  }
  
  // Fallback: use index to maintain order with actual dates
  // Start from a recent date and add days based on index
  const baseDate = new Date(); // Today's date
  baseDate.setDate(baseDate.getDate() + index); // Add index as days
  return baseDate;
};

// Function to format date for display
const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Format as DD/MM/YYYY
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// Function to format date for tooltip
const formatDateForTooltip = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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
  const [chartType, setChartType] = useState("scatter"); // "scatter" | "gaussian"

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

  // Préparer les données pour le graphique avec les dates
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
      
      // Extract date from row with index for fallback
      const date = extractDateFromRow(row, i);
      const formattedDate = formatDateForDisplay(date);
      
      return {
        x: i + 1, // Keep index as fallback
        date: date.getTime(), // Use timestamp for proper ordering
        formattedDate: formattedDate,
        y: numericValue,
        raw: row,
        fullDate: formatDateForTooltip(date),
        index: i // Keep original index
      };
    });
  }, [filteredTableData, selectedParameter]);

  // Custom XAxis tick formatter to show dates with rotation - AFFICHER TOUTES LES DATES
// Custom XAxis tick formatter to show dates with vertical orientation
const renderDateTicks = (props) => {
  const { x, y, payload } = props;
  const dataIndex = payload.value - 1; // Convert back to array index
  
  if (chartData[dataIndex] && chartData[dataIndex].formattedDate) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill="#666" 
          fontSize={10}
          transform="rotate(-90)" // Changed from -45 to -90 for vertical orientation
        >
          {chartData[dataIndex].formattedDate}
        </text>
      </g>
    );
  }
  
  // Fallback to index if no date
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="end" 
        fill="#666" 
        fontSize={10}
        transform="rotate(-90)" // Changed from -45 to -90 for vertical orientation
      >
        {`Éch. ${payload.value}`}
      </text>
    </g>
  );
};

  // Custom tooltip to show date and value
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataIndex = label - 1;
      const dataPoint = chartData[dataIndex];
      
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {dataPoint && dataPoint.fullDate && (
            <p className="tooltip-date" style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
              {`Date: ${dataPoint.fullDate}`}
            </p>
          )}
          <p className="tooltip-value" style={{ margin: 0 }}>
            {`Valeur: ${payload[0].value?.toFixed(2) || 'N/A'}`}
          </p>
          {dataPoint && (
            <p className="tooltip-sample" style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
              {`Échantillon #${dataPoint.x}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getGaussianData = (mean, std, count = 100) => {
    if (!mean || !std || isNaN(mean) || isNaN(std)) return [];

    const data = [];
    const minX = mean - 4 * std;
    const maxX = mean + 4 * std;
    const step = (maxX - minX) / count;

    for (let i = 0; i <= count; i++) {
      const x = minX + i * step;
      const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
      data.push({ x, y });
    }
    return data;
  };

  const gaussianData = useMemo(() => {
    if (!derivedStats.moyenne || !derivedStats.std) return [];
    return getGaussianData(derivedStats.moyenne, parseFloat(derivedStats.std));
  }, [derivedStats]);

  if (loading) return <p className="no-data">Chargement des limites...</p>;
  if (!filteredTableData?.length)
    return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

  return (
    <div className="dg-root">  
      <div style={{ marginBottom: "1rem" }}>
        <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
        <h2>Données Graphiques</h2>
        {produitInfo && (
          <>
            <p><strong> {produitInfo.nom} ( {produitInfo.description} )</strong></p>
          </>
        )}
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
        <p>Nombre d'échantillons: {chartData.length}</p>
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
      </div>

      <div className="dg-main-container">
        <div className="dg-main">
          <div className="dg-chart-card">
            <h3>
              {selectedParameter && selectedClass
                ? `${parameters.find((p) => p.key === selectedParameter)?.label} | Classe ${selectedClass}`
                : "Sélectionnez paramètre & classe"}
            </h3>
            
            <ResponsiveContainer width="100%" height={500}>
              {chartType === "scatter" ? (
                <ScatterChart 
                  margin={{ top: 20, right: 20, bottom: 100, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
<XAxis 
  dataKey="x" 
  name="Date" 
  tick={renderDateTicks}
  interval={0}
  height={80}
  allowDataOverflow={true}
  angle={-90}
  textAnchor="end"
  tickMargin={5}
  padding={{ left: 5, right: 5 }} // Add padding on sides
  minTickGap={15} // Minimum gap between ticks
/>
                  <YAxis 
                    dataKey="y" 
                    name={selectedParameter} 
                    domain={[0, 75]}
                    ticks={[0, 15, 30, 45, 60, 75]}
                    allowDataOverflow={true}
                    width={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Scatter
                    name="Mesures"
                    data={chartData.filter((point) => !isNaN(point.y))}
                    fill="#FFC107"
                    shape="circle"
                    size={6}
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
              ) : (
                <LineChart
                  data={gaussianData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis dataKey="y" />
                  <Tooltip formatter={(val) => (isNaN(val) ? "-" : Number(val).toFixed(4))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="#FF0000"
                    strokeWidth={2}
                    dot={false}
                    name="Courbe Gaussienne"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="dg-side-panel">
          <div className="dg-stats-card">
            <h3>Statistiques</h3>
            
            {/* Section Classe dans la carte de statistiques */}
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

            <div className="dg-divider" />
            
            {/* Statistiques des limites - TOUJOURS affichées */}
            <div className="dg-stat-row">
              <div className="limit-name li">Limit inferieur</div>
              <div>
                <span>N ≤ {currentLimits.li ?? "-"} : </span>
                <strong>{derivedStats.belowLI} {derivedStats.percentLI !== "-" ? `(${derivedStats.percentLI}%)` : "(-%)"}</strong>
              </div>
            </div>

            <div className="dg-stat-row">
              <div className="limit-name ls">Limit superieur</div>
              <div>
                <span>N ≥ {currentLimits.ls ?? "-"} : </span>
                <strong>{derivedStats.aboveLS} {derivedStats.percentLS !== "-" ? `(${derivedStats.percentLS}%)` : "(-%)"}</strong>
              </div>
            </div>

            <div className="dg-stat-row">
              <div className="limit-name lg">Limit garantie</div>
              <div>
                <span>N ≤ {currentLimits.lg ?? "-"} : </span>
                <strong>{derivedStats.belowLG} {derivedStats.percentLG !== "-" ? `(${derivedStats.percentLG}%)` : "(-%)"}</strong>
              </div>
            </div>
            
            {/* Moyenne */}
            <div className="dg-stat-row">
              <span>Moyenne</span>
              <strong>{derivedStats.mean !== "-" ? derivedStats.mean : "-"}</strong>
            </div>
            
            {/* Sélecteur de type de graphique en dessous de la carte de statistiques */}
            <div className="dg-chart-type-selector">
              <h3>Type de graphique</h3>
              <label>
                <input
                  type="radio"
                  name="chartType"
                  value="scatter"
                  checked={chartType === "scatter"}
                  onChange={(e) => setChartType(e.target.value)}
                />
                Scatter
              </label>
              <label>
                <input
                  type="radio"
                  name="chartType"
                  value="gaussian"
                  checked={chartType === "gaussian"}
                  onChange={(e) => setChartType(e.target.value)}
                />
                Gausse
              </label>
            </div> 
          </div>
        </aside>
      </div>
    </div>
  );
}