// src/components/DonneesStatistiques/DonneesStatistiques.jsx
import React, { useState, useEffect, useRef } from "react";
import PDFExportService from "../ControleConformite/PDFExportService";
import "./DonneesStatistiques.css";
import { useData } from "../../context/DataContext";
import CentralExportService from "../../services/CentralExportService"; 

// ============================================================
// Utility functions
// ============================================================

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

// ============================================================
// DonneesStatistiques Component
// ============================================================
const DonneesStatistiques = ({ 
  clientId, 
  clientTypeCimentId, 
  produitInfo,
  produitDescription, 
  clients = [], 
  produits = [] ,
  ajoutsData = {},
  phase,
}) => {
  const { filteredTableData, filterPeriod } = useData();
  const [mockDetails, setMockDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger les données depuis le fichier JSON
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
      } finally {
        setLoading(false);
      }
    };
    fetchMockDetails();
  }, []);

  // Map front-end keys -> JSON keys - CORRECTION ICI
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
    ajt: "Ajout", // ⭐⭐ CORRECTION : "Ajout" avec majuscule ⭐⭐
    c3a: "C3A",
  };

  // Get product type and famille from produitInfo with fallbacks
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

  // Final famille values with fallback
  const finalFamilleCode = selectedProductFamille || determineFamilleFromType(selectedProductType);
  const finalFamilleName = selectedProductFamilleName || finalFamilleCode;

  // Déterminer quelles colonnes afficher
  const showC3A = produitInfo && produitInfo.famille?.code === "CEM I";
  const showTauxAjout = produitInfo && produitInfo.famille?.code !== "CEM I";

  // Default parameters
  let parameters = [
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

  // Add C3A if famille is CEM I
  if (showC3A) {
    parameters.push({ key: "c3a", label: "C3A" });
  }

  // Add Taux Ajout if famille is NOT CEM I
  if (showTauxAjout) {
    parameters.push({ key: "ajt", label: "Taux Ajout" });
  }

  const getLimitsByClass = (classe, key) => {
    const mockKey = keyMapping[key];
    
    console.log("=== DEBUG getLimitsByClass ===");
    console.log("Key:", key, "MockKey:", mockKey, "Classe:", classe);
    console.log("Selected Product Type:", selectedProductType);
    console.log("Final Famille Code:", finalFamilleCode);
    
    if (!mockKey || !mockDetails[mockKey]) {
      console.log("❌ Mock key not found or no data for mockKey");
      console.log("Mock key searched:", mockKey);
      console.log("Available keys in mockDetails:", Object.keys(mockDetails));
      return { li: "-", ls: "-", lg: "-" };
    }

    const parameterData = mockDetails[mockKey];
    console.log("✅ Parameter data available for:", mockKey);
    console.log("Available familles in parameter data:", Object.keys(parameterData));
    
    // Vérifier si la famille existe dans les données
    if (!parameterData[finalFamilleCode]) {
      console.log("❌ No data for famille:", finalFamilleCode);
      console.log("Available familles:", Object.keys(parameterData));
      return { li: "-", ls: "-", lg: "-" };
    }

    const familleData = parameterData[finalFamilleCode];
    console.log("✅ Famille data found:", finalFamilleCode);
    console.log("Famille data structure:", familleData);
    console.log("Available product types in famille:", Object.keys(familleData));

    let classData = null;

    // CORRECTION : Structure unifiée pour tous les paramètres
    // La structure est toujours: { "Famille": { "TypeProduit": [array de classes], ... } }
    
    // 1. Chercher avec le type de produit exact
    if (familleData[selectedProductType]) {
      console.log("✅ Found exact product type:", selectedProductType);
      const productData = familleData[selectedProductType];
      
      if (Array.isArray(productData)) {
        classData = productData.find(item => item.classe === classe);
        if (classData) {
          console.log("✅ Found class data for exact product type:", classData);
        } else {
          console.log("❌ No class data found for classe:", classe, "in product type:", selectedProductType);
          console.log("Available classes:", productData.map(item => item.classe));
        }
      } else {
        console.log("❌ Product data is not an array:", typeof productData);
      }
    } else {
      console.log("❌ No data for exact product type:", selectedProductType);
    }
    
    // 2. Fallback: chercher dans tous les types de produits de cette famille
    if (!classData) {
      console.log("🔄 Searching in all product types for fallback...");
      for (const productTypeKey in familleData) {
        const productData = familleData[productTypeKey];
        if (Array.isArray(productData)) {
          classData = productData.find(item => item.classe === classe);
          if (classData) {
            console.log("✅ Found fallback class data in product type:", productTypeKey, classData);
            break;
          }
        }
      }
    }

    if (!classData) {
      console.log("❌ No class data found for classe:", classe, "in any product type");
      return { li: "-", ls: "-", lg: "-" };
    }

    // Extraire les valeurs avec gestion des valeurs null
    const result = {
      li: classData.limit_inf !== null ? classData.limit_inf : "-",
      ls: classData.limit_max !== null ? classData.limit_max : "-",
      lg: classData.garantie !== null ? classData.garantie : "-",
    };
    
    console.log("🎯 Final limits result:", result);
    return result;
  };

  const dataToUse = filteredTableData || [];

  if (loading) return <p className="no-data">Chargement des données de référence...</p>;
  if (!dataToUse.length) return <p className="no-data">Veuillez d'abord filtrer des échantillons.</p>;

  const allStats = parameters.reduce((acc, param) => {
    acc[param.key] = calculateStats(dataToUse, param.key);
    return acc;
  }, {});

  const statRows = [
    { key: "count", label: "Nombre" },
    { key: "min", label: "Min" },
    { key: "max", label: "Max" },
    { key: "mean", label: "Moyenne" },
    { key: "std", label: "Écart type" },
  ];


const handleExportPDF = async () => {
  try {
    // Prepare data for PDF export
    const pdfData = {
      clientInfo: { 
        nom: clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client",
        id: clientId
      },
      produitInfo: {
        ...produitInfo,
        famille: finalFamilleName,
        familleCode: finalFamilleCode
      },
      period: filterPeriod,
      globalStats: allStats,
      parameters: parameters,
      classes: classes,
      dataToUse: dataToUse,
      getLimitsByClass: getLimitsByClass,
      evaluateLimits: evaluateLimits
    };

    // ⭐ NOUVEAU: Demander à l'utilisateur avec message amélioré
    const userChoice = window.confirm(
      "📊 OPTIONS D'EXPORT - DONNÉES STATISTIQUES\n\n" +
      "Cliquez sur :\n" +
      "• ✅ OK - Pour ajouter à l'export GLOBAL (toutes pages)\n" +
      "• ❌ Annuler - Pour exporter INDIVIDUELLEMENT seulement\n\n" +
      `📋 Statut actuel: ${CentralExportService.getStatusMessage()}`
    );

    if (userChoice) {
      // Ajouter à l'export global
      CentralExportService.addDonneesStatistiques(pdfData, {
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
        totalParameters: parameters.length,
        totalClasses: classes.length,
        sampleCount: dataToUse.length
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
      
      alert(`✅ DONNÉES STATISTIQUES AJOUTÉES À L'EXPORT GLOBAL !\n\n` +
            `📊 STATUT DES PAGES:\n${statusDetails}\n\n` +
            `Utilisez le bouton "📤 Exporter Toutes les Pages" pour générer les PDFs complets.`);
      
      console.log("📤 Données statistiques ajoutées à l'export global:", {
        client: clients.find(c => c.id == clientId)?.nom_raison_sociale,
        produit: produitInfo?.nom,
        parameters: parameters.length,
        classes: classes.length,
        samples: dataToUse.length
      });

    } else {
      // ⭐ OPTION 2: Exporter seulement cette page
      const doc = await PDFExportService.generateStatsReport(pdfData);

      const clientName = clients.find(c => c.id == clientId)?.nom_raison_sociale || "client";
      const fileName = `donnees_statistiques_${clientName}_${filterPeriod.start}_${filterPeriod.end}.pdf`.replace(/\s+/g, '_');
      doc.save(fileName);
      
      console.log("📄 PDF statistiques individuel exporté:", fileName);
      
      alert(`✅ Données Statistiques exportées individuellement!\n\nFichier: ${fileName}`);
    }

  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    
    let errorMessage = "Erreur lors de l'export PDF: " + error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = "❌ Erreur de connexion. Vérifiez que le serveur est accessible.";
    } else if (error.message.includes('jsPDF') || error.message.includes('PDF')) {
      errorMessage = "❌ Erreur lors de la génération du PDF. Vérifiez les données.";
    }
    
    alert(errorMessage);
  }
};

  const classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"];

  const renderClassSection = (classe) => (
    <div className="class-section" key={classe}>
      <h4>CLASSE {classe}</h4>
      <table className="stats-table">
        <tbody>
          <tr>
            <td>Limite inférieure (LI)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{limits.li}</td>;
            })}
          </tr>
          <tr>
            <td>N &lt; LI(RC+DP)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.belowLI}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LI(RC+DP)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.percentLI}</td>;
            })}
          </tr>
          <tr>
            <td>Limite supérieure (LS)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{limits.ls}</td>;
            })}
          </tr>
          <tr>
            <td>N &lt; LS(RC+DP) ; &gt;[autres] </td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.aboveLS}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LS(RC+DP) ; &gt;[autres]</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.percentLS}</td>;
            })}
          </tr>
          <tr>
            <td>Limite garantie (LG)</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              return <td key={param.key}>{limits.lg}</td>;
            })}
          </tr>
          <tr>
            <td>N &lt; LG(RC+DP) ; &gt;[autres]</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.belowLG}</td>;
            })}
          </tr>
          <tr>
            <td>% &lt; LG(RC+DP) ; &gt;[autres]</td>
            {parameters.map((param) => {
              const limits = getLimitsByClass(classe, param.key);
              const evaluation = evaluateLimits(dataToUse, param.key, limits.li, limits.ls, limits.lg);
              return <td key={param.key}>{evaluation.percentLG}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
 <div className="stats-section">
      {/* Add export button */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
          <h2>Données Statistiques</h2>
          {produitInfo && (
            <>
              <p><strong> {produitInfo.nom} ( {produitInfo.description} )</strong></p>
              <p><strong>Famille: {finalFamilleName} ({finalFamilleCode})</strong></p>
            </>
          )}
          <p>Période: {filterPeriod.start} à {filterPeriod.end}</p>
        </div>
        <button 
          className="export-btn" 
          onClick={handleExportPDF} 
          disabled={dataToUse.length === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: dataToUse.length === 0 ? "not-allowed" : "pointer",
            opacity: dataToUse.length === 0 ? 0.6 : 1
          }}
        >
          📊 Exporter PDF
        </button>
      </div>

      {/* Global stats */}
      <table className="stats-table">
        <thead>
          <tr>
            <th>Statistique</th>
            {parameters.map((param) => <th key={param.key}>{param.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {statRows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              {parameters.map((param) => <td key={param.key}>{allStats[param.key][row.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Limits per class */}
      {classes.map((classe) => renderClassSection(classe))}
    </div>
  );
};

export default DonneesStatistiques;