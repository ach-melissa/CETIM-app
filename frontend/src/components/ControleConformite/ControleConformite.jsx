import React, { useState, useEffect, useMemo, useCallback } from "react";
import './ControleConformite.css';
import { useData } from "../../context/DataContext";

const calculateStats = (data, key) => {
  if (!data?.length) return { count: 0, mean: null, std: null };

  const values = data.map(r => parseFloat(r[key])).filter(v => !isNaN(v));
  if (!values.length) return { count: 0, mean: null, std: null };

  const count = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / count;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance);

  return { count, mean, std };
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

  // Only count if limit is not null or "-"
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
  // Exemple : conditionsStatistiques = [{ pk_min:1, pk_max:10, ka:1.64 }, ...]
  const found = conditionsStatistiques.find(c => pk >= c.pk_min && pk <= c.pk_max);
  return found ? parseFloat(found.ka) : null;
};


const evaluateStatisticalCompliance = (data, key, li, ls, paramType, conditionsStatistiques) => {
  const stats = calculateStats(data, key);
  if (!stats.count) return { equation: "Données insuffisantes", satisfied: false };

  let result = { equation: "", satisfied: false };

  if (["rc2j", "rc7j", "rc28j"].includes(paramType)) {
    // Cas mécanique
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
    // Autres paramètres
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

// Fixed function - returns proper display values
const checkEquationSatisfaction = (values, limits, conditionsStatistiques = []) => {
  if (!conditionsStatistiques || conditionsStatistiques.length === 0) {
    return { satisfied: false, equation: "Conditions non chargées", displayText: "Conditions non chargées" };
  }

  // Ensure values is an array
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
  const equationText = `Cd = ${cd} ≥ Ca = ${ca}`;
  
  return {
    satisfied,
    equation: equationText,
    displayText: equationText
  };
};

const ControleConformite = ({
  clientId,
  produitId,
  selectedType,
  onTableDataChange,
  initialStart,
  initialEnd,
  produitDescription,
  clients = [],
  produits = [],
  selectedCement
}) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [conformiteData, setConformiteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedProductFamily, setSelectedProductFamily] = useState("");
  const [dataError, setDataError] = useState(null);
  const [conditionsStatistiques, setConditionsStatistiques] = useState([]);


  useEffect(() => {
    fetch("/Data/conformite.json")
      .then((res) => res.json())
      .then((data) => {
        setConditionsStatistiques(data.conditions_statistiques || []);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  useEffect(() => {
    if (produitId && produits.length) {
      const product = produits.find(p => p.id == produitId);
      if (product) {
        setSelectedProductType(product.type_code || "");
        setSelectedProductFamily(product.famille_code || "");
      }
    }
  }, [produitId, produits]);

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

 const getLimitsByClass = useCallback((classe, key) => {
  const mapping = keyMapping[key];
  if (!mapping || !mockDetails[mapping]) return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
  
  const parameterData = mockDetails[mapping];
  if (!parameterData) return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };

  // Try exact match first: family -> type -> class
  if (selectedProductFamily && selectedProductType && parameterData[selectedProductFamily]) {
    const familyData = parameterData[selectedProductFamily];
    if (familyData[selectedProductType]) {
      const typeData = familyData[selectedProductType];
      const found = typeData.find(item => item.classe === classe);
      if (found) return { 
        li: found.limit_inf ?? "-", 
        ls: found.limit_max ?? "-", 
        lg: found.garantie ?? "-",
        limit_inf: found.limit_inf,
        limit_max: found.limit_max
      };
    }
  }

  // If exact match not found, search through all families and types
  for (const familleKey in parameterData) {
    const familleData = parameterData[familleKey];
    for (const typeKey in familleData) {
      const typeData = familleData[typeKey];
      const found = typeData.find(item => item.classe === classe);
      if (found) return { 
        li: found.limit_inf ?? "-", 
        ls: found.limit_max ?? "-", 
        lg: found.garantie ?? "-",
        limit_inf: found.limit_inf,
        limit_max: found.limit_max
      };
    }
  }

  return { li: "-", ls: "-", lg: "-", limit_inf: null, limit_max: null };
}, [mockDetails, selectedProductFamily, selectedProductType]);



  const dataToUse = filteredTableData || [];

  const parameters = useMemo(() => {
    const baseParams = [
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
    if (Number(selectedType) === 1) return [...baseParams, { key: "c3a", label: "C3A" }];
    if (selectedType) return [...baseParams, { key: "ajout_percent", label: "Ajout (%)" }];
    return baseParams;
  }, [selectedType]);

  const allStats = useMemo(() => 
    parameters.reduce((acc, param) => ({ ...acc, [param.key]: calculateStats(dataToUse, param.key) }), {}),
  [parameters, dataToUse]);

  const classes = ["32.5 L" , "32.5 N", "32.5 R","42.5 L" , "42.5 N", "42.5 R" , "52.5 L" , "52.5 N", "52.5 R"];

  const renderClassSection = useCallback((classe) => {
    const classCompliance = {};
    const statisticalCompliance = {};
    
    // Prepare data for each parameter
    parameters.forEach(param => {
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

    const isClassConforme = parameters.every(param => {
      const c = classCompliance[param.key];
      return c.stats.belowLI === "-" && c.stats.aboveLS === "-" && c.stats.belowLG === "-";
    });

    return (
      <div className="class-section" key={classe}>
        <div className="report-header">
          <div style={{ marginBottom: "1rem" }}>
            <p>
              <strong>
                {clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}
              </strong>
            </p>
            <h2>Contrôle de conformité / classe de résistance</h2>
            {selectedCement && (
              <div className="selected-cement-info">
                <h3>{selectedCement.name}</h3>
                <p>Type: {selectedCement.type} | Classe: {selectedCement.class}</p>
                {selectedCement.description && (
                  <p><strong>Description:</strong> {selectedCement.description}</p>
                )}
              </div>
            )}
            {!selectedCement && produitDescription && (
              <p><strong>{produitDescription}</strong></p>
            )}
            {selectedProductFamily && <p><strong>Famille: {selectedProductFamily}</strong></p>}
            {selectedProductType && <p><strong>Type: {selectedProductType}</strong></p>}
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
                  <span>{classCompliance.rc2j.stats.percentLI !== "-" 
                    ? `${classCompliance.rc2j.stats.percentLI}% < ${classCompliance.rc2j.limits.li}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.rc2j.stats.percentLI}%</span>
                </div>
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J)</span>
                  <span>{classCompliance.rc28j.stats.percentLI !== "-" 
                    ? `${classCompliance.rc28j.stats.percentLI}% < ${classCompliance.rc28j.limits.li}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.rc28j.stats.percentLI}%</span>
                </div>
                <div className="parameter-item">
                  <span>Temps de début de prise (Prise)</span>
                  <span>{classCompliance.prise.stats.percentLI !== "-" 
                    ? `${classCompliance.prise.stats.percentLI}% < ${classCompliance.prise.limits.li}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.prise.stats.percentLI}%</span>
                </div>
                {selectedType === "1" ? (
                  <div className="parameter-item">
                    <span>C3A</span>
                    <span>
                      {classCompliance.c3a?.stats?.percentLI !== "-" 
                        ? `${classCompliance.c3a.stats.percentLI}% < ${classCompliance.c3a.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.c3a?.stats?.percentLI}%</span>
                  </div>
                ) : selectedType ? (
                  <div className="parameter-item">
                    <span>Ajout(Calcaire)</span>
                    <span>
                      {classCompliance.ajout_percent?.stats?.percentLI !== "-" 
                        ? `${classCompliance.ajout_percent.stats.percentLI}% < ${classCompliance.ajout_percent.limits.li}` 
                        : "Aucune déviation"}
                    </span>
                    <span>Déviation={classCompliance.ajout_percent?.stats?.percentLI}%</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Déviations Limites supérieures</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J)</span>
                  <span>{classCompliance.rc28j.stats.percentLS !== "-" 
                    ? `${classCompliance.rc28j.stats.percentLS}% > ${classCompliance.rc28j.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.rc28j.stats.percentLS}%</span>
                </div>
                <div className="parameter-item">
                  <span>Stabilité (Stabilite)</span>
                  <span>{classCompliance.stabilite.stats.percentLS !== "-" 
                    ? `${classCompliance.stabilite.stats.percentLS}% > ${classCompliance.stabilite.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.stabilite.stats.percentLS}%</span>
                </div>
                <div className="parameter-item">
                  <span>Sulfate (SO3)</span>
                  <span>{classCompliance.so3.stats.percentLS !== "-" 
                    ? `${classCompliance.so3.stats.percentLS}% > ${classCompliance.so3.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.so3.stats.percentLS}%</span>
                </div>
                <div className="parameter-item">
                  <span>Chlorure (Chlorure)</span>
                  <span>{classCompliance.chlorure.stats.percentLS !== "-" 
                    ? `${classCompliance.chlorure.stats.percentLS}% > ${classCompliance.chlorure.limits.ls}` 
                    : "Aucune déviation"}</span>
                  <span>Déviation={classCompliance.chlorure.stats.percentLS}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Défauts Limites garanties</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Résistance à court terme à 02 j (RC2J)</span>
                  <span>{classCompliance.rc2j.stats.percentLG !== "-" 
                    ? `${classCompliance.rc2j.stats.percentLG}% < ${classCompliance.rc2j.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.rc2j.stats.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J)</span>
                  <span>{classCompliance.rc28j.stats.percentLG !== "-" 
                    ? `${classCompliance.rc28j.stats.percentLG}% < ${classCompliance.rc28j.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.rc28j.stats.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Temps de début de prise (Prise)</span>
                  <span>{classCompliance.prise.stats.percentLG !== "-" 
                    ? `${classCompliance.prise.stats.percentLG}% < ${classCompliance.prise.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.prise.stats.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Stabilité (Stabilite)</span>
                  <span>{classCompliance.stabilite.stats.percentLG !== "-" 
                    ? `${classCompliance.stabilite.stats.percentLG}% > ${classCompliance.stabilite.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.stabilite.stats.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Sulfate (SO3)</span>
                  <span>{classCompliance.so3.stats.percentLG !== "-" 
                    ? `${classCompliance.so3.stats.percentLG}% > ${classCompliance.so3.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.so3.stats.percentLG}%</span>
                </div>
                <div className="parameter-item">
                  <span>Chlorure (Chlorure)</span>
                  <span>{classCompliance.chlorure.stats.percentLG !== "-" 
                    ? `${classCompliance.chlorure.stats.percentLG}% > ${classCompliance.chlorure.limits.lg}` 
                    : "Aucun défaut"}</span>
                  <span>Défaut={classCompliance.chlorure.stats.percentLG}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional sections from the image */}
          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Contrôle par Mesures des résistances mécaniques</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Résistance à court terme à 02 j (RC2J) LI</span>
<span>
  {statisticalCompliance.rc2j_li 
    ? statisticalCompliance.rc28j_li.equation 
    : "Données insuffisantes"}
</span>
<span>
  {statisticalCompliance.rc2j_li?.satisfied 
    ? "Équation satisfaite" 
    : "Équation non satisfaite"}
</span>
                </div>
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J) LI</span>
<span>
  {statisticalCompliance.rc28j_li 
    ? statisticalCompliance.rc28j_li.equation 
    : "Données insuffisantes"}
</span>
<span>
  {statisticalCompliance.rc28j_li?.satisfied 
    ? "Équation satisfaite" 
    : "Équation non satisfaite"}
</span>
                
                </div>
                <div className="parameter-item">
                  <span>Résistance courante 28j (RC28J) LS</span>
<span>
  {statisticalCompliance.rc28j_ls 
    ? statisticalCompliance.rc28j_ls.equation 
    : "Données insuffisantes"}
</span>
<span>
  {statisticalCompliance.rc28j_ls?.satisfied 
    ? "Équation satisfaite" 
    : "Équation non satisfaite"}
</span>
                </div>
                <div className="parameter-item">
                  <span>Temps de début de prise (Prise) LI</span>
                  <span>
  {statisticalCompliance.prise_li 
    ? statisticalCompliance.prise_li.equation 
    : "Données insuffisantes"}
</span>
<span>
  {statisticalCompliance.prise_li?.satisfied 
    ? "Équation satisfaite" 
    : "Équation non satisfaite"}
</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sections-horizontal">
            <div className="section-box">
              <h4>Contrôle par Attributs propriétés physiques & chimiques</h4>
              <div className="parameter-list">
                <div className="parameter-item">
                  <span>Stabilité (Stabilite)</span>
                  <span>
                 
                    {checkEquationSatisfaction(
                      classCompliance.stabilite?.values || [],
                      classCompliance.stabilite?.limits || {},
                      conditionsStatistiques
                    ).displayText}
                  </span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.stabilite?.values || [],
                      classCompliance.stabilite?.limits || {},
                      conditionsStatistiques
                    ).satisfied ? "Équation satisfaite" : "Équation non satisfaite"}
                  </span>
                </div>
                <div className="parameter-item">
                  <span>Perte au feu (P.feu)</span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.pfeu?.values || [],
                      classCompliance.pfeu?.limits || {},
                      conditionsStatistiques
                    ).displayText}
                  </span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.pfeu?.values || [],
                      classCompliance.pfeu?.limits || {},
                      conditionsStatistiques
                    ).satisfied ? "Équation satisfaite" : "Équation non satisfaite"}
                  </span>
                </div>
                <div className="parameter-item">
                  <span>Résidu insoluble (R.insoluble)</span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.r_insoluble?.values || [],
                      classCompliance.r_insoluble?.limits || {},
                      conditionsStatistiques
                    ).displayText}
                  </span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.r_insoluble?.values || [],
                      classCompliance.r_insoluble?.limits || {},
                      conditionsStatistiques
                    ).satisfied ? "Équation satisfaite" : "Équation non satisfaite"}
                  </span>
                </div>
                <div className="parameter-item">
                  <span>Sulfate (SO3)</span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.so3?.values || [],
                      classCompliance.so3?.limits || {},
                      conditionsStatistiques
                    ).displayText}
                  </span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.so3?.values || [],
                      classCompliance.so3?.limits || {},
                      conditionsStatistiques
                    ).satisfied ? "Équation satisfaite" : "Équation non satisfaite"}
                  </span>
                </div>
                <div className="parameter-item">
                  <span>Chlorure (Chlorure)</span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.chlorure?.values || [],
                      classCompliance.chlorure?.limits || {},
                      conditionsStatistiques
                    ).displayText}
                  </span>
                  <span>
                    {checkEquationSatisfaction(
                      classCompliance.chlorure?.values || [],
                      classCompliance.chlorure?.limits || {},
                      conditionsStatistiques
                    ).satisfied ? "Équation satisfaite" : "Équation non satisfaite"}
                  </span>
                </div>
                {selectedType === "1" && (
                  <div className="parameter-item">
                    <span>C3A (C3A)</span>
                    <span>
                      {checkEquationSatisfaction(
                        classCompliance.c3a?.values || [],
                        classCompliance.c3a?.limits || {},
                        conditionsStatistiques
                      ).displayText}
                    </span>
                    <span>
                      {checkEquationSatisfaction(
                        classCompliance.c3a?.values || [],
                        classCompliance.c3a?.limits || {},
                        conditionsStatistiques
                      ).satisfied ? "Équation satisfaite" : "Équation non satisfaite"}
                    </span>
                  </div>
                )}
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
  }, [parameters, dataToUse, keyMapping, conformiteData, allStats, getLimitsByClass, clients, clientId, selectedCement, produitDescription, selectedProductFamily, selectedProductType, filterPeriod, selectedType, conditionsStatistiques]);

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