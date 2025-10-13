import React, { useState, useEffect, useCallback, useMemo,forwardRef, useImperativeHandle } from "react";
import PDFExportService from "../ControleConformite/PDFExportService";
import "./TableConformite.css";
import { useData } from "../../context/DataContext";
import CentralExportService from "../../services/CentralExportService"; 

import jsPDF from "jspdf";
import "jspdf-autotable";

const calculateStats = (data, key) => {
  const missingValues = [];
  const values = [];
  
  data.forEach((row, index) => {
    let value;
    
    // Pour le taux d'ajout, utiliser la colonne ajout_percent
    if (key === "ajt") {
      value = row.ajout_percent;
    } else {
      value = row[key];
    }
    
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
    min: min.toFixed(3),
    max: max.toFixed(3),
    mean: mean.toFixed(3),
    std: std.toFixed(3),
  };
};

const evaluateLimits = (data, key, li, ls, lg) => {
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === "-") return NaN;
    return parseFloat(String(val).replace(',', '.'));
  };

  // Pour le taux d'ajout, utiliser la colonne ajout_percent
  const getValue = (row) => {
    if (key === "ajt") {
      return row.ajout_percent;
    }
    return row[key];
  };

  const values = data.map((row) => safeParse(getValue(row))).filter((v) => !isNaN(v));
  
  // Si aucune donnée valide, retourner "-"
  if (!values.length) {
    return { 
      belowLI: "-", 
      aboveLS: "-", 
      belowLG: "-", 
      percentLI: "-", 
      percentLS: "-", 
      percentLG: "-" 
    };
  }

  const liNum = safeParse(li);
  const lsNum = safeParse(ls);
  const lgNum = safeParse(lg);

  // Vérifier si les limites sont définies pour ce paramètre
  const hasLI = !isNaN(liNum);
  const hasLS = !isNaN(lsNum);
  const hasLG = !isNaN(lgNum);

  let belowLI = 0;
  let aboveLS = 0;
  let belowLG = 0;

  // Calculer seulement si la limite est définie
  if (hasLI) {
    belowLI = values.filter((v) => v < liNum).length;
  }
  
  if (hasLS) {
    aboveLS = values.filter((v) => v > lsNum).length;
  }
  
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
    belowLI: hasLI ? belowLI : "-",
    aboveLS: hasLS ? aboveLS : "-",
    belowLG: hasLG ? belowLG : "-",
    percentLI: hasLI ? ((belowLI / total) * 100).toFixed(1) : "-",
    percentLS: hasLS ? ((aboveLS / total) * 100).toFixed(1) : "-",
    percentLG: hasLG ? ((belowLG / total) * 100).toFixed(1) : "-",
  };
};

const TableConformite = ({
  clientId, 
  clientTypeCimentId, 
  produitInfo,
  produitDescription, 
  clients = [], 
  produits = [] ,
  ajoutsData,
  getAjoutDescription,
  phase,
}) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [conformiteData, setConformiteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [conditionsStatistiques, setConditionsStatistiques] = useState([]);

  const dataToUse = filteredTableData || [];

  // Map front-end keys -> JSON keys - MÊME LOGIQUE QUE DonneesStatistiques
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
    ajt: "Ajout", // MÊME CORRECTION : "Ajout" avec majuscule
    c3a: "C3A",
  };

  // Get product type and famille from produitInfo with fallbacks - MÊME LOGIQUE
  const selectedProductType = produitInfo?.nom || produitInfo?.code || "";
  const selectedProductFamille = produitInfo?.famille?.code || "";
  const selectedProductFamilleName = produitInfo?.famille?.nom || "";

  const determineFamilleFromType = (productType) => {
    if (!productType) return "";
    
    const familleMatch = productType.match(/^(CEM [I|II|III|IV|V]+)/);
    if (familleMatch) {
      return familleMatch[1];
    }
    
    return "";
  };

  // Final famille values with fallback - MÊME LOGIQUE
  const finalFamilleCode = selectedProductFamille || determineFamilleFromType(selectedProductType);
  const finalFamilleName = selectedProductFamilleName || finalFamilleCode;

  // Déterminer quelles colonnes afficher - MÊME LOGIQUE
  const showC3A = finalFamilleCode === "CEM I";
  const showTauxAjout = finalFamilleCode !== "CEM I";

  // Default parameters - MÊME STRUCTURE
  let parameters = [
    { key: "rc2j", label: "Résistance courante 2 jrs" },
    { key: "rc7j", label: "Résistance courante 7 jrs" },
    { key: "rc28j", label: "Résistance courante 28 jrs" },
    { key: "prise", label: "Temp debut de prise" },
    { key: "stabilite", label: "Stabilité" },
    { key: "pouzzolanicite", label: "Pouzzolanicité" },
    { key: "hydratation", label: "Chaleur d'Hydratation" },
    { key: "pfeu", label: "Perte au Feu" },
    { key: "r_insoluble", label: "Résidu Insoluble" },
    { key: "so3", label: "Teneur en sulfate" },
    { key: "chlorure", label: "Chlorure" },
  ];

  // Add C3A if famille is CEM I - MÊME LOGIQUE
  if (showC3A) {
    parameters.push({ key: "c3a", label: "C3A" });
  }

  // Add Taux Ajout if famille is NOT CEM I - MÊME LOGIQUE
  if (showTauxAjout) {
    parameters.push({ key: "ajt", label: "Taux Ajout" });
  }

  // Charger les données depuis le fichier JSON - MÊME LOGIQUE
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

  // Fonction getLimitsByClass - MÊME LOGIQUE QUE DonneesStatistiques
  const getLimitsByClass = useCallback((classe, key) => {
    const mockKey = keyMapping[key];
    
    if (!mockKey || !mockDetails[mockKey]) {
      return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
    }

    const parameterData = mockDetails[mockKey];
    
    // Vérifier si la famille existe dans les données
    if (!parameterData[finalFamilleCode]) {
      return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
    }

    const familleData = parameterData[finalFamilleCode];
    let classData = null;

    // CORRECTION : Structure unifiée pour tous les paramètres
    // La structure est toujours: { "Famille": { "TypeProduit": [array de classes], ... } }
    
    // 1. Chercher avec le type de produit exact
    if (familleData[selectedProductType]) {
      const productData = familleData[selectedProductType];
      
      if (Array.isArray(productData)) {
        classData = productData.find(item => item.classe === classe);
      }
    }
    
    // 2. Fallback: chercher dans tous les types de produits de cette famille
    if (!classData) {
      for (const productTypeKey in familleData) {
        const productData = familleData[productTypeKey];
        if (Array.isArray(productData)) {
          classData = productData.find(item => item.classe === classe);
          if (classData) break;
        }
      }
    }

    if (!classData) {
      return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
    }

    // Extraire les valeurs avec gestion des valeurs null
    return {
      li: classData.limit_inf !== null ? classData.limit_inf : "-",
      ls: classData.limit_max !== null ? classData.limit_max : "-",
      lg: classData.garantie !== null ? classData.garantie : "-",
      limit_inf: classData.limit_inf,
      limit_max: classData.limit_max
    };
  }, [mockDetails, finalFamilleCode, selectedProductType]);

  const allStats = useMemo(() => 
    parameters.reduce((acc, param) => ({ 
      ...acc, 
      [param.key]: calculateStats(dataToUse, param.key) 
    }), {}),
  [parameters, dataToUse]);

  const classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"];

  // FONCTION : Déterminer quelles limites sont pertinentes pour chaque paramètre
  const getRelevantLimits = (paramKey, limits) => {
    const relevantLimits = {
      hasLI: false,
      hasLS: false, 
      hasLG: false,
      hasControl: false // Nouveau : indique si le contrôle statistique est applicable
    };

    switch(paramKey) {
      // Paramètres avec LI, LS, LG et contrôle statistique
      case "rc2j":
      case "rc7j":
      case "rc28j":
      case "prise":
      case "hydratation":
      case "pfeu":
      case "r_insoluble":
      case "so3":
      case "chlorure":
        relevantLimits.hasLI = limits.li !== "-";
        relevantLimits.hasLS = limits.ls !== "-";
        relevantLimits.hasLG = limits.lg !== "-";
        relevantLimits.hasControl = true;
        break;
      
      // C3A : seulement LS et LG, avec contrôle statistique
      case "c3a":
        relevantLimits.hasLI = false;
        relevantLimits.hasLS = limits.ls !== "-";
        relevantLimits.hasLG = limits.lg !== "-";
        relevantLimits.hasControl = true;
        break;
      
      // Taux Ajout : seulement LI et LS, SANS contrôle statistique
      case "ajt":
        relevantLimits.hasLI = limits.li !== "-";
        relevantLimits.hasLS = limits.ls !== "-";
        relevantLimits.hasLG = false;
        relevantLimits.hasControl = false;
        break;
      
      // Paramètres d'attribut avec seulement LS et contrôle par attribut
      case "stabilite":
      case "pouzzolanicite":
        relevantLimits.hasLI = false;
        relevantLimits.hasLS = limits.ls !== "-";
        relevantLimits.hasLG = false;
        relevantLimits.hasControl = true;
        break;
      
      default:
        relevantLimits.hasLI = limits.li !== "-";
        relevantLimits.hasLS = limits.ls !== "-";
        relevantLimits.hasLG = limits.lg !== "-";
        relevantLimits.hasControl = true;
    }

    return relevantLimits;
  };

  // FONCTION CORRIGÉE : getDeviationDisplay
  const getDeviationDisplay = (paramKey, compliance) => {
    const { limits, stats, values } = compliance;
    const hasData = values && values.length > 0;
    const relevantLimits = getRelevantLimits(paramKey, limits);
    
    // Si pas de données ou pas de limites pertinentes pour la déviation
    if (!hasData || (!relevantLimits.hasLI && !relevantLimits.hasLS)) {
      return { displayValue: "ND", color: "grey", isRelevant: false };
    }
    
    // Calculer le pourcentage de déviation basé sur les limites pertinentes
    let deviationPercent = 0;
    
    if (relevantLimits.hasLI && stats.percentLI !== "-") {
      deviationPercent = Math.max(deviationPercent, parseFloat(stats.percentLI));
    }
    
    if (relevantLimits.hasLS && stats.percentLS !== "-") {
      deviationPercent = Math.max(deviationPercent, parseFloat(stats.percentLS));
    }
    
    const color = getCellColor(deviationPercent, 0, hasData, limits);
    let displayValue = "OK";
    
    if (deviationPercent >= 5) {
      displayValue = `${deviationPercent}%`;
    } else {
      displayValue = "OK";
    }
    
    return { displayValue, color, isRelevant: true };
  };

  // FONCTION CORRIGÉE : getDefaultDisplay
  const getDefaultDisplay = (paramKey, compliance) => {
    const { limits, stats, values } = compliance;
    const hasData = values && values.length > 0;
    const relevantLimits = getRelevantLimits(paramKey, limits);
    
  // Si pas de données
  if (!hasData) {
    return { displayValue: "ND", color: "grey", isRelevant: false };
  }
  
  // Si pas de limite de garantie pertinente - AFFICHER "--" au lieu de "ND"
  if (!relevantLimits.hasLG) {
    return { displayValue: "--", color: "grey", isRelevant: false }; // CHANGEMENT ICI
  }

    const defaultPercent = parseFloat(stats.percentLG === "-" ? "0" : stats.percentLG);
    const color = getCellColor(0, defaultPercent, hasData, limits);
    let displayValue = "OK";
    
    if (defaultPercent >= 5) {
      displayValue = `${defaultPercent}%`;
    } else {
      displayValue = "OK";
    }
    
    return { displayValue, color, isRelevant: true };
  };

  // FONCTION CORRIGÉE : getControlStatus
  const getControlStatus = (paramKey, limits, values, conditionsStatistiques) => {
    const relevantLimits = getRelevantLimits(paramKey, limits);
    
    // Cas ND: pas de données
    if (!values || values.length === 0) {
      return { status: "ND", color: "grey", isRelevant: false };
    }
    
    // Cas --: pas de contrôle statistique applicable (comme pour l'ajout)
    if (!relevantLimits.hasControl) {
      return { status: "--", color: "grey", isRelevant: false };
    }
    
    // Cas où le contrôle statistique est pertinent mais données insuffisantes
    if (values.length < 20) {
      return { status: "Non Satisfait", color: "yellow", isRelevant: true };
    }
    
    const isMesureParam = ['rc2j', 'rc7j', 'rc28j', 'prise', 'hydratation', 'pfeu', 'r_insoluble', 'so3', 'chlorure', 'c3a'].includes(paramKey);
    const isAttributParam = ['stabilite', 'pouzzolanicite'].includes(paramKey);

    if (isMesureParam) {
      const stats = calculateStats(dataToUse, paramKey);
      const category = "general";
      
      let allSatisfied = true;
      
      // Vérifier seulement les limites pertinentes
      if (relevantLimits.hasLI) {
        const liResult = checkStatisticalCompliance(conformiteData, stats, limits, category, "li");
        if (!liResult.satisfied) {
          allSatisfied = false;
        }
      }
      if (relevantLimits.hasLS) {
        const lsResult = checkStatisticalCompliance(conformiteData, stats, limits, category, "ls");
        if (!lsResult.satisfied) {
          allSatisfied = false;
        }
      }
      
      return { 
        status: allSatisfied ? "Satisfait" : "Non Satisfait", 
        color: allSatisfied ? "green" : "yellow",
        isRelevant: true
      };
    }

    if (isAttributParam) {
      // Pour les paramètres d'attribut, vérifier seulement si LS est pertinent
      if (relevantLimits.hasLS) {
        const attributeResult = checkEquationSatisfaction(values, limits, conditionsStatistiques);
        return { 
          status: attributeResult.satisfied ? "Satisfait" : "Non Satisfait", 
          color: attributeResult.satisfied ? "green" : "yellow",
          isRelevant: true
        };
      } else {
        return { status: "--", color: "grey", isRelevant: false };
      }
    }

    // Cas par défaut: non pertinent
    return { status: "ND", color: "grey", isRelevant: false };
  };

  // Fonction getCellColor (inchangée)
  const getCellColor = (deviationPercent, defaultPercent, hasData, limits) => {
    if (!hasData || (limits.li === "-" && limits.ls === "-" && limits.lg === "-")) {
      return "grey";
    }
    
    if (defaultPercent > 5) {
      return "red";
    }
    
    if (deviationPercent > 5) {
      return "yellow";
    }
    
    if (deviationPercent >= 0 && deviationPercent <= 5) {
      return "green";
    }
    
    if (defaultPercent >= 0 && defaultPercent <= 5) {
      return "green";
    }

    return "green";
  };

  const calculateClassConformity = (classCompliance, statisticalCompliance, conditionsStatistiques) => {
    let hasAnyRelevantParameter = false;
    let allRelevantParametersConform = true;

    Object.entries(classCompliance).forEach(([paramKey, compliance]) => {
      const relevantLimits = getRelevantLimits(paramKey, compliance.limits);
      const hasRelevantLimits = relevantLimits.hasLI || relevantLimits.hasLS || relevantLimits.hasLG;
      const hasData = compliance.values && compliance.values.length > 0;
      
      // Cas 1: Pas de limites pertinentes (--) - ignorer
      if (!hasRelevantLimits) {
        return;
      }
      
      // Cas 2: Il y a des limites MAIS pas de données (ND) - ignorer
      if (!hasData) {
        return;
      }
      
      // Cas 3: Il y a des limites ET des données - évaluer la conformité
      hasAnyRelevantParameter = true;

      const deviationPercent = Math.max(
        parseFloat(compliance.stats.percentLI === "-" ? "0" : compliance.stats.percentLI),
        parseFloat(compliance.stats.percentLS === "-" ? "0" : compliance.stats.percentLS)
      );
      
      const defaultPercent = parseFloat(compliance.stats.percentLG === "-" ? "0" : compliance.stats.percentLG);

      const controlStatus = getControlStatus(paramKey, compliance.limits, compliance.values, conditionsStatistiques);

      const isNonConform = deviationPercent >= 5 || defaultPercent >= 5 || controlStatus.status === "Non Satisfait";

      if (isNonConform) {
        allRelevantParametersConform = false;
      }
    });

    // Si aucun paramètre pertinent n'a été trouvé, considérer comme conforme
    if (!hasAnyRelevantParameter) {
      return true;
    }

    return allRelevantParametersConform;
  };

  // Fonctions utilitaires pour le contrôle statistique (inchangées)
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

  const getKCoefficient = (conformiteData, n, percentile) => {
    if (!conformiteData.coefficients_k || n < 20) return null;
    const kKey = percentile === 5 ? "k_pk5" : "k_pk10";
    const coefficient = conformiteData.coefficients_k.find(coeff => n >= coeff.n_min && n <= coeff.n_max);
    return coefficient ? coefficient[kKey] : null;
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


const handleExport = async () => { 
  try {
    // Prepare complete table data for PDF export
    const tableData = {
      headers: ["Classe", ...parameters.map(param => {
        // Shorten long parameter names
        const shortName = param.label.length > 20 ? param.label.substring(0, 17) + '...' : param.label;
        return shortName;
      })],
      rows: []
    };

    // Build rows for each class
    classes.forEach((classe) => {
      const classCompliance = {};
      const statisticalCompliance = {};
      
      // Calculate compliance data for this class
      parameters.forEach(param => {
        const limits = getLimitsByClass(classe, param.key);
        const values = dataToUse.map(r => {
          if (param.key === "ajt") {
            return parseFloat(r.ajout_percent);
          }
          return parseFloat(r[param.key]);
        }).filter(v => !isNaN(v));
        const stats = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
        
        classCompliance[param.key] = { limits, stats, values };
      });

      const isClassConforme = calculateClassConformity(classCompliance, statisticalCompliance, conditionsStatistiques);

      // Class name row
      tableData.rows.push({
        type: 'class-header',
        data: [`${classe} ${isClassConforme ? "Conforme" : "Non Conforme"}`, ...parameters.map(() => "")]
      });

      // % Déviation row
      const deviationRow = ["% Déviation"];
      parameters.forEach(param => {
        const compliance = classCompliance[param.key];
        const deviationDisplay = getDeviationDisplay(param.key, compliance);
        deviationRow.push(deviationDisplay.displayValue);
      });
      tableData.rows.push({ type: 'deviation', data: deviationRow });

      // % Défaut row
      const defaultRow = ["% Défaut"];
      parameters.forEach(param => {
        const compliance = classCompliance[param.key];
        const defaultDisplay = getDefaultDisplay(param.key, compliance);
        defaultRow.push(defaultDisplay.displayValue);
      });
      tableData.rows.push({ type: 'default', data: defaultRow });

      // Contrôle Statistique row
      const controlRow = ["Contrôle Statistique"];
      parameters.forEach(param => {
        const compliance = classCompliance[param.key];
        const controlStatus = getControlStatus(param.key, compliance.limits, compliance.values, conditionsStatistiques);
        controlRow.push(controlStatus.status);
      });
      tableData.rows.push({ type: 'control', data: controlRow });

      // Add empty row for spacing
      tableData.rows.push({
        type: 'spacer',
        data: Array(parameters.length + 1).fill("")
      });
    });

    // ⭐ NOUVEAU: Demander à l'utilisateur avec message amélioré
    const userChoice = window.confirm(
      "📊 OPTIONS D'EXPORT - TABLEAU CONFORMITÉ\n\n" +
      "Cliquez sur :\n" +
      "• ✅ OK - Pour ajouter à l'export GLOBAL (toutes pages)\n" +
      "• ❌ Annuler - Pour exporter INDIVIDUELLEMENT seulement\n\n" +
      `📋 Statut actuel: ${CentralExportService.getStatusMessage()}`
    );

    if (userChoice) {
      // Ajouter à l'export global
      CentralExportService.addTableauConformite(tableData, {
        clientInfo: { 
          nom: clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client",
          id: clientId
        },
        produitInfo: {
          ...produitInfo,
          famille: finalFamilleName,
          familleCode: finalFamilleCode
        },
        periodStart: filterPeriod.start,
        periodEnd: filterPeriod.end,
        phase: phase || "situation_courante",
        exportDate: new Date().toISOString(),
        totalClasses: classes.length,
        totalParameters: parameters.length
      });
      
      // Message de confirmation amélioré
      const status = CentralExportService.getExportStatus();
      const statusDetails = Object.entries(status)
        .map(([key, value]) => {
          const pageName = key === 'echantillonsTable' ? 'Échantillons' :
                         key === 'tableauConformite' ? 'Tableau Conformité' :
                         key === 'controleDetail' ? 'Contrôle Détail' :
                         key === 'donneesGraphiques' ? 'Données Graphiques' :
                         key === 'donneesStatistiques' ? 'Données Statistiques' : key;
          return `${value} ${pageName}`;
        })
        .join('\n');
      
      alert(`✅ TABLEAU CONFORMITÉ AJOUTÉ À L'EXPORT GLOBAL !\n\n` +
            `📊 STATUT DES PAGES:\n${statusDetails}\n\n` +
            `Utilisez le bouton "📤 Exporter Toutes les Pages" pour générer les PDFs complets.`);
      
      console.log("📤 Tableau conformité ajouté à l'export global:", {
        client: clients.find(c => c.id == clientId)?.nom_raison_sociale,
        produit: produitInfo?.nom,
        classes: classes.length,
        parameters: parameters.length
      });

    } else {
      // ⭐ OPTION 2: Exporter seulement cette page
      const pdfOptions = {
        clientInfo: { 
          nom: clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client" 
        },
        produitInfo: {
          ...produitInfo,
          famille: finalFamilleName
        },
        periodStart: filterPeriod.start,
        periodEnd: filterPeriod.end,
        phase: phase || "situation_courante",
      };

      // Générer le PDF individuel
      const doc = await PDFExportService.generateTableReport(tableData, pdfOptions);
      
      // Sauvegarder le PDF individuel
      const clientName = clients.find(c => c.id == clientId)?.nom_raison_sociale || "client";
      const fileName = `tableau_conformite_${clientName}_${filterPeriod.start}_${filterPeriod.end}.pdf`.replace(/\s+/g, '_');
      doc.save(fileName);
      
      console.log("📄 PDF individuel exporté:", fileName);
      alert(`✅ PDF exporté individuellement: ${fileName}`);
    }

  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    
    // Message d'erreur plus détaillé
    let errorMessage = "Erreur lors de l'export PDF: " + error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = "❌ Erreur de connexion. Vérifiez que le serveur est accessible.";
    }
    
    alert(errorMessage);
  }
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
              <p><strong>Famille: {finalFamilleName} ({finalFamilleCode})</strong></p>
              <p style={{ color: showC3A ? 'blue' : showTauxAjout ? 'green' : 'red' }}>
                {showC3A ? "🔵 CEM I - Affichage C3A" : showTauxAjout ? "🟢 Autre famille - Affichage Taux Ajout" : "🔴 Famille non reconnue"}
              </p>
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
                {parameters.map((param) => (
                  <th key={param.key}>
                    {param.label}
                    {(param.key === "c3a" || param.key === "ajt") && " *"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((classe) => {
                const classCompliance = {};
                const statisticalCompliance = {};
                
                parameters.forEach(param => {
                  const limits = getLimitsByClass(classe, param.key);
                  const values = dataToUse.map(r => {
                    if (param.key === "ajt") {
                      return parseFloat(r.ajout_percent);
                    }
                    return parseFloat(r[param.key]);
                  }).filter(v => !isNaN(v));
                  const stats = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
                  
                  classCompliance[param.key] = { limits, stats, values };
                  
                  const relevantLimits = getRelevantLimits(param.key, limits);
                  if (relevantLimits.hasControl && (relevantLimits.hasLI || relevantLimits.hasLS)) {
                    const category = "general";
                    if (relevantLimits.hasLI) statisticalCompliance[`${param.key}_li`] = 
                      checkStatisticalCompliance(conformiteData, allStats[param.key], limits, category, "li");
                    if (relevantLimits.hasLS) statisticalCompliance[`${param.key}_ls`] = 
                      checkStatisticalCompliance(conformiteData, allStats[param.key], limits, category, "ls");
                  }
                });

                const isClassConforme = calculateClassConformity(classCompliance, statisticalCompliance, conditionsStatistiques);
                
                return (
                  <React.Fragment key={classe}>
                    <tr key={`${classe}-name`}>
                      <td>
                        {classe}{" "}
                        <strong style={{ marginLeft: "10px", color: isClassConforme ? "green" : "red" }}>
                          {isClassConforme ? "Conforme" : "Non Conforme"}
                        </strong>
                      </td>
                      {parameters.map((param) => (
                        <td key={param.key}></td>
                      ))}
                    </tr>

                    <tr key={`${classe}-deviation`}>
                      <td>% Déviation</td>
                      {parameters.map((param) => {
                        const compliance = classCompliance[param.key];
                        const deviationDisplay = getDeviationDisplay(param.key, compliance);
                        return (
                          <td key={param.key} style={{ 
                            color: deviationDisplay.color, 
                            fontWeight: "bold", 
                            backgroundColor: deviationDisplay.color === "green" ? "#e8f5e8" : 
                                          deviationDisplay.color === "red" ? "#ffe8e8" : 
                                          deviationDisplay.color === "grey" ? "#f0f0f0" : "transparent" 
                          }}>
                            {deviationDisplay.displayValue}
                          </td>
                        );
                      })}
                    </tr>

                    <tr key={`${classe}-default`}>
                      <td>% Défaut</td>
                      {parameters.map((param) => {
                        const compliance = classCompliance[param.key];
                        const defaultDisplay = getDefaultDisplay(param.key, compliance);
                        return (
                          <td key={param.key} style={{ 
                            color: defaultDisplay.color, 
                            fontWeight: "bold", 
                            backgroundColor: defaultDisplay.color === "green" ? "#e8f5e8" : 
                                          defaultDisplay.color === "red" ? "#ffe8e8" : 
                                          defaultDisplay.color === "grey" ? "#f0f0f0" : "transparent" 
                          }}>
                            {defaultDisplay.displayValue}
                          </td>
                        );
                      })}
                    </tr>

                    <tr key={`${classe}-control`}>
                      <td>Contrôle Statistique</td>
                      {parameters.map((param) => {
                        const compliance = classCompliance[param.key];
                        const controlStatus = getControlStatus(param.key, compliance.limits, compliance.values, conditionsStatistiques);
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
          <p><span className="green-box"></span>% Déviation/Défaut &le; 5%</p>
          <p><span className="yellow-box"></span>% Déviation &gt; 5%</p>
          <p><span className="red-box"></span>% Défaut &gt; 5%</p>
          <p><span className="grey-box"></span> -- Non définie ND/NS Données insuffisantes</p>
          <p><span style={{color: 'blue', fontWeight: 'bold'}}>*</span> Paramètre conditionnel selon la famille</p>
        </div>
      </div>

      <div className="actions-bar">
        <div className="file-actions">
<button className="action-btn export-btn" onClick={handleExport} disabled={dataToUse.length === 0}>
            <i className="fas fa-file-export"></i> Exporter PDF
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