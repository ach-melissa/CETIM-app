import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import './ControleConformite.css';
import { useData } from "../../context/DataContext";

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
  
  let countLG = 0;
  
  if (lg !== null && lg !== "-") {
    const lgValue = parseFloat(lg);
    
    if (key === 'rc2j' || key === 'rc7j' || key === 'rc28j' || key === 'prise') {
      countLG = values.filter(v => v < lgValue).length;
    } else {
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

const checkStatisticalCompliance = (conformiteData, stats, limits, paramKey, limitType) => {
  const { count, mean, std } = stats;
  
  if (count < 20 || mean === "-" || std === "-") {
    return { 
      satisfied: true,
      equation: "Données insuffisantes (n < 20)",
      displayEquation: "Données insuffisantes (n < 20)",
      canCalculate: false
    };
  }

  const n = parseInt(count);
  const xBar = parseFloat(mean);
  const s = parseFloat(std);
  
  let limitValue;
  let limitExists = false;
  
  if (limitType === "li") {
    limitExists = !(limits.li === "-" || limits.li === null || limits.li === undefined);
    limitValue = limitExists ? parseFloat(limits.li) : null;
  } else {
    limitExists = !(limits.ls === "-" || limits.ls === null || limits.ls === undefined);
    limitValue = limitExists ? parseFloat(limits.ls) : null;
  }

  if (!limitExists) {
    const operator = limitType === "li" ? "-" : "+";
    const displayEquation = `X̄ ${operator} k·s = ${(limitType === "li" ? xBar - 1.96 * s : xBar + 1.96 * s).toFixed(2)} ≥ -`;
    
    return { 
      satisfied: true,
      equation: displayEquation,
      displayEquation: displayEquation,
      canCalculate: false,
      noLimit: true
    };
  }

  let percentile;
  
  if (["rc2j", "rc7j", "rc28j"].includes(paramKey)) {
    if (limitType === "li") {
      percentile = 5;
    } else {
      percentile = 10;
    }
  } else {
    percentile = 10;
  }

  const k = getKCoefficient(conformiteData, n, percentile);
  if (!k) {
    return { 
      satisfied: true,
      equation: `Coefficient K non disponible pour n=${n}, pk=${percentile}`,
      displayEquation: `Coefficient K non disponible`,
      canCalculate: false
    };
  }

  const equationValue = limitType === "li" ? xBar - k * s : xBar + k * s;
  
  const satisfied = limitType === "li" ? equationValue >= limitValue : equationValue <= limitValue;

  const operator = limitType === "li" ? "-" : "+";
  const comparison = limitType === "li" ? "≥" : "≤";
  
  const displayEquation = `X̄ ${operator} k·s = ${equationValue.toFixed(2)} ${comparison} ${limitValue}`;
  const detailedEquation = `X̄ ${operator} k·s = ${xBar.toFixed(2)} ${operator} ${k}×${s.toFixed(2)} = ${equationValue.toFixed(2)} ${comparison} ${limitValue}`;

  return {
    satisfied,
    equation: detailedEquation,
    displayEquation: displayEquation,
    canCalculate: true,
    details: {
      n,
      xBar,
      s,
      k,
      equationValue,
      limitValue,
      limitExists,
      percentile
    }
  };
};

const getKaValue = (conditionsStatistiques, pk) => {
  const found = conditionsStatistiques.find(c => pk >= c.pk_min && pk <= c.pk_max);
  return found ? parseFloat(found.ka) : null;
};

const evaluateStatisticalCompliance = (data, key, li, ls, paramType, conditionsStatistiques) => {
  const stats = calculateStats(data, key);
  if (!stats.count) return { equation: "Données insuffisantes", satisfied: true };

  let result = { equation: "", satisfied: true };

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
    return { 
      satisfied: true,
      equation: "Conditions non chargées", 
      displayText: "Conditions non chargées",
      canCalculate: false
    };
  }

  if (!Array.isArray(values) || values.length === 0) {
    return { 
      satisfied: true,
      equation: "Données insuffisantes", 
      displayText: "Données insuffisantes",
      canCalculate: false
    };
  }

  const n = values.length;
  
  const hasLI = limits.li !== "-" && limits.li !== null && limits.li !== undefined;
  const hasLS = limits.ls !== "-" && limits.ls !== null && limits.ls !== undefined;
  
  if (!hasLI && !hasLS) {
    return {
      satisfied: true,
      equation: "Pas de limites définies",
      displayText: "Pas de limites définies",
      canCalculate: false,
      noLimits: true
    };
  }

  let cd = values.filter(v => {
    const numericValue = parseFloat(v);
    if (isNaN(numericValue)) return false;
    
    if (hasLI && numericValue < parseFloat(limits.li)) return true;
    if (hasLS && numericValue > parseFloat(limits.ls)) return true;
    
    return false;
  }).length;

  let ca = 0;
  if (n < 20) {
    ca = 0;
  } else if (n > 136) {
    ca = Math.ceil(0.075 * (n - 30));
  } else {
    const condition = conditionsStatistiques.find(
      (c) => n >= c.n_min && n <= c.n_max
    );
    if (condition) {
      ca = condition.ca_probabilite;
    }
  }

  const satisfied = cd <= ca;
  const equationText = `Cd = ${cd} ${satisfied ? '≤' : '>'} Ca = ${ca}`;
  
  return {
    satisfied,
    equation: equationText,
    displayText: equationText,
    canCalculate: true,
    details: { cd, ca, n }
  };
};

const ControleConformite = ({
  clientId, 
  clientTypeCimentId, 
  produitInfo,
  produitDescription, 
  clients = [], 
  produits = [] ,
  ajoutsData = {},
  phase: propPhase, // Phase passée en prop (optionnelle)
}) => {
  const { filteredTableData, filterPeriod, allData } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [conformiteData, setConformiteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProductFamily, setSelectedProductFamily] = useState("");
  const [dataError, setDataError] = useState(null);
  const [conditionsStatistiques, setConditionsStatistiques] = useState([]);
  const [debugInfo, setDebugInfo] = useState("");
  const debugLogRef = useRef([]);
  const [detectedPhase, setDetectedPhase] = useState("situation_courante"); // Phase détectée automatiquement

  const [coverageRequirements, setCoverageRequirements] = useState({
    status: false,
    missing: [],
    hasData: {},
    requirements: {},
    coverageResults: {},
    coverageStatus: "unknown",
    productionPhase: ""
  });

  // ✅ NOUVEAU: Détection automatique de la phase
  useEffect(() => {
    const detectProductionPhase = () => {
      if (!clientId || !produitInfo || !allData || allData.length === 0) {
        return "situation_courante"; // Par défaut
      }

      // Vérifier s'il existe déjà des échantillons pour ce client et ce produit dans toutes les données
      const existingSamples = allData.filter(sample => 
        sample.client_id == clientId && 
        sample.produit_id == produitInfo.id
      );

      console.log("🔍 Détection phase:", {
        clientId,
        produitId: produitInfo.id,
        existingSamplesCount: existingSamples.length,
        allDataCount: allData.length
      });

      // Si aucun échantillon existant → Nouveau type produit
      // Si échantillons existants → Situation courante
      const phase = existingSamples.length === 0 ? "nouveau_type" : "situation_courante";
      
      console.log(`✅ Phase détectée: ${phase} (${existingSamples.length} échantillons existants)`);
      return phase;
    };

    const phase = detectProductionPhase();
    setDetectedPhase(phase);
  }, [clientId, produitInfo, allData]);

  // Utiliser la phase passée en prop ou la phase détectée automatiquement
  const currentPhase = propPhase || detectedPhase;

  const c3aProducts = ["CEM I-SR 0", "CEM I-SR 3", "CEM I-SR 5", "CEM IV/A-SR", "CEM IV/B-SR"];
  const ajoutProducts = [
    "CEM II/A-S", "CEM II/B-S", "CEM II/A-D", "CEM II/A-P", "CEM II/B-P",
    "CEM II/A-Q", "CEM II/B-Q", "CEM II/A-V", "CEM II/B-V",
    "CEM II/A-W", "CEM II/B-W", "CEM II/A-T", "CEM II/B-T",
    "CEM II/A-L", "CEM II/B-L", "CEM II/A-LL", "CEM II/B-LL",
    "CEM II/A-M", "CEM II/B-M"
  ];

  const selectedProductType = produitInfo?.nom || produitInfo?.code || "";
  const selectedProductFamille = produitInfo?.famille?.code || "";
  const selectedProductFamilleName = produitInfo?.famille?.nom || "";

  const determineFamilleFromType = (productType) => {
    if (!productType) return "";
    const familleMatch = productType.match(/^(CEM [I|II|III|IV|V]+)/);
    return familleMatch ? familleMatch[1] : "";
  };

  const finalFamilleCode = selectedProductFamille || determineFamilleFromType(selectedProductType);
  const finalFamilleName = selectedProductFamilleName || finalFamilleCode;

  // ✅ NOUVEAU: Déterminer si la famille est CEM I ou CEM III
  const isCemIOrCemIII = useMemo(() => {
    const famille = finalFamilleCode.toUpperCase();
    return famille === "CEM I" || famille === "CEM III";
  }, [finalFamilleCode]);

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
  
  const getAjoutDescription = (code, ajoutsData) => {
    if (!code || !ajoutsData) return "";
    const parts = code.split("-");
    const descriptions = parts.map((part) => {
      const ajout = ajoutsData[part];
      return ajout ? ajout.description : part;
    });
    return descriptions.join(" + ");
  };

  // ✅ MODIFICATION: Inclure "residu_insoluble" et "pert_au_feu" seulement si CEM I ou CEM III
  const timeDependentParams = [
    { key: "prise", label: "Temp debut de prise", jsonKey: "temps_debut_de_prise" },
    { key: "so3", label: "Teneur en sulfate", jsonKey: "sulfat" },
    { key: "chlorure", label: "Chlorure", jsonKey: "chlore" },
    { key: "hydratation", label: "Chaleur d'Hydratation", jsonKey: "chaleur_hydratation" },
  ];

  // ✅ AJOUT: Paramètres conditionnels pour CEM I et CEM III
  const conditionalTimeDependentParams = isCemIOrCemIII ? [
    { key: "pfeu", label: "Perte au Feu", jsonKey: "pert_feu" },
    { key: "r_insoluble", label: "Résidu Insoluble", jsonKey: "residu_insoluble" },
  ] : [];

  const deviationOnlyParams = [
    { 
      key: "ajout_percent", 
      label: `Ajout: ${getAjoutDescription(produitInfo?.type_ajout, ajoutsData)}`, 
      jsonKey: "ajout" 
    }
  ];

  const alwaysMesureParams = [
    { key: "rc2j", label: "Résistance courante 2 jrs" },
    { key: "rc7j", label: "Résistance courante 7 jrs" },
    { key: "rc28j", label: "Résistance courante 28 jrs" }
  ];

  const alwaysAttributParams = [
    { key: "stabilite", label: "Stabilité" },
    { key: "pouzzolanicite", label: "Pouzzolanicité" }
  ];

  // ✅ MODIFICATION: Combiner les paramètres time-dependent avec les paramètres conditionnels
  const allTimeDependentParams = [...timeDependentParams, ...conditionalTimeDependentParams];
  
  if (c3aProducts.includes(selectedProductType)) {
    allTimeDependentParams.push({ key: "c3a", label: "C3A", jsonKey: "c3a" });
  }

  const showC3A = c3aProducts.includes(selectedProductType);
  const showAjout = ajoutProducts.includes(selectedProductType);

  const baseParams = [...alwaysMesureParams, ...alwaysAttributParams];
  const allParameters = [...baseParams, ...allTimeDependentParams.filter(p => 
    !baseParams.some(bp => bp.key === p.key)
  )];

  const classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"];

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
      }
    };
    fetchMockDetails();
  }, []);

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

  const dataToUse = filteredTableData || [];

  // Mettre à jour la couverture avec la phase détectée
  useEffect(() => {
    if (dataToUse.length > 0) {
      const allParamKeys = [
        "rc2j", "rc7j", "rc28j", "prise", "stabilite", "so3",
        "chlorure", "hydratation", "pfeu", "r_insoluble", "c3a", "pouzzolanicite", "ajout"
      ];
      
      const coverage = checkDataCoverageRequirements(dataToUse, currentPhase, allParamKeys, conformiteData);
      setCoverageRequirements(coverage);
      
      addDebugLog(`Coverage check: ${coverage.coverageStatus} for ${coverage.productionPhase}`);
      if (!coverage.status) {
        addDebugLog(`Missing coverage: ${coverage.missing.length} periods`);
      }
    }
  }, [dataToUse, currentPhase, conformiteData]);

  // ✅ NOUVEAU: Fonction pour vérifier si un paramètre a des données
  const hasDataForParameter = useCallback((paramKey) => {
    if (!dataToUse || dataToUse.length === 0) return false;
    
    const hasData = dataToUse.some(row => {
      const value = row[paramKey];
      return value !== null && value !== undefined && value !== "" && value !== " " && 
             String(value).trim() !== "" && String(value).toLowerCase() !== "null" && 
             String(value).toLowerCase() !== "undefined";
    });
    
    return hasData;
  }, [dataToUse]);

  const addDebugLog = useCallback((message) => {
    debugLogRef.current.push(`${new Date().toLocaleTimeString()}: ${message}`);
    if (debugLogRef.current.length > 50) {
      debugLogRef.current = debugLogRef.current.slice(-50);
    }
  }, []);

  const getLimitsByClass = useCallback((classe, key) => {
    const mockKey = keyMapping[key];
    if (!mockKey || !mockDetails[mockKey]) {
      addDebugLog(`❌ Parameter "${mockKey}" not found in JSON`);
      return { li: "-", ls: "-", lg: "-" };
    }

    const parameterData = mockDetails[mockKey];
    
    if (!parameterData[finalFamilleCode]) {
      const availableFamilles = Object.keys(parameterData).join(", ");
      addDebugLog(`❌ Famille "${finalFamilleCode}" not found in ${mockKey}. Available: ${availableFamilles}`);
      return { li: "-", ls: "-", lg: "-" };
    }

    const familleData = parameterData[finalFamilleCode];

    if (key === "ajt") {
      const ajoutCode = selectedProductType.split('/').pop()?.split('-').pop()?.trim();
      if (!ajoutCode || !familleData[ajoutCode]) {
        const availableAjoutCodes = Object.keys(familleData).join(", ");
        addDebugLog(`❌ Ajout code "${ajoutCode}" not found. Available: ${availableAjoutCodes}`);
        return { li: "-", ls: "-", lg: "-" };
      }

      const ajoutData = familleData[ajoutCode];
      return {
        li: ajoutData.limitInf ?? ajoutData.limit_inf ?? "-",
        ls: ajoutData.limitSup ?? ajoutData.limit_max ?? "-",
        lg: ajoutData.garantie ?? "-"
      };
    }

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
      addDebugLog(`❌ No data found for class "${classe}" in famille "${finalFamilleCode}"`);
      return { li: "-", ls: "-", lg: "-" };
    }

    return {
      li: classData.limit_inf ?? classData.limitInf ?? "-",
      ls: classData.limit_max ?? classData.limitSup ?? classData.limitMax ?? "-",
      lg: classData.garantie ?? classData.garantieValue ?? "-",
    };
  }, [mockDetails, keyMapping, finalFamilleCode, selectedProductType, addDebugLog]);

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

  const checkDataCoverageRequirements = (data, productionPhase, paramKeys, conformiteData) => {
    if (!data || data.length === 0) {
      return { 
        status: false, 
        missing: [], 
        hasData: {},
        requirements: {},
        coverageResults: {},
        coverageStatus: "no_data",
        productionPhase: productionPhase
      };
    }

    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const startDate = new Date(sorted[0].date);
    const endDate = new Date(sorted[sorted.length - 1].date);
    
    // Récupérer les fréquences depuis le JSON
    const getFrequencyRequirements = () => {
      if (!conformiteData || !conformiteData.frequence_essais) {
        return {};
      }
      
      const phaseKey = productionPhase === 'nouveau_type' ? 'nouveau_type_produit' : 'situation_courante';
      const params = conformiteData.frequence_essais[phaseKey]?.parametres || [];
      
      const requirements = {
        weekly: { minResults: 0, params: [] },
        weekly_other: { minResults: 0, params: [] },
        monthly: { minResults: 0, params: [] },
        monthly_other: { minResults: 0, params: [] }
      };
      
      params.forEach(param => {
        if (param.frequence === 4) {
          requirements.weekly.params.push(param.parametre);
          requirements.weekly.minResults = 4;
        } else if (param.frequence === 2 && param.description.includes('semaine')) {
          requirements.weekly.params.push(param.parametre);
          requirements.weekly.minResults = 2;
        } else if (param.frequence === 1 && param.description.includes('semaine')) {
          requirements.weekly_other.params.push(param.parametre);
          requirements.weekly_other.minResults = 1;
        } else if (param.frequence === 2 && param.description.includes('mois')) {
          requirements.monthly.params.push(param.parametre);
          requirements.monthly.minResults = 2;
        } else if (param.frequence === 1 && param.description.includes('mois')) {
          requirements.monthly_other.params.push(param.parametre);
          requirements.monthly_other.minResults = 1;
        }
      });
      
      return requirements;
    };

    const requirements = getFrequencyRequirements();
    
    const missingWindows = [];
    const coverageResults = {};

    // Vérifier d'abord quels paramètres ont des données
    const paramsWithData = {};
    paramKeys.forEach(key => {
      paramsWithData[key] = sorted.some(row => {
        const value = row[key];
        return value !== null && value !== undefined && value !== "" && value !== " ";
      });
    });

    // Check weekly coverage seulement pour les paramètres avec données
    Object.keys(requirements).forEach(reqType => {
      if (reqType.includes('weekly')) {
        const requirement = requirements[reqType];
        
        requirement.params.forEach(paramKey => {
          // Ignorer les paramètres sans données
          if (!paramsWithData[paramKey]) return;
          
          let currentStart = new Date(startDate);
          const paramMissingWindows = [];
          
          while (currentStart <= endDate) {
            const currentEnd = new Date(currentStart);
            currentEnd.setDate(currentEnd.getDate() + 6);

            const weekResults = sorted.filter(row => {
              const d = new Date(row.date);
              const hasValue = row[paramKey] !== null && 
                              row[paramKey] !== undefined && 
                              row[paramKey] !== "" &&
                              row[paramKey] !== " ";
              return d >= currentStart && d <= currentEnd && hasValue;
            });

            if (weekResults.length < requirement.minResults) {
              paramMissingWindows.push({
                start: currentStart.toISOString().split("T")[0],
                end: currentEnd.toISOString().split("T")[0],
                found: weekResults.length,
                required: requirement.minResults,
                parameter: paramKey,
                period: 'weekly'
              });
            }

            currentStart.setDate(currentStart.getDate() + 7);
          }

          if (paramMissingWindows.length > 0) {
            coverageResults[paramKey] = {
              status: false,
              missingWindows: paramMissingWindows,
              requirement: `${requirement.minResults} résultats par semaine`,
              type: 'weekly'
            };
            missingWindows.push(...paramMissingWindows);
          } else {
            coverageResults[paramKey] = {
              status: true,
              requirement: `${requirement.minResults} résultats par semaine`,
              type: 'weekly'
            };
          }
        });
      }
    });

    // Check monthly coverage seulement pour les paramètres avec données
    Object.keys(requirements).forEach(reqType => {
      if (reqType.includes('monthly')) {
        const requirement = requirements[reqType];
        
        requirement.params.forEach(paramKey => {
          // Ignorer les paramètres sans données
          if (!paramsWithData[paramKey]) return;
          
          let currentStart = new Date(startDate);
          const paramMissingWindows = [];
          
          while (currentStart <= endDate) {
            const currentEnd = new Date(currentStart);
            currentEnd.setMonth(currentEnd.getMonth() + 1);
            currentEnd.setDate(currentEnd.getDate() - 1);

            const monthResults = sorted.filter(row => {
              const d = new Date(row.date);
              const hasValue = row[paramKey] !== null && 
                              row[paramKey] !== undefined && 
                              row[paramKey] !== "" &&
                              row[paramKey] !== " ";
              return d >= currentStart && d <= currentEnd && hasValue;
            });

            if (monthResults.length < requirement.minResults) {
              paramMissingWindows.push({
                start: currentStart.toISOString().split("T")[0],
                end: currentEnd.toISOString().split("T")[0],
                found: monthResults.length,
                required: requirement.minResults,
                parameter: paramKey,
                period: 'monthly'
              });
            }

            currentStart.setMonth(currentStart.getMonth() + 1);
          }

          if (paramMissingWindows.length > 0) {
            coverageResults[paramKey] = {
              status: false,
              missingWindows: paramMissingWindows,
              requirement: `${requirement.minResults} résultats par mois`,
              type: 'monthly'
            };
            missingWindows.push(...paramMissingWindows);
          } else {
            coverageResults[paramKey] = {
              status: true,
              requirement: `${requirement.minResults} résultats par mois`,
              type: 'monthly'
            };
          }
        });
      }
    });

    return {
      status: missingWindows.length === 0,
      missing: missingWindows,
      hasData: paramsWithData,
      requirements: requirements,
      coverageResults: coverageResults,
      coverageStatus: missingWindows.length === 0 ? "adequate" : "insufficient",
      productionPhase: productionPhase,
      dataPoints: sorted.length,
      periodCovered: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    };
  };

  const timeDependentCoverage = useMemo(() => {
    const paramKeys = allTimeDependentParams.map(p => p.jsonKey || p.key);
    return checkTemporalCoverage(dataToUse, paramKeys);
  }, [dataToUse, allTimeDependentParams, checkTemporalCoverage]);

  const allStats = useMemo(() => 
    allParameters.reduce((acc, param) => ({ ...acc, [param.key]: calculateStats(dataToUse, param.key) }), {}),
  [allParameters, dataToUse]);

  const calculateClassConformity = (classCompliance, statisticalCompliance, conditionsStatistiques, classe) => {
    console.log("=== CALCUL DE CONFORMITÉ ===");
    
    const hasHighDeviations = Object.keys(classCompliance).some(paramKey => {
      const compliance = classCompliance[paramKey];
      if (compliance.stats) {
        if (compliance.stats.percentLI !== "-" && parseFloat(compliance.stats.percentLI) > 5) {
          console.log(`❌ High LI deviation: ${paramKey} = ${compliance.stats.percentLI}%`);
          return true;
        }
        if (compliance.stats.percentLS !== "-" && parseFloat(compliance.stats.percentLS) > 5) {
          console.log(`❌ High LS deviation: ${paramKey} = ${compliance.stats.percentLS}%`);
          return true;
        }
        if (compliance.stats.percentLG !== "-" && parseFloat(compliance.stats.percentLG) > 5) {
          console.log(`❌ High LG défaut: ${paramKey} = ${compliance.stats.percentLG}%`);
          return true;
        }
      }
      return false;
    });

    const hasUnsatisfiedMesures = Object.keys(statisticalCompliance).some(key => {
      const compliance = statisticalCompliance[key];
      const isUnsatisfied = compliance && compliance.canCalculate && !compliance.satisfied;
      if (isUnsatisfied) {
        console.log(`❌ Unsatisfied mesure: ${key} = ${compliance.equation}`);
      }
      return isUnsatisfied;
    });

    let hasUnsatisfiedAttributs = false;
    Object.keys(classCompliance).forEach(paramKey => {
      const compliance = classCompliance[paramKey];
      if (compliance.values && compliance.values.length > 0) {
        const attributeResult = checkEquationSatisfaction(
          compliance.values,
          compliance.limits,
          conditionsStatistiques
        );
        if (attributeResult.canCalculate && !attributeResult.satisfied) {
          console.log(`❌ Unsatisfied attribute: ${paramKey} = ${attributeResult.equation}`);
          hasUnsatisfiedAttributs = true;
        }
      }
    });

    // ✅ INFORMATION SEULEMENT: Analyse de la couverture (pas un critère de conformité)
    const coverageAnalysis = {
      adequate: [],
      insufficient: [],
      warnings: []
    };

    // Analyser chaque paramètre critique (pour information seulement)
    Object.keys(coverageRequirements.coverageResults || {}).forEach(paramKey => {
      const coverage = coverageRequirements.coverageResults[paramKey];
      const paramLabel = getParameterLabel(paramKey);
      
      if (coverage.status) {
        coverageAnalysis.adequate.push({
          parameter: paramKey,
          label: paramLabel,
          requirement: coverage.requirement
        });
      } else {
        coverageAnalysis.insufficient.push({
          parameter: paramKey,
          label: paramLabel,
          requirement: coverage.requirement,
          missingPeriods: coverage.missingWindows.length,
          sampleCount: coverageRequirements.hasData[paramKey] ? 'Avec données' : 'Sans données'
        });
      }
    });

    // Vérifier les paramètres sans données (pour information seulement)
    const criticalParams = currentPhase === 'nouveau_type' 
      ? ["rc2j", "rc7j", "rc28j", "prise", "stabilite", "so3", "chlorure", "hydratation", "pfeu", "r_insoluble", "c3a", "pouzzolanicite"]
      : ["rc2j", "rc7j", "rc28j", "prise", "so3", "stabilite", "chlorure", "hydratation", "pfeu", "r_insoluble", "c3a", "pouzzolanicite"];

    criticalParams.forEach(paramKey => {
      if (!coverageRequirements.hasData[paramKey]) {
        coverageAnalysis.warnings.push({
          parameter: paramKey,
          label: getParameterLabel(paramKey),
          message: "Aucune donnée disponible"
        });
      }
    });

    // ✅ LA COUVERTURE N'EST PAS UN CRITÈRE DE CONFORMITÉ
    const isClassConforme = !hasHighDeviations && !hasUnsatisfiedMesures && !hasUnsatisfiedAttributs;

    console.log(`📊 Class Conformity Result:`, {
      hasHighDeviations,
      hasUnsatisfiedMesures,
      hasUnsatisfiedAttributs,
      coverageAnalysis, // Information seulement
      isClassConforme // Ne dépend pas de la couverture
    });
    console.log("=== FIN CALCUL CONFORMITÉ ===");

    return {
      isClassConforme,
      coverageAnalysis, // Information pour l'affichage seulement
      hasHighDeviations,
      hasUnsatisfiedMesures,
      hasUnsatisfiedAttributs
    };
  };

  // Ajoutez cette fonction après les autres fonctions helpers
  const getParameterLabel = (paramKey) => {
    const paramMap = {
      rc2j: "Résistance 2j",
      rc7j: "Résistance 7j", 
      rc28j: "Résistance 28j",
      prise: "Temps début prise",
      stabilite: "Stabilité",
      so3: "SO3",
      chlorure: "Chlorure",
      hydratation: "Chaleur d'hydratation",
      pfeu: "Perte au feu",
      r_insoluble: "Résidu insoluble",
      c3a: "C3A",
      pouzzolanicite: "Pouzzolanicité"
    };
    return paramMap[paramKey] || paramKey;
  };

  const getDeviationParameters = (classe) => {
    const isLowClass = ["32.5 L", "32.5 N", "42.5 L"].includes(classe);
    
    // ✅ MODIFICATION: Inclure "r_insoluble" et "pfeu" seulement si CEM I ou CEM III
    const baseLSParams = ["rc28j", "stabilite", "so3", "chlorure"];
    const baseLGParams = isLowClass 
      ? ["rc7j", "rc28j", "prise", "stabilite", "so3", "chlorure"]
      : ["rc2j", "rc28j", "prise", "stabilite", "so3", "chlorure"];

    // Ajouter les paramètres conditionnels
    if (isCemIOrCemIII) {
      baseLSParams.push("r_insoluble", "pfeu");
      baseLGParams.push("r_insoluble", "pfeu");
    }
    
    return {
      li: isLowClass 
        ? ["rc7j", "rc28j", "prise"]
        : ["rc2j", "rc28j", "prise"],
      ls: baseLSParams,
      lg: baseLGParams
    };
  };

  const renderDeviationSection = (classe, classCompliance, type) => {
    const params = getDeviationParameters(classe);
    const parametersToShow = params[type];
    
    const sectionTitles = {
      li: "Déviations Limites inférieures",
      ls: "Déviations Limites supérieures", 
      lg: "Défauts Limites garanties"
    };

    const deviationLabels = {
      li: "Déviation",
      ls: "Déviation",
      lg: "Défaut"
    };

    // ✅ FILTRE: Ne garder que les paramètres qui ont des données
    const parametersWithData = parametersToShow.filter(paramKey => {
      const hasData = hasDataForParameter(paramKey);
      if (!hasData) {
        console.log(`📊 Hiding parameter ${paramKey} from ${sectionTitles[type]} - no data`);
      }
      return hasData;
    });

    // ✅ FILTRE: Pour les paramètres spéciaux (ajout, C3A), vérifier s'ils ont des données
    const showAjoutInSection = showAjout && hasDataForParameter("ajout_percent");
    const showC3AInSection = showC3A && hasDataForParameter("c3a");

    return (
      <div className="section-box">
        <h4>{sectionTitles[type]}</h4>
        <div className="parameter-list">
          {parametersWithData.map(paramKey => {
            const param = allParameters.find(p => p.key === paramKey) || 
                         deviationOnlyParams.find(p => p.key === paramKey);
            
            if (!param) return null;

            const compliance = classCompliance[param.key];
            if (!compliance) return null;

            const { stats, limits } = compliance;
            
            const hasData = stats.count > 0;
            if (!hasData) return null;
            
            const percentValue = type === 'li' ? stats.percentLI : 
                               type === 'ls' ? stats.percentLS : 
                               stats.percentLG;
            
            const limitValue = type === 'li' ? limits.li : 
                             type === 'ls' ? limits.ls : 
                             limits.lg;

            const hasLimit = limitValue !== "-" && limitValue !== null && limitValue !== undefined;
            
            let displayText = "Aucune déviation";
            let deviationText = `${deviationLabels[type]}`;
            
            if (hasLimit) {
              const hasDeviation = percentValue !== "-" && parseFloat(percentValue) > 0;
              
              if (hasDeviation) {
                if (type === 'li') {
                  displayText = `${percentValue}% < ${limitValue}`;
                } else if (type === 'ls') {
                  displayText = `${percentValue}% > ${limitValue}`;
                } else if (type === 'lg') {
                  if (['rc2j', 'rc7j', 'rc28j', 'prise'].includes(paramKey)) {
                    displayText = `${percentValue}% < ${limitValue}`;
                  } else {
                    displayText = `${percentValue}% > ${limitValue}`;
                  }
                }
                deviationText = `${deviationLabels[type]}=${percentValue}%`;
              } else {
                if (type === 'li') {
                  displayText = `0.00% < ${limitValue}`;
                } else if (type === 'ls') {
                  displayText = `0.00% > ${limitValue}`;
                } else if (type === 'lg') {
                  if (['rc2j', 'rc7j', 'rc28j', 'prise'].includes(paramKey)) {
                    displayText = `0.00% < ${limitValue}`;
                  } else {
                    displayText = `0.00% > ${limitValue}`;
                  }
                }
                deviationText = `${deviationLabels[type]}=0.00%`;
              }
            } else {
              displayText = `0.00% < -`;
              deviationText = `${deviationLabels[type]}=0.00%`;
            }

            return (
              <div key={param.key} className="parameter-item">
                <span>{param.label}</span>
                <span>{displayText}</span>
                <span>{deviationText}</span>
              </div>
            );
          })}

          {/* ✅ FILTRE: Afficher ajout seulement s'il a des données */}
          {showAjoutInSection && type === 'li' && classCompliance.ajout_percent && classCompliance.ajout_percent.stats.count > 0 && (
            <div className="parameter-item">
              <span>Ajout: {getAjoutDescription(produitInfo?.type_ajout, ajoutsData)}</span>
              <span>
                {classCompliance.ajout_percent?.stats?.percentLI !== "-" && classCompliance.ajout_percent?.limits?.li !== "-"
                  ? `${classCompliance.ajout_percent.stats.percentLI}% < ${classCompliance.ajout_percent.limits.li}` 
                  : "0.00% < -"}
              </span>
              <span>
                {`Déviation=${classCompliance.ajout_percent?.stats?.percentLI !== "-" ? classCompliance.ajout_percent.stats.percentLI : "0.00"}%`}
              </span>
            </div>
          )}

          {showAjoutInSection && type === 'ls' && classCompliance.ajout_percent && classCompliance.ajout_percent.stats.count > 0 && (
            <div className="parameter-item">
              <span>Ajout: {getAjoutDescription(produitInfo?.type_ajout, ajoutsData)}</span>
              <span>
                {classCompliance.ajout_percent?.stats?.percentLS !== "-" && classCompliance.ajout_percent?.limits?.ls !== "-"
                  ? `${classCompliance.ajout_percent.stats.percentLS}% > ${classCompliance.ajout_percent.limits.ls}` 
                  : "0.00% > -"}
              </span>
              <span>
                {`Déviation=${classCompliance.ajout_percent?.stats?.percentLS !== "-" ? classCompliance.ajout_percent.stats.percentLS : "0.00"}%`}
              </span>
            </div>
          )}

          {/* ✅ FILTRE: Afficher C3A seulement s'il a des données */}
          {showC3AInSection && type === 'ls' && classCompliance.c3a && classCompliance.c3a.stats.count > 0 && (
            <div className="parameter-item">
              <span>C3A</span>
              <span>
                {classCompliance.c3a?.stats?.percentLS !== "-" && classCompliance.c3a?.limits?.ls !== "-"
                  ? `${classCompliance.c3a.stats.percentLS}% > ${classCompliance.c3a.limits.ls}` 
                  : "0.00% > -"}
              </span>
              <span>
                {`Déviation=${classCompliance.c3a?.stats?.percentLS !== "-" ? classCompliance.c3a.stats.percentLS : "0.00"}%`}
              </span>
            </div>
          )}

          {showC3AInSection && type === 'lg' && classCompliance.c3a && classCompliance.c3a.stats.count > 0 && (
            <div className="parameter-item">
              <span>C3A</span>
              <span>
                {classCompliance.c3a?.stats?.percentLG !== "-" && classCompliance.c3a?.limits?.lg !== "-"
                  ? `${classCompliance.c3a.stats.percentLG}% < ${classCompliance.c3a.limits.lg}` 
                  : "0.00% < -"}
              </span>
              <span>
                {`Défaut=${classCompliance.c3a?.stats?.percentLG !== "-" ? classCompliance.c3a.stats.percentLG : "0.00"}%`}
              </span>
            </div>
          )}

          {/* Message si aucune donnée n'est disponible pour cette section */}
          {parametersWithData.length === 0 && 
           !(showAjoutInSection && classCompliance.ajout_percent && classCompliance.ajout_percent.stats.count > 0) &&
           !(showC3AInSection && classCompliance.c3a && classCompliance.c3a.stats.count > 0) && (
            <div className="parameter-item">
              <span>Aucune donnée disponible</span>
              <span>-</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ NOUVELLE FONCTION: Générer la conclusion générale avec la phase détectée
  const generateGeneralConclusion = (coverageAnalysis, phase, coverageRequirements, conformiteData, dataToUse) => {
    const conclusions = [];
    
    const insufficientParams = coverageAnalysis.insufficient || [];
    const warningParams = coverageAnalysis.warnings || [];
    const hasData = coverageRequirements.hasData || {};

    // Fonction pour obtenir le nom français du paramètre
    const getFrenchParamName = (paramKey) => {
      const paramMap = {
        'rc2j': 'Résistance à 2 jours',
        'rc7j': 'Résistance à 7 jours',
        'rc28j': 'Résistance à 28 jours',
        'prise': 'Temps de début de prise',
        'so3': 'Teneur en sulfate',
        'stabilite': 'Stabilité',
        'pfeu': 'Perte au feu',
        'r_insoluble': 'Résidu insoluble',
        'chlorure': 'Chlorure',
        'c3a': 'C3A',
        'pouzzolanicite': 'Pouzzolanicité',
        'hydratation': 'Chaleur d\'hydratation',
        'ajout': 'Ajout'
      };
      return paramMap[paramKey] || paramKey;
    };

    // Récupérer les fréquences depuis le JSON
    const getFrequencyRequirements = () => {
      if (!conformiteData || !conformiteData.frequence_essais) {
        return [];
      }
      
      const phaseKey = phase === 'nouveau_type' ? 'nouveau_type_produit' : 'situation_courante';
      return conformiteData.frequence_essais[phaseKey]?.parametres || [];
    };

    const frequencyRequirements = getFrequencyRequirements();

    // Fonction pour vérifier si un paramètre a des données dans le tableau filtré
    const hasDataInFilteredTable = (paramKey) => {
      return dataToUse.some(row => {
        const value = row[paramKey];
        return value !== null && value !== undefined && value !== "" && value !== " ";
      });
    };

    // Fonction pour obtenir les périodes problématiques
    const getProblematicPeriods = (paramKey) => {
      const coverage = coverageRequirements.coverageResults[paramKey];
      if (!coverage || !coverage.missingWindows) return [];
      
      return coverage.missingWindows.map(window => {
        const startDate = new Date(window.start);
        const endDate = new Date(window.end);
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        if (window.period === 'weekly') {
          const weekNumber = Math.ceil((startDate.getDate() + startDate.getDay()) / 7);
          return `semaine ${weekNumber} de ${monthNames[startDate.getMonth()]}`;
        } else {
          return `mois de ${monthNames[startDate.getMonth()]}`;
        }
      });
    };

    // Filtrer seulement les paramètres qui ont des données dans le tableau
    const paramsWithData = frequencyRequirements.filter(req => 
      hasDataInFilteredTable(req.parametre)
    );

    // Vérifier les paramètres problématiques parmi ceux qui ont des données
    const problematicParams = paramsWithData.filter(req => {
      const paramKey = req.parametre;
      const isInsufficient = insufficientParams.some(item => item.parameter === paramKey);
      return isInsufficient;
    });

    // ✅ AFFICHER LA PHASE DÉTECTÉE DANS LA CONCLUSION
    const phaseText = phase === 'nouveau_type' ? 'un nouveau type produit' : 'une situation courante';
    conclusions.push(`Phase détectée: ${phase === 'nouveau_type' ? 'Nouveau type produit' : 'Situation courante'}`);

    if (problematicParams.length > 0) {
      // Grouper par période problématique
      const periodsMap = {};
      
      problematicParams.forEach(req => {
        const paramKey = req.parametre;
        const periods = getProblematicPeriods(paramKey);
        const paramName = getFrenchParamName(paramKey);
        
        periods.forEach(period => {
          if (!periodsMap[period]) {
            periodsMap[period] = [];
          }
          periodsMap[period].push(paramName);
        });
      });

      // Créer les conclusions par période
      Object.keys(periodsMap).forEach(period => {
        const paramNames = periodsMap[period].join(', ');
        conclusions.push(`La fréquence minimale d'essai pour ${phaseText} est non respectée pour le ${period}, cas : ${paramNames}.`);
      });

    } else {
      conclusions.push(`La fréquence minimale d'essai pour ${phaseText} est respectée pour tous les paramètres.`);
    }

    // Ajouter un message si aucun paramètre n'a de données
    if (paramsWithData.length === 0) {
      conclusions.push("Aucune donnée disponible pour l'analyse de couverture.");
    }

    return conclusions;
  };

  // Fonction pour obtenir les mois problématiques
  const getProblematicMonths = (coverageRequirements) => {
    const months = [];
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Analyser les périodes manquantes pour trouver les mois problématiques
    Object.keys(coverageRequirements.coverageResults || {}).forEach(paramKey => {
      const coverage = coverageRequirements.coverageResults[paramKey];
      if (coverage && !coverage.status) {
        coverage.missingWindows.forEach(window => {
          const month = new Date(window.start).getMonth();
          const monthName = monthNames[month];
          if (monthName && !months.includes(monthName)) {
            months.push(monthName);
          }
        });
      }
    });
    
    return months;
  };

  const renderClassSection = useCallback((classe) => {
    const selectedCement = produitInfo ? {
      name: produitInfo.nom || produitInfo.description || "Produit non spécifié",
      type: selectedProductType,
      class: classe,
      description: produitInfo.description || "",
      famille: finalFamilleName
    } : null;

    const classCompliance = {};
    const statisticalCompliance = {};
    
    const allParamsForDeviations = [...allParameters, ...deviationOnlyParams];

    const isLowClass = ["32.5 L", "32.5 N", "42.5 L"].includes(classe);
    
    allParamsForDeviations.forEach(param => {
      // ✅ FILTRE: Ne traiter que les paramètres qui ont des données
      if (!hasDataForParameter(param.key)) {
        console.log(`📊 Skipping parameter ${param.key} - no data in filtered table`);
        return;
      }

      const limits = getLimitsByClass(classe, param.key);
      const values = dataToUse.map(r => parseFloat(r[param.key])).filter(v => !isNaN(v));
      const stats = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
      
      classCompliance[param.key] = { 
        limits, 
        stats,
        values 
      };
      
      if (["rc2j", "rc7j", "rc28j"].includes(param.key)) {
        statisticalCompliance[`${param.key}_li`] = checkStatisticalCompliance(
          conformiteData, 
          allStats[param.key], 
          limits, 
          param.key,
          "li"
        );
        statisticalCompliance[`${param.key}_ls`] = checkStatisticalCompliance(
          conformiteData, 
          allStats[param.key], 
          limits, 
          param.key,
          "ls"
        );
      } else {
        if (limits.li !== "-" && limits.li !== null) {
          statisticalCompliance[`${param.key}_li`] = checkStatisticalCompliance(
            conformiteData, 
            allStats[param.key], 
            limits, 
            param.key,
            "li"
          );
        }
        if (limits.ls !== "-" && limits.ls !== null) {
          statisticalCompliance[`${param.key}_ls`] = checkStatisticalCompliance(
            conformiteData, 
            allStats[param.key], 
            limits, 
            param.key,
            "ls"
          );
        }
      }
    });

    // ✅ FILTRE: Ne garder que les paramètres qui ont des données pour chaque section
    const mesureParamsWithData = alwaysMesureParams.filter(param => hasDataForParameter(param.key));
    const attributParamsWithData = alwaysAttributParams.filter(param => hasDataForParameter(param.key));

    // ✅ FILTRE: Gérer C3A seulement s'il a des données
    if (showC3A && hasDataForParameter("c3a")) {
      const c3aParam = allTimeDependentParams.find(p => p.key === "c3a");
      if (c3aParam) {
        const hasDataForC3A = timeDependentCoverage.hasData[c3aParam.jsonKey || c3aParam.key];
        if (timeDependentCoverage.status && hasDataForC3A) {
          mesureParamsWithData.push(c3aParam);
        } else {
          attributParamsWithData.push(c3aParam);
        }
      }
    }

    // ✅ FILTRE: Gérer les autres paramètres time-dependent seulement s'ils ont des données
    allTimeDependentParams.forEach(param => {
      if (param.key === "c3a") return;
      if (!hasDataForParameter(param.key)) return;
      
      const paramKey = param.jsonKey || param.key;
      const hasDataForParam = timeDependentCoverage.hasData[paramKey];
      
      if (timeDependentCoverage.status && hasDataForParam) {
        if (!mesureParamsWithData.some(p => p.key === param.key)) {
          mesureParamsWithData.push(param);
        }
      } else {
        if (!attributParamsWithData.some(p => p.key === param.key)) {
          attributParamsWithData.push(param);
        }
      }
    });

    const conformityResult = calculateClassConformity(classCompliance, statisticalCompliance, conditionsStatistiques, classe);
    const { isClassConforme, coverageAnalysis } = conformityResult;

    return (
      <div className="class-section" key={classe}>
        <div className="report-header">
          <div style={{ marginBottom: "1rem" }}>
            <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
            <h2>Contrôle de conformité / classe de résistance</h2>
            {produitInfo && (
              <>
                <p><strong> {produitInfo.nom} ( {produitInfo.description} )</strong></p>
                <p><strong>Famille: {finalFamilleName} {isCemIOrCemIII ? "(CEM I ou CEM III)" : ""}</strong></p>
              </>
            )}
            <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
            {/* ✅ AFFICHAGE DE LA PHASE DÉTECTÉE */}
            <p><strong>Phase: {currentPhase === 'nouveau_type' ? 'Nouveau type produit' : 'Situation courante'}</strong></p>
          </div>
          
          <hr className="strong-hr" />
          <h3>CLASSE {classe}</h3>

          {/* ✅ Afficher les sections de déviations seulement si elles ont des paramètres avec données */}
          {(getDeviationParameters(classe).li.some(param => hasDataForParameter(param)) || 
           (showAjout && hasDataForParameter("ajout_percent")) || 
           (showC3A && hasDataForParameter("c3a"))) && (
            <div className="sections-horizontal">
              {renderDeviationSection(classe, classCompliance, 'li')}
            </div>
          )}

          {(getDeviationParameters(classe).ls.some(param => hasDataForParameter(param)) || 
           (showAjout && hasDataForParameter("ajout_percent")) || 
           (showC3A && hasDataForParameter("c3a"))) && (
            <div className="sections-horizontal">
              {renderDeviationSection(classe, classCompliance, 'ls')}
            </div>
          )}

          {(getDeviationParameters(classe).lg.some(param => hasDataForParameter(param)) || 
           (showAjout && hasDataForParameter("ajout_percent")) || 
           (showC3A && hasDataForParameter("c3a"))) && (
            <div className="sections-horizontal">
              {renderDeviationSection(classe, classCompliance, 'lg')}
            </div>
          )}

          {/* ✅ Afficher contrôle par mesures seulement s'il y a des paramètres avec données */}
          {mesureParamsWithData.length > 0 && (
            <div className="sections-horizontal">
              <div className="section-box">
                <h4>Contrôle par Mesures des résistances mécaniques</h4>
                <div className="parameter-list">
                  {isLowClass && (
                    <>
                      {/* ✅ Afficher rc7j LI seulement s'il a des données */}
                      {hasDataForParameter("rc7j") && statisticalCompliance[`rc7j_li`] && (
                        <div className="parameter-item">
                          <span>Résistance courante 7 jrs LI</span>
                          <span>
                            {statisticalCompliance[`rc7j_li`]?.displayEquation || statisticalCompliance[`rc7j_li`]?.equation || "Calcul en cours..."}
                          </span>
                          <span>
                            {statisticalCompliance[`rc7j_li`] ? 
                              (statisticalCompliance[`rc7j_li`].noLimit ? "Pas de limite définie" :
                               statisticalCompliance[`rc7j_li`].equation.includes("insuffisantes") || statisticalCompliance[`rc7j_li`].equation.includes("non disponible") ? 
                                "Données insuffisantes" : 
                                (statisticalCompliance[`rc7j_li`].satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                              : "Calcul en cours..."
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* ✅ Afficher rc28j seulement s'il a des données */}
                      {hasDataForParameter("rc28j") && (
                        <>
                          {statisticalCompliance[`rc28j_li`] && (
                            <div className="parameter-item">
                              <span>Résistance courante 28 jrs LI</span>
                              <span>
                                {statisticalCompliance[`rc28j_li`]?.displayEquation || statisticalCompliance[`rc28j_li`]?.equation || "Calcul en cours..."}
                              </span>
                              <span>
                                {statisticalCompliance[`rc28j_li`] ? 
                                  (statisticalCompliance[`rc28j_li`].noLimit ? "Pas de limite définie" :
                                   statisticalCompliance[`rc28j_li`].equation.includes("insuffisantes") || statisticalCompliance[`rc28j_li`].equation.includes("non disponible") ? 
                                    "Données insuffisantes" : 
                                    (statisticalCompliance[`rc28j_li`].satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                                  : "Calcul en cours..."
                                }
                              </span>
                            </div>
                          )}
                          
                          {statisticalCompliance[`rc28j_ls`] && (
                            <div className="parameter-item">
                              <span>Résistance courante 28 jrs LS</span>
                              <span>
                                {statisticalCompliance[`rc28j_ls`]?.displayEquation || statisticalCompliance[`rc28j_ls`]?.equation || "Calcul en cours..."}
                              </span>
                              <span>
                                {statisticalCompliance[`rc28j_ls`] ? 
                                  (statisticalCompliance[`rc28j_ls`].noLimit ? "Pas de limite définie" :
                                   statisticalCompliance[`rc28j_ls`].equation.includes("insuffisantes") || statisticalCompliance[`rc28j_ls`].equation.includes("non disponible") ? 
                                    "Données insuffisantes" : 
                                    (statisticalCompliance[`rc28j_ls`].satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                                  : "Calcul en cours..."
                                }
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {!isLowClass && (
                    <>
                      {/* ✅ Afficher rc2j LI seulement s'il a des données */}
                      {hasDataForParameter("rc2j") && statisticalCompliance[`rc2j_li`] && (
                        <div className="parameter-item">
                          <span>Résistance courante 2 jrs LI</span>
                          <span>
                            {statisticalCompliance[`rc2j_li`]?.displayEquation || statisticalCompliance[`rc2j_li`]?.equation || "Calcul en cours..."}
                          </span>
                          <span>
                            {statisticalCompliance[`rc2j_li`] ? 
                              (statisticalCompliance[`rc2j_li`].noLimit ? "Pas de limite définie" :
                               statisticalCompliance[`rc2j_li`].equation.includes("insuffisantes") || statisticalCompliance[`rc2j_li`].equation.includes("non disponible") ? 
                                "Données insuffisantes" : 
                                (statisticalCompliance[`rc2j_li`].satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                              : "Calcul en cours..."
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* ✅ Afficher rc28j seulement s'il a des données */}
                      {hasDataForParameter("rc28j") && (
                        <>
                          {statisticalCompliance[`rc28j_li`] && (
                            <div className="parameter-item">
                              <span>Résistance courante 28 jrs LI</span>
                              <span>
                                {statisticalCompliance[`rc28j_li`]?.displayEquation || statisticalCompliance[`rc28j_li`]?.equation || "Calcul en cours..."}
                              </span>
                              <span>
                                {statisticalCompliance[`rc28j_li`] ? 
                                  (statisticalCompliance[`rc28j_li`].noLimit ? "Pas de limite définie" :
                                   statisticalCompliance[`rc28j_li`].equation.includes("insuffisantes") || statisticalCompliance[`rc28j_li`].equation.includes("non disponible") ? 
                                    "Données insuffisantes" : 
                                    (statisticalCompliance[`rc28j_li`].satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                                  : "Calcul en cours..."
                                }
                              </span>
                            </div>
                          )}
                          
                          {statisticalCompliance[`rc28j_ls`] && (
                            <div className="parameter-item">
                              <span>Résistance courante 28 jrs LS</span>
                              <span>
                                {statisticalCompliance[`rc28j_ls`]?.displayEquation || statisticalCompliance[`rc28j_ls`]?.equation || "Calcul en cours..."}
                              </span>
                              <span>
                                {statisticalCompliance[`rc28j_ls`] ? 
                                  (statisticalCompliance[`rc28j_ls`].noLimit ? "Pas de limite définie" :
                                   statisticalCompliance[`rc28j_ls`].equation.includes("insuffisantes") || statisticalCompliance[`rc28j_ls`].equation.includes("non disponible") ? 
                                    "Données insuffisantes" : 
                                    (statisticalCompliance[`rc28j_ls`].satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                                  : "Calcul en cours..."
                                }
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ✅ Afficher les autres paramètres de mesure seulement s'ils ont des données */}
                  {mesureParamsWithData
                    .filter(param => !["rc2j", "rc7j", "rc28j"].includes(param.key))
                    .map(param => {
                      const liCompliance = statisticalCompliance[`${param.key}_li`];
                      const lsCompliance = statisticalCompliance[`${param.key}_ls`];
                      
                      return (
                        <div key={param.key}>
                          {liCompliance && (
                            <div className="parameter-item">
                              <span>{param.label} LI</span>
                              <span>{liCompliance.displayEquation || liCompliance.equation}</span>
                              <span>
                                {liCompliance.noLimit ? "Pas de limite définie" :
                                 liCompliance.equation.includes("insuffisantes") || liCompliance.equation.includes("non disponible") ? 
                                  "Données insuffisantes" : 
                                  (liCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite")
                                }
                              </span>
                            </div>
                          )}
                          {lsCompliance && (
                            <div className="parameter-item">
                              <span>{param.label} LS</span>
                              <span>{lsCompliance.displayEquation || lsCompliance.equation}</span>
                              <span>
                                {lsCompliance.noLimit ? "Pas de limite définie" :
                                 lsCompliance.equation.includes("insuffisantes") || lsCompliance.equation.includes("non disponible") ? 
                                  "Données insuffisantes" : 
                                  (lsCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite")
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Afficher contrôle par attributs seulement s'il y a des paramètres avec données */}
          {attributParamsWithData.length > 0 && (
            <div className="sections-horizontal">
              <div className="section-box">
                <h4>Contrôle par Attributs propriétés physiques & chimiques</h4>
                <div className="parameter-list">
                  {attributParamsWithData.map(param => {
                    const attributeResult = checkEquationSatisfaction(
                      classCompliance[param.key]?.values || [],
                      classCompliance[param.key]?.limits || {},
                      conditionsStatistiques
                    );
                    
                    return (
                      <div key={param.key} className="parameter-item">
                        <span>{param.label}</span>
                        <span>
                          {attributeResult.displayText}
                        </span>
                        <span>
                          {attributeResult.noLimits ? "Pas de limites définies" :
                           attributeResult.equation.includes("insuffisantes") || 
                           attributeResult.equation.includes("manquantes") || 
                           attributeResult.equation.includes("non chargées") ? 
                            "Données insuffisantes" : 
                            (attributeResult.satisfied ? "Équation satisfaite" : "Équation non satisfaite")
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="conclusion-section">
            <div className="conformity-summary">
              <h4>CONCLUSION : 
                {/* SEULEMENT LA CONCLUSION GÉNÉRALE */}
                <div className="conclusion-text">
                  {generateGeneralConclusion(coverageAnalysis, currentPhase, coverageRequirements, conformiteData, dataToUse).map((conclusion, index) => (
                    <div key={index} className="conclusion-line">
                      {conclusion}
                    </div>
                  ))}
                </div> 
              </h4>
            </div>

            {/* Boîte de conformité finale */}
            <div className={`conformity-box ${isClassConforme ? 'conforme' : 'non-conforme'}`}>
              <strong>CONFORMITÉ: {isClassConforme ? 'CONFORME' : 'NON CONFORME'}</strong>
            </div>
          </div>
          
          <hr className="section-divider" />
        </div>
      </div>
    );
  }, [
    produitInfo, selectedProductType, finalFamilleName, clients, clientId, 
    filterPeriod, produitDescription, allParameters, deviationOnlyParams, 
    dataToUse, keyMapping, conformiteData, allStats, getLimitsByClass,
    conditionsStatistiques, timeDependentCoverage, allTimeDependentParams,
    alwaysMesureParams, alwaysAttributParams, showC3A, showAjout, hasDataForParameter,
    isCemIOrCemIII, currentPhase, coverageRequirements
  ]);

  const handleExport = () => alert("Exporting...");
  const handlePrint = () => alert("Printing...");
  const handleSave = () => alert("Saving...");

  if (loading) {
    return (
      <div className="cement-report-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des données de référence...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="cement-report-container">
        <div className="error-container">
          <h2>Erreur de données</h2>
          <p>{dataError}</p>
        </div>
      </div>
    );
  }

  if (!dataToUse.length) {
    return (
      <div className="cement-report-container">
        <div className="no-data-container">
          <h2>Aucune donnée disponible</h2>
          <p>Veuillez d'abord filtrer des échantillons.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cement-report-container">
      {classes.map(classe => renderClassSection(classe))}
      
      <div className="actions-bar">
        <div className="file-actions">
          <button className="action-btn export-btn" onClick={handleExport} disabled={!dataToUse.length}>
            Exporter
          </button>
          <button className="action-btn print-btn" onClick={handlePrint} disabled={!dataToUse.length}>
            Imprimer
          </button>
        </div>
        <div className="data-actions">
          <button className="action-btn save-btn" onClick={handleSave} disabled={!dataToUse.length}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControleConformite;