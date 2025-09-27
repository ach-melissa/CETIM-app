import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./TableConformite.css";
import { useData } from "../../context/DataContext";

const calculateStats = (data, key) => {
  console.log(`=== RECHERCHE VALEURS MANQUANTES ${key} ===`);
  
  const missingValues = [];
  const values = [];
  
  data.forEach((row, index) => {
    const value = row[key];
    
    // ✅ CORRECTION AMÉLIORÉE : Détection plus robuste des valeurs manquantes
    const isMissing = 
      value === null || 
      value === undefined || 
      value === "" || 
      value === " " || 
      value === "NULL" || 
      value === "null" || // Ajout spécifique pour "null" en chaîne
      value === "undefined" ||
      String(value).trim() === "" ||
      String(value).toLowerCase() === "null" || // Détection case-insensitive
      String(value).toLowerCase() === "undefined";
    
    if (isMissing) {
      missingValues.push({ line: index + 1, value: value, type: typeof value });
      console.log(`Ligne ${index + 1}: VALEUR MANQUANTE -> "${value}" (type: ${typeof value})`);
    } else {
      // ✅ CORRECTION : Conversion numérique plus robuste
      try {
        const stringValue = String(value).trim().replace(',', '.');
        const numericValue = parseFloat(stringValue);
        
        if (!isNaN(numericValue) && isFinite(numericValue)) {
          values.push(numericValue);
        } else {
          missingValues.push({ line: index + 1, value: value, type: typeof value, reason: "NaN or Infinite" });
          console.log(`Ligne ${index + 1}: VALEUR NON NUMÉRIQUE -> "${value}"`);
        }
      } catch (error) {
        missingValues.push({ line: index + 1, value: value, type: typeof value, reason: "Conversion error" });
        console.log(`Ligne ${index + 1}: ERREUR CONVERSION -> "${value}"`);
      }
    }
  });
  
  console.log(`Total valeurs manquantes: ${missingValues.length}`);
  console.log(`Valeurs valides trouvées: ${values.length}`);
  console.log("Positions des manquants:", missingValues.slice(0, 10)); // Afficher seulement les 10 premiers pour éviter l'overflow

  // ✅ CORRECTION : Vérification plus explicite
  if (values.length === 0) {
    console.log(`❌ AUCUNE VALEUR VALIDE TROUVÉE pour ${key}`);
    
    // Debug supplémentaire : analyser les types de données trouvés
    const valueTypes = {};
    data.forEach(row => {
      const val = row[key];
      const type = typeof val;
      valueTypes[type] = (valueTypes[type] || 0) + 1;
    });
    console.log(`Types de données pour ${key}:`, valueTypes);
    
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  console.log("=== ANALYSE VALEURS VALIDES ===");
  console.log("Nombre de valeurs valides:", values.length);
  console.log("Valeurs uniques:", [...new Set(values)].length);
  console.log("Premières valeurs valides:", values.slice(0, 5));
  


  const zeroValues = values.filter(v => v === 0);
  console.log("Valeurs égales à zéro:", zeroValues.length);

  // ✅ CORRECTION : Utilisation de reduce pour éviter les problèmes de stack
  const count = values.length;
  const min = values.reduce((a, b) => Math.min(a, b), values[0]);
  const max = values.reduce((a, b) => Math.max(a, b), values[0]);
 const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  
  // DEBUG: Log intermediate values
  console.log('=== DEBUG CALCULATION ===');
  console.log('Values count:', values.length);
  console.log('Sum:', sum);
  console.log('Mean:', mean);
  
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  console.log('Variance:', variance);
  
  const std = Math.sqrt(variance);
  console.log('Standard Deviation:', std);
  console.log('Rounded SD:', std.toFixed(2));
  
  return {
    count,
    min: min.toFixed(2),
    max: max.toFixed(2),
    mean: mean.toFixed(2),  // Use calculated mean, not assumed one
    std: std.toFixed(2),
  };
};


const evaluateLimits = (data, key, li, ls, lg) => {
  const values = data.map(v => parseFloat(v[key])).filter(v => !isNaN(v));
  if (values.length === 0) {
    return {
      count: 0,
      mean: "-",
      stdDev: "-",
      countLI: "-",
      percentLI: "-",
      countLS: "-",
      percentLS: "-",
      countLG: "-",
      percentLG: "-"
    };
  }

  const count = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / count;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / count;
  const stdDev = Math.sqrt(variance);

  const countLI = (li !== null && li !== "-") ? values.filter(v => v < parseFloat(li)).length : 0;
  const countLS = (ls !== null && ls !== "-") ? values.filter(v => v > parseFloat(ls)).length : 0;
  
  // ✅ CORRECTION : Logique améliorée pour countLG selon le type de paramètre
  let countLG = 0;
  
  if (lg !== null && lg !== "-") {
    const lgValue = parseFloat(lg);
    
    // Paramètres de résistance et temps de début de prise : valeurs INFÉRIEURES à la limite garantie
    if (key === 'rc2j' || key === 'rc7j' || key === 'rc28j' || key === 'prise') {
      countLG = values.filter(v => v < lgValue).length;
    } 
    // Autres paramètres (stabilité, SO3, chlorure, etc.) : valeurs SUPÉRIEURES à la limite garantie
    else {
      countLG = values.filter(v => v > lgValue).length;
    }
  }

  return {
    count,
    mean: mean.toFixed(2),
    stdDev: stdDev.toFixed(2),
    countLI,
    percentLI: countLI > 0 ? ((countLI / count) * 100).toFixed(2) : "0.00",
    countLS,
    percentLS: countLS > 0 ? ((countLS / count) * 100).toFixed(2) : "0.00",
    countLG,
    percentLG: countLG > 0 ? ((countLG / count) * 100).toFixed(2) : "0.00",
  };
};

const safeParse = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).toString().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

const parseLimit = (val) => {
  if (val === null || val === undefined || val === "-") return null;
  const num = parseFloat(String(val).replace(",", "."));
  return isNaN(num) ? null : num;
};

const getKCoefficient = (conformiteData, n, percentile) => {
  if (!conformiteData.coefficients_k || n < 20) return null;
  const kKey = percentile === 5 ? "k_pk5" : "k_pk10";
  const coefficient = conformiteData.coefficients_k.find(coeff => n >= coeff.n_min && n <= coeff.n_max);
  return coefficient ? coefficient[kKey] : null;
};

const checkStatisticalCompliance = (conformiteData, stats, limits, category, limitType) => {
  const { count, mean, std } = stats;
  if (count < 20 || mean === "-" || std === "-" || 
      (limitType === "li" && limits.li === "-") || 
      (limitType === "ls" && limits.ls === "-")) return { satisfied: false, equation: "Données insuffisantes" };

  const n = parseInt(count);
  const xBar = parseFloat(mean);
  const s = parseFloat(std);
  const limitValue = parseFloat(limitType === "li" ? limits.li : limits.ls);

  const percentile = category === "mecanique" ? (limitType === "li" ? 5 : 10) : 10;
  const k = getKCoefficient(conformiteData, n, percentile);
  if (!k) return { satisfied: false, equation: "Coefficient K non disponible" };

  const equationValue = limitType === "li" ? xBar - k * s : xBar + k * s;
  const satisfied = limitType === "li" ? equationValue >= limitValue : equationValue <= limitValue;

  return {
    satisfied,
    equation: `x ${limitType === "li" ? "-" : "+"} k·s = ${equationValue.toFixed(2)} ${limitType === "li" ? "≥" : "≤"} ${limitValue}`
  };
};

const getKaValue = (conditionsStatistiques, pk) => {
  const found = conditionsStatistiques.find(c => pk >= c.pk_min && pk <= c.pk_max);
  return found ? parseFloat(found.ka) : null;
};

const evaluateStatisticalCompliance = (data, key, li, ls, paramType, conditionsStatistiques) => {
  const stats = calculateStats(data, key);
  if (!stats.count) return { equation: "Données insuffisantes", satisfied: false };

  let result = { equation: "", satisfied: false };

  if (["rc2j", "rc7j", "rc28j"].includes(paramType)) {
    if (li) {
      const ka = getKaValue(conditionsStatistiques, 5);
      const value = stats.mean - ka * stats.std;
      result = {
        equation: `X̄ - ${ka} × S = ${value.toFixed(2)} ≥ LI (${li})`,
        satisfied: value >= parseFloat(li)
      };
    }
    if (ls) {
      const ka = getKaValue(conditionsStatistiques, 10);
      const value = stats.mean + ka * stats.std;
      result = {
        equation: `X̄ + ${ka} × S = ${value.toFixed(2)} ≤ LS (${ls})`,
        satisfied: value <= parseFloat(ls)
      };
    }
  } else {
    if (li) {
      const ka = getKaValue(conditionsStatistiques, 10);
      const value = stats.mean - ka * stats.std;
      result = {
        equation: `X̄ - ${ka} × S = ${value.toFixed(2)} ≥ LI (${li})`,
        satisfied: value >= parseFloat(li)
      };
    }
    if (ls) {
      const ka = getKaValue(conditionsStatistiques, 10);
      const value = stats.mean + ka * stats.std;
      result = {
        equation: `X̄ + ${ka} × S = ${value.toFixed(2)} ≤ LS (${ls})`,
        satisfied: value <= parseFloat(ls)
      };
    }
  }

  return result;
};

const checkEquationSatisfaction = (values, limits, conditionsStatistiques = []) => {
  if (!conditionsStatistiques || conditionsStatistiques.length === 0) {
    return { satisfied: false, equation: "Conditions non chargées", displayText: "Conditions non chargées" };
  }

  if (!Array.isArray(values)) {
    return { satisfied: false, equation: "Données manquantes", displayText: "Données manquantes" };
  }

  const n = values.length;
  let cd = values.filter(
    (v) =>
      (limits.limit_inf !== null && parseFloat(v) < parseFloat(limits.limit_inf)) ||
      (limits.limit_max !== null && parseFloat(v) > parseFloat(limits.limit_max))
  ).length;

  let ca = 0;
  if (n < 20) {
    ca = 0;
  } else if (n > 136) {
    ca = 0.075 * (n - 30);
  } else {
    const condition = conditionsStatistiques.find(
      (c) => n >= c.n_min && n <= c.n_max
    );
    if (condition) {
      ca = condition.ca_probabilite;
    }
  }

  const satisfied = cd <= ca;
  const equationText = `Cd = ${cd} ${satisfied ? '≤' : '≥'} Ca = ${ca}`;
  
  return {
    satisfied,
    equation: equationText,
    displayText: equationText
  };
};

const TableConformite = ({
  clientId, 
  clientTypeCimentId, 
  produitInfo,
  produitDescription, 
  clients = [], 
  produits = [] 
}) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [conformiteData, setConformiteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedProductFamily, setSelectedProductFamily] = useState("");
  const [dataError, setDataError] = useState(null);
  const [conditionsStatistiques, setConditionsStatistiques] = useState([]);

  const c3aProducts = ["CEM I-SR 0", "CEM I-SR 3", "CEM I-SR 5", "CEM IV/A-SR", "CEM IV/B-SR"];
  const ajoutProducts = [
    "CEM II/A-S", "CEM II/B-S", "CEM II/A-D", "CEM II/A-P", "CEM II/B-P",
    "CEM II/A-Q", "CEM II/B-Q", "CEM II/A-V", "CEM II/B-V",
    "CEM II/A-W", "CEM II/B-W", "CEM II/A-T", "CEM II/B-T",
    "CEM II/A-L", "CEM II/B-L", "CEM II/A-LL", "CEM II/B-LL",
    "CEM II/A-M", "CEM II/B-M"
  ];

  // Create timeDependentParams dynamically based on product type
  const getTimeDependentParams = useCallback(() => {
    const baseParams = [
      { key: "prise", label: "Temp debut de prise", jsonKey: "temps_debut_de_prise" },
      { key: "pfeu", label: "Perte au Feu", jsonKey: "pert_feu" },
      { key: "r_insoluble", label: "Résidu Insoluble", jsonKey: "residu_insoluble" },
      { key: "so3", label: "Teneur en sulfate", jsonKey: "sulfat" },
      { key: "chlorure", label: "Chlorure", jsonKey: "chlore" },
      { key: "hydratation", label: "Chaleur d'Hydratation", jsonKey: "chaleur_hydratation" },
    ];

    if (c3aProducts.includes(selectedProductType)) {
      baseParams.push({ key: "c3a", label: "C3A", jsonKey: "c3a" });
    }

    if (ajoutProducts.includes(selectedProductType)) {
      baseParams.push({ key: "ajout_percent", label: "Ajout(Calcaire)", jsonKey: "ajout" });
    }

    return baseParams;
  }, [selectedProductType]);

  const timeDependentParams = getTimeDependentParams();
  const showC3A = c3aProducts.includes(selectedProductType);
  const showAjout = ajoutProducts.includes(selectedProductType);

  const alwaysMesureParams = [
    { key: "rc2j", label: "Résistance courante 2 jrs" },
    { key: "rc7j", label: "Résistance courante 7 jrs" },
    { key: "rc28j", label: "Résistance courante 28 jrs" }
  ];

  const alwaysAttributParams = [
    { key: "stabilite", label: "Stabilité" },
    { key: "pouzzolanicite", label: "Pouzzolanicité" }
  ];

  const baseParams = [...alwaysMesureParams, ...alwaysAttributParams];
  
  const allParameters = [...baseParams, ...timeDependentParams.filter(p => 
    !baseParams.some(bp => bp.key === p.key)
  )];

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
    ajout_percent: "ajout"
  };

  // Set product type and family from produitInfo
  useEffect(() => {
    if (produitInfo) {
      setSelectedProductType(produitInfo.nom || produitInfo.code || "");
      setSelectedProductFamily(produitInfo.famille?.code || "");
    }
  }, [produitInfo]);

  useEffect(() => {
    fetch("/Data/conformite.json")
      .then((res) => res.json())
      .then((data) => {
        setConditionsStatistiques(data.conditions_statistiques || []);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [parnormRes, conformiteRes] = await Promise.all([
          fetch("/Data/parnorm.json"),
          fetch("/Data/conformite.json"),
        ]);
        if (!parnormRes.ok) throw new Error("Erreur parnorm.json");
        if (!conformiteRes.ok) throw new Error("Erreur conformite.json");

        const parnormData = await parnormRes.json();
        const conformiteJson = await conformiteRes.json();

        setMockDetails(parnormData);
        setConformiteData(conformiteJson);
        setConditionsStatistiques(conformiteJson.conditions_statistiques || []);
        setDataError(null);
      } catch (err) {
        console.error(err);
        setDataError("Erreur de chargement des données de référence");
        setMockDetails({});
        setConformiteData({});
        setConditionsStatistiques([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

const getLimitsByClass = useCallback((classe, key) => {
  const mapping = keyMapping[key];
  if (!mapping || !mockDetails[mapping]) return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
  
  const parameterData = mockDetails[mapping];
  if (!parameterData) return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };

  // First try: Search in selected product family and type
  if (selectedProductFamily && selectedProductType && parameterData[selectedProductFamily]) {
    const familyData = parameterData[selectedProductFamily];
    if (familyData[selectedProductType]) {
      const typeData = familyData[selectedProductType];
      
      // FIX: Check if typeData is an array or object
      if (Array.isArray(typeData)) {
        const found = typeData.find(item => item.classe === classe);
        if (found) return { 
          li: found.limit_inf ?? "-", 
          ls: found.limit_max ?? "-", 
          lg: found.garantie ?? "-",
          limit_inf: found.limit_inf,
          limit_max: found.limit_max
        };
      } else if (typeof typeData === 'object' && typeData.classe === classe) {
        // If typeData is a direct object (not array)
        return { 
          li: typeData.limit_inf ?? "-", 
          ls: typeData.limit_max ?? "-", 
          lg: typeData.garantie ?? "-",
          limit_inf: typeData.limit_inf,
          limit_max: typeData.limit_max
        };
      }
    }
  }

  // Second try: Search through all families and types
  for (const familleKey in parameterData) {
    const familleData = parameterData[familleKey];
    for (const typeKey in familleData) {
      const typeData = familleData[typeKey];
      
      // FIX: Handle both array and object cases
      if (Array.isArray(typeData)) {
        const found = typeData.find(item => item.classe === classe);
        if (found) return { 
          li: found.limit_inf ?? "-", 
          ls: found.limit_max ?? "-", 
          lg: found.garantie ?? "-",
          limit_inf: found.limit_inf,
          limit_max: found.limit_max
        };
      } else if (typeof typeData === 'object' && typeData.classe === classe) {
        // If typeData is a direct object (not array)
        return { 
          li: typeData.limit_inf ?? "-", 
          ls: typeData.limit_max ?? "-", 
          lg: typeData.garantie ?? "-",
          limit_inf: typeData.limit_inf,
          limit_max: typeData.limit_max
        };
      } else if (typeof typeData === 'object') {
        // If typeData is an object with classe as keys
        if (typeData[classe]) {
          const classData = typeData[classe];
          return { 
            li: classData.limit_inf ?? "-", 
            ls: classData.limit_max ?? "-", 
            lg: classData.garantie ?? "-",
            limit_inf: classData.limit_inf,
            limit_max: classData.limit_max
          };
        }
      }
    }
  }

  return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
}, [mockDetails, selectedProductFamily, selectedProductType]);
  const dataToUse = filteredTableData || [];

  const allStats = useMemo(() => 
    allParameters.reduce((acc, param) => ({ ...acc, [param.key]: calculateStats(dataToUse, param.key) }), {}),
  [allParameters, dataToUse]);

  const classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"];

  const checkTemporalCoverage = useCallback((data, paramKeys) => {
    if (!data || data.length === 0) {
      return { status: false, missing: [], hasData: {} };
    }

    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const startDate = new Date(sorted[0].date);
    const endDate = new Date(sorted[sorted.length - 1].date);

    let currentStart = new Date(startDate);
    const missingWindows = [];
    
    const hasData = {};
    paramKeys.forEach(key => {
      hasData[key] = sorted.some(row => 
        row[key] !== null && row[key] !== undefined && row[key] !== ""
      );
    });

    while (currentStart <= endDate) {
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + 6);

      const hasResult = sorted.some((row) => {
        const d = new Date(row.date);
        if (d >= currentStart && d <= currentEnd) {
          return paramKeys.some(paramKey => 
            row[paramKey] !== null && row[paramKey] !== undefined && row[paramKey] !== ""
          );
        }
        return false;
      });

      if (!hasResult) {
        missingWindows.push({
          start: currentStart.toISOString().split("T")[0],
          end: currentEnd.toISOString().split("T")[0],
        });
      }

      currentStart.setDate(currentStart.getDate() + 7);
    }

    return {
      status: missingWindows.length === 0,
      missing: missingWindows,
      hasData: hasData
    };
  }, []);

  const timeDependentCoverage = useMemo(() => {
    const paramKeys = timeDependentParams.map(p => p.jsonKey || p.key);
    return checkTemporalCoverage(dataToUse, paramKeys);
  }, [dataToUse, timeDependentParams, checkTemporalCoverage]);

  const calculateClassConformity = (classCompliance, statisticalCompliance, conditionsStatistiques) => {
    const statisticalResults = Object.values(statisticalCompliance);
    const allStatisticalSatisfied = statisticalResults.every(result => 
      result && result.satisfied !== false
    );

    let allAttributeSatisfied = true;
    Object.keys(classCompliance).forEach(paramKey => {
      const compliance = classCompliance[paramKey];
      if (compliance.values && compliance.values.length > 0) {
        const attributeResult = checkEquationSatisfaction(
          compliance.values,
          compliance.limits,
          conditionsStatistiques
        );
        if (!attributeResult.satisfied) {
          allAttributeSatisfied = false;
        }
      }
    });

    const hasGarantieDeviations = Object.keys(classCompliance).some(paramKey => {
      const compliance = classCompliance[paramKey];
      return compliance.stats && compliance.stats.percentLG !== "-" && 
             parseFloat(compliance.stats.percentLG) > 0;
    });

    return allStatisticalSatisfied && allAttributeSatisfied && !hasGarantieDeviations;
  };

  const getCellColor = (deviationPercent, defaultPercent, hasData, limits) => {
    if (!hasData || limits.li === "-" && limits.ls === "-" && limits.lg === "-") {
      return "grey";
    }
    
    if (defaultPercent >= 5) {
      return "red";
    }
    
    if (deviationPercent >= 5) {
      return "red";
    }
    
    if (deviationPercent >= 0 && deviationPercent < 5) {
      return "green";
    }
    
    return "green";
  };

  const getControlStatus = (paramKey, limits, values, conditionsStatistiques) => {
    if (!values || values.length === 0 || (limits.li === "-" && limits.ls === "-")) {
      return { status: "ND/NS", color: "grey" };
    }

    const isMesureParam = alwaysMesureParams.some(p => p.key === paramKey) || 
                         timeDependentParams.some(p => p.key === paramKey);
    
    const isAttributParam = alwaysAttributParams.some(p => p.key === paramKey);

    if (isMesureParam) {
      const stats = calculateStats(dataToUse, paramKey);
      const category = keyMapping[paramKey]?.category || "general";
      
      let allSatisfied = true;
      let hasInsufficientData = false;
      
      if (limits.li !== "-") {
        const liResult = checkStatisticalCompliance(conformiteData, stats, limits, category, "li");
        if (liResult.equation.includes("insuffisantes") || liResult.equation.includes("non disponible")) {
          hasInsufficientData = true;
        } else if (!liResult.satisfied) {
          allSatisfied = false;
        }
      }
      if (limits.ls !== "-") {
        const lsResult = checkStatisticalCompliance(conformiteData, stats, limits, category, "ls");
        if (lsResult.equation.includes("insuffisantes") || lsResult.equation.includes("non disponible")) {
          hasInsufficientData = true;
        } else if (!lsResult.satisfied) {
          allSatisfied = false;
        }
      }
      
      if (hasInsufficientData) {
        return { status: "Données insuffisantes", color: "grey" };
      }
      
      return { 
        status: allSatisfied ? "Satisfait" : "Non Satisfait", 
        color: allSatisfied ? "green" : "yellow" 
      };
    }

    if (isAttributParam) {
      const attributeResult = checkEquationSatisfaction(values, limits, conditionsStatistiques);
      
      if (attributeResult.equation.includes("insuffisantes") || 
          attributeResult.equation.includes("manquantes") || 
          attributeResult.equation.includes("non chargées")) {
        return { status: "Données insuffisantes", color: "grey" };
      }
      
      return { 
        status: attributeResult.satisfied ? "Satisfait" : "Non Satisfait", 
        color: attributeResult.satisfied ? "green" : "yellow" 
      };
    }

    return { status: "ND/NS", color: "grey" };
  };

  const handleExport = () => {
    console.log("Export functionality");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    console.log("Save functionality");
  };

  if (loading) {
    return <div className="loading">Chargement des données...</div>;
  }

  if (dataError) {
    return <div className="error">{dataError}</div>;
  }

  if (!dataToUse.length) {
    return <div className="no-data">Aucune donnée disponible. Veuillez d'abord filtrer des échantillons.</div>;
  }

  return (
    <div className="cement-table-page">
      <div className="cement-table-container">
      <div style={{ marginBottom: "1rem" }}>
        <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
        {produitInfo && (
          <>
            <p><strong> {produitInfo.nom} ( {produitInfo.description} )</strong></p>
          </>
        )}
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
      </div>

        <div className="table-section">
          <h3>Conformité</h3>
          <table className="conformity-table">
            <thead>
              <tr>
                <th>Paramètre/Classe</th>
                {allParameters.map((param) => (
                  <th key={param.key}>{param.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((classe) => {
                const classCompliance = {};
                const statisticalCompliance = {};
                
                allParameters.forEach(param => {
                  const limits = getLimitsByClass(classe, param.key);
                  const values = dataToUse.map(r => parseFloat(r[param.key])).filter(v => !isNaN(v));
                  const stats = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
                  
                  classCompliance[param.key] = { limits, stats, values };
                  
                  if (limits.li !== "-" || limits.ls !== "-") {
                    const category = keyMapping[param.key]?.category || "general";
                    if (limits.li !== "-") statisticalCompliance[`${param.key}_li`] = 
                      checkStatisticalCompliance(conformiteData, allStats[param.key], limits, category, "li");
                    if (limits.ls !== "-") statisticalCompliance[`${param.key}_ls`] = 
                      checkStatisticalCompliance(conformiteData, allStats[param.key], limits, category, "ls");
                  }
                });

                const isClassConforme = calculateClassConformity(classCompliance, statisticalCompliance, conditionsStatistiques);
                
                return (
                  <React.Fragment key={classe}>
                    <tr key={`${classe}-name`}>
                      <td>
                        {classe} <strong style={{ marginLeft: "10px", color: isClassConforme ? "green" : "red" }}>
                          {isClassConforme ? "Conforme" : "Non Conforme"}
                        </strong>
                      </td>
                      {allParameters.map((param) => (
                        <td key={param.key}></td>
                      ))}
                    </tr>

                    <tr key={`${classe}-deviation`}>
                      <td>% Déviation</td>
                      {allParameters.map((param) => {
                        const compliance = classCompliance[param.key];
                        const deviationPercent = Math.max(
                          parseFloat(compliance.stats.percentLI || 0),
                          parseFloat(compliance.stats.percentLS || 0)
                        );
                        const hasData = compliance.values && compliance.values.length > 0;
                        
                        const color = getCellColor(
                          deviationPercent, 
                          0, 
                          hasData, 
                          compliance.limits
                        );

                        let displayValue = "OK";
                        if (deviationPercent >= 5) {
                          displayValue = `${deviationPercent}%`;
                        } else if (!hasData || (compliance.limits.li === "-" && compliance.limits.ls === "-")) {
                          displayValue = "ND";
                        }

                        return (
                          <td key={param.key} style={{ 
                            color, 
                            fontWeight: "bold", 
                            backgroundColor: color === "green" ? "#e8f5e8" : 
                                          color === "red" ? "#ffe8e8" : 
                                          color === "grey" ? "#f0f0f0" : "transparent" 
                          }}>
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>

                    <tr key={`${classe}-default`}>
                      <td>% Défaut</td>
                      {allParameters.map((param) => {
                        const compliance = classCompliance[param.key];
                        const defaultPercent = parseFloat(compliance.stats.percentLG || 0);
                        const hasData = compliance.values && compliance.values.length > 0;
                        
                        const color = getCellColor(
                          0, 
                          defaultPercent, 
                          hasData, 
                          compliance.limits
                        );

                        let displayValue = "OK";
                        if (defaultPercent >= 5) {
                          displayValue = `${defaultPercent}%`;
                        } else if (!hasData || compliance.limits.lg === "-") {
                          displayValue = "ND";
                        }

                        return (
                          <td key={param.key} style={{ 
                            color, 
                            fontWeight: "bold", 
                            backgroundColor: color === "green" ? "#e8f5e8" : 
                                          color === "red" ? "#ffe8e8" : 
                                          color === "grey" ? "#f0f0f0" : "transparent" 
                          }}>
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>

                    <tr key={`${classe}-control`}>
                      <td>Contrôle Statistique</td>
                      {allParameters.map((param) => {
                        const compliance = classCompliance[param.key];
                        const controlStatus = getControlStatus(
                          param.key, 
                          compliance.limits, 
                          compliance.values, 
                          conditionsStatistiques
                        );

                        return (
                          <td key={param.key} style={{ 
                            color: controlStatus.color, 
                            fontWeight: "bold",
                            backgroundColor: controlStatus.color === "green" ? "#e8f5e8" : 
                                          controlStatus.color === "yellow" ? "#fff9e6" : 
                                          controlStatus.color === "grey" ? "#f0f0f0" : "transparent"
                          }}>
                            {controlStatus.status}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="legend">
          <p><span className="green-box"></span> Déviation/Défaut % &lt; 5%</p>
          <p><span className="yellow-box"></span> Contrôle statistique non satisfait</p>
          <p><span className="red-box"></span> Déviation/Défaut % ≥ 5%</p>
          <p><span className="grey-box"></span> Données insuffisantes/ND/NS</p>
        </div>
      </div>

      <div className="actions-bar">
        <div className="file-actions">
          <button className="action-btn export-btn" onClick={handleExport} disabled={dataToUse.length === 0}>
            <i className="fas fa-file-export"></i> Exporter
          </button>
          <button className="action-btn print-btn" onClick={handlePrint} disabled={dataToUse.length === 0}>
            <i className="fas fa-print"></i> Imprimer
          </button>
        </div>
        <div className="data-actions">
          <button className="action-btn save-btn" onClick={handleSave} disabled={dataToUse.length === 0}>
            <i className="fas fa-save"></i> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableConformite;
