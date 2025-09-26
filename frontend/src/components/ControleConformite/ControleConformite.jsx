import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import './ControleConformite.css';
import { useData } from "../../context/DataContext";

const calculateStats = (data, key) => {
 
  
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
  

  // ✅ CORRECTION : Vérification plus explicite
  if (values.length === 0) {
    
    
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

  const zeroValues = values.filter(v => v === 0);


  // ✅ CORRECTION : Utilisation de reduce pour éviter les problèmes de stack
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
  const countLG = (lg !== null && lg !== "-") ? values.filter(v => v < parseFloat(lg)).length : 0;

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

const ControleConformite = ({
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
  const [selectedProductFamily, setSelectedProductFamily] = useState("");
  const [dataError, setDataError] = useState(null);
  const [conditionsStatistiques, setConditionsStatistiques] = useState([]);
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

  // Get product type and famille from produitInfo with fallbacks
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

  // Parameters configuration
  const timeDependentParams = [
    { key: "prise", label: "Temp debut de prise", jsonKey: "temps_debut_de_prise" },
    { key: "pfeu", label: "Perte au Feu", jsonKey: "pert_feu" },
    { key: "r_insoluble", label: "Résidu Insoluble", jsonKey: "residu_insoluble" },
    { key: "so3", label: "Teneur en sulfate", jsonKey: "sulfat" },
    { key: "chlorure", label: "Chlorure", jsonKey: "chlore" },
    { key: "hydratation", label: "Chaleur d'Hydratation", jsonKey: "chaleur_hydratation" },
  ];

  const deviationOnlyParams = [
    { key: "ajout_percent", label: "Ajout(Calcaire)", jsonKey: "ajout" } 
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

  // Add C3A to time-dependent params if needed
  const allTimeDependentParams = [...timeDependentParams];
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

  // Data fetching effects
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

  // Debug logging function
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

    // For "ajout" parameter, the structure is different
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
      addDebugLog(`❌ No data found for class "${classe}" in famille "${finalFamilleCode}"`);
      return { li: "-", ls: "-", lg: "-" };
    }

    return {
      li: classData.limit_inf ?? classData.limitInf ?? "-",
      ls: classData.limit_max ?? classData.limitSup ?? classData.limitMax ?? "-",
      lg: classData.garantie ?? classData.garantieValue ?? "-",
    };
  }, [mockDetails, keyMapping, finalFamilleCode, selectedProductType, addDebugLog]);

  // Temporal coverage check
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
    const paramKeys = allTimeDependentParams.map(p => p.jsonKey || p.key);
    return checkTemporalCoverage(dataToUse, paramKeys);
  }, [dataToUse, allTimeDependentParams, checkTemporalCoverage]);

  const allStats = useMemo(() => 
    allParameters.reduce((acc, param) => ({ ...acc, [param.key]: calculateStats(dataToUse, param.key) }), {}),
  [allParameters, dataToUse]);

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

  const renderClassSection = useCallback((classe) => {
    // Create selectedCement from produitInfo
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

    allParamsForDeviations.forEach(param => {
      const limits = getLimitsByClass(classe, param.key);
      const values = dataToUse.map(r => parseFloat(r[param.key])).filter(v => !isNaN(v));
      const stats = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
      
      classCompliance[param.key] = { 
        limits, 
        stats,
        values 
      };
      
      if (limits.li !== "-" || limits.ls !== "-") {
        const category = keyMapping[param.key]?.category;
        if (limits.li !== "-") statisticalCompliance[`${param.key}_li`] = checkStatisticalCompliance(conformiteData, allStats[param.key], limits, category, "li");
        if (limits.ls !== "-") statisticalCompliance[`${param.key}_ls`] = checkStatisticalCompliance(conformiteData, allStats[param.key], limits, category, "ls");
      }
    });

    // Determine which parameters go in which section
    const mesureParams = [...alwaysMesureParams];
    const attributParams = [...alwaysAttributParams];

    // Handle C3A based on temporal coverage
    if (showC3A) {
      const c3aParam = allTimeDependentParams.find(p => p.key === "c3a");
      if (c3aParam) {
        const hasDataForC3A = timeDependentCoverage.hasData[c3aParam.jsonKey || c3aParam.key];
        if (timeDependentCoverage.status && hasDataForC3A) {
          mesureParams.push(c3aParam);
        } else {
          attributParams.push(c3aParam);
        }
      }
    }

    // Handle other time-dependent params
    allTimeDependentParams.forEach(param => {
      if (param.key === "c3a") return;
      
      const paramKey = param.jsonKey || param.key;
      const hasDataForParam = timeDependentCoverage.hasData[paramKey];
      
      if (timeDependentCoverage.status && hasDataForParam) {
        mesureParams.push(param);
      } else {
        attributParams.push(param);
      }
    });

    const isClassConforme = calculateClassConformity(classCompliance, statisticalCompliance, conditionsStatistiques);

    return (
      <div className="class-section" key={classe}>
        <div className="report-header">
       <div style={{ marginBottom: "1rem" }}>
        <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
          <h2>Contrôle de conformité / classe de résistance</h2>
        {produitInfo && (
          <>
            <p><strong> {produitInfo.nom} ( {produitInfo.description} )</strong></p>
          </>
        )}
        <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
      </div>
          
          <hr className="strong-hr" />
          <h3>CLASSE {classe}</h3>

          {/* Deviations Sections */}
          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Déviations Limites inférieures</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Résistance à court terme à 02 j (RC2J)</span>
                  <span>{classCompliance.rc2j?.stats?.percentLI !== "-" 
                    ? `${classCompliance.rc2j.stats.percentLI}% < ${classCompliance.rc2j.limits.li}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.rc2j?.stats?.percentLI}%</span>
                </div>
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J)</span>
                  <span>{classCompliance.rc28j?.stats?.percentLI !== "-" 
                    ? `${classCompliance.rc28j.stats.percentLI}% < ${classCompliance.rc28j.limits.li}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.rc28j?.stats?.percentLI}%</span>
                </div>
                <div className="parameter-item">
                  <span>Temps de début de prise (Prise)</span>
                  <span>{classCompliance.prise?.stats?.percentLI !== "-" 
                    ? `${classCompliance.prise.stats.percentLI}% < ${classCompliance.prise.limits.li}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.prise?.stats?.percentLI}%</span>
                </div>

                {showAjout && classCompliance.ajout_percent && (
                  <div className="parameter-item">
                    <span>Ajout(Calcaire)</span>
                    <span>
                      {classCompliance.ajout_percent?.stats?.percentLI !== "-" 
                        ? `${classCompliance.ajout_percent.stats.percentLI}% < ${classCompliance.ajout_percent.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.ajout_percent?.stats?.percentLI}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Déviations Limites supérieures</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J)</span>
                  <span>{classCompliance.rc28j?.stats?.percentLS !== "-" 
                    ? `${classCompliance.rc28j.stats.percentLS}% > ${classCompliance.rc28j.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.rc28j?.stats?.percentLS}%</span>
                </div>
                <div className="parameter-item">
                  <span>Stabilité (Stabilite)</span>
                  <span>{classCompliance.stabilite?.stats?.percentLS !== "-" 
                    ? `${classCompliance.stabilite.stats.percentLS}% > ${classCompliance.stabilite.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.stabilite?.stats?.percentLS}%</span>
                </div>
                <div className="parameter-item">
                  <span>Sulfate (SO3)</span>
                  <span>{classCompliance.so3?.stats?.percentLS !== "-" 
                    ? `${classCompliance.so3.stats.percentLS}% > ${classCompliance.so3.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.so3?.stats?.percentLS}%</span>
                </div>
                <div className="parameter-item">
                  <span>Chlorure (Chlorure)</span>
                  <span>{classCompliance.chlorure?.stats?.percentLS !== "-" 
                    ? `${classCompliance.chlorure.stats.percentLS}% > ${classCompliance.chlorure.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.chlorure?.stats?.percentLS}%</span>
                </div>

                {showC3A && classCompliance.c3a && (
                  <div className="parameter-item">
                    <span>C3A</span>
                    <span>
                      {classCompliance.c3a?.stats?.percentLS !== "-" 
                        ? `${classCompliance.c3a.stats.percentLS}% > ${classCompliance.c3a.limits.ls}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.c3a?.stats?.percentLS}%</span>
                  </div>
                )}

                {showAjout && classCompliance.ajout_percent && (
                  <div className="parameter-item">
                    <span>Ajout(Calcaire)</span>
                    <span>
                      {classCompliance.ajout_percent?.stats?.percentLS !== "-" 
                        ? `${classCompliance.ajout_percent.stats.percentLS}% > ${classCompliance.ajout_percent.limits.ls}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.ajout_percent?.stats?.percentLS}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Défauts Limites garanties</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Résistance à court terme à 02 j (RC2J)</span>
                  <span>{classCompliance.rc2j?.stats?.percentLG !== "-" 
                    ? `${classCompliance.rc2j.stats.percentLG}% < ${classCompliance.rc2j.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.rc2j?.stats?.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J)</span>
                  <span>{classCompliance.rc28j?.stats?.percentLG !== "-" 
                    ? `${classCompliance.rc28j.stats.percentLG}% < ${classCompliance.rc28j.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.rc28j?.stats?.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Temps de début de prise (Prise)</span>
                  <span>{classCompliance.prise?.stats?.percentLG !== "-" 
                    ? `${classCompliance.prise.stats.percentLG}% < ${classCompliance.prise.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.prise?.stats?.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Stabilité (Stabilite)</span>
                  <span>{classCompliance.stabilite?.stats?.percentLG !== "-" 
                    ? `${classCompliance.stabilite.stats.percentLG}% > ${classCompliance.stabilite.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.stabilite?.stats?.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Sulfate (SO3)</span>
                  <span>{classCompliance.so3?.stats?.percentLG !== "-" 
                    ? `${classCompliance.so3.stats.percentLG}% > ${classCompliance.so3.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.so3?.stats?.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Chlorure (Chlorure)</span>
                  <span>{classCompliance.chlorure?.stats?.percentLG !== "-" 
                    ? `${classCompliance.chlorure.stats.percentLG}% > ${classCompliance.chlorure.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.chlorure?.stats?.percentLG}%</span>
                </div>

                {showC3A && (
                  <div className="parameter-item">
                    <span>C3A</span>
                    <span>
                      {classCompliance.c3a?.stats?.percentLG !== "-" 
                        ? `${classCompliance.c3a.stats.percentLG}% < ${classCompliance.c3a.limits.lg}` 
                        : "Aucun défaut"}
                    </span>
                    <span>Défaut={classCompliance.c3a?.stats?.percentLG}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

{/* Contrôle par Mesures */}
<div className="sections-horizontal">
  <div className="section-box">
    <h4>Contrôle par Mesures des résistances mécaniques</h4>
    <div className="parameter-list">
      {mesureParams.map(param => {
        const liCompliance = statisticalCompliance[`${param.key}_li`];
        const lsCompliance = statisticalCompliance[`${param.key}_ls`];
        
        if (param.key === 'rc28j') {
          return (
            <div key={param.key}>
              <div className="parameter-item">
                <span>{param.label} LI</span>
                <span>
                  {liCompliance?.equation || "Données insuffisantes"}
                </span>
                <span>
                  {liCompliance ? 
                    (liCompliance.equation.includes("insuffisantes") || liCompliance.equation.includes("non disponible") ? 
                      "Données insuffisantes" : 
                      (liCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                    : "Données insuffisantes"
                  }
                </span>
              </div>
              <div className="parameter-item">
                <span>{param.label} LS</span>
                <span>
                  {lsCompliance?.equation || "Données insuffisantes"}
                </span>
                <span>
                  {lsCompliance ? 
                    (lsCompliance.equation.includes("insuffisantes") || lsCompliance.equation.includes("non disponible") ? 
                      "Données insuffisantes" : 
                      (lsCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                    : "Données insuffisantes"
                  }
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div key={param.key} className="parameter-item">
              <span>{param.label} LI</span>
              <span>
                {liCompliance?.equation || "Données insuffisantes"}
              </span>
              <span>
                {liCompliance ? 
                  (liCompliance.equation.includes("insuffisantes") || liCompliance.equation.includes("non disponible") ? 
                    "Données insuffisantes" : 
                    (liCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"))
                  : "Données insuffisantes"
                }
              </span>
            </div>
          );
        }
      })}
    </div>
  </div>
</div>

{/* Contrôle par Attributs */}
<div className="sections-horizontal">
  <div className="section-box">
    <h4>Contrôle par Attributs propriétés physiques & chimiques</h4>
    <div className="parameter-list">
      {attributParams.map(param => {
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
              {attributeResult.equation.includes("insuffisantes") || 
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

          {/* Class Conclusion */}
          <div className="conclusion-section">
            <div className="conformity-summary">
              <h4>CONCLUSION : {isClassConforme ? 'CONFORME' : 'NON CONFORME'}</h4>
            </div>
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
    alwaysMesureParams, alwaysAttributParams, showC3A, showAjout
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