import React, { useState, useEffect, useRef } from "react";
import "./TraitDonnes.css";
import Header from "../../components/Header/Header";
import DonneesStatistiques from "../../components/DonneesStatistiques/DonneesStatistiques";
import EchantillonsTable from "../../components/EchantillonsTable/EchantillonsTable";
import ControleConformite from "../../components/ControleConformite/ControleConformite";
import TableConformite from "../../components/TableConformite/TableConformite";
import DonneesGraphiques from "../../components/DonneesGraphiques/DonneesGraphiques";
import CentralExportService from "../../services/CentralExportService";
import * as XLSX from "xlsx";

const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return "";
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, "0");
  const day = String(date_info.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TraitDonnes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [produits, setProduits] = useState([]);
  const [clientTypeCimentId, setClientTypeCimentId] = useState("");
  const [produitDescription, setProduitDescription] = useState("");
  const [produitFamille, setProduitFamille] = useState("");
  const [phase, setPhase] = useState("situation_courante");
    const [displayPhase, setDisplayPhase] = useState("situation_courante"); // ⭐ NOUVEAU: Phase affichée dans contrôle conformité

  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("donnees");
  const [loading, setLoading] = useState(false);
  const [cementList, setCementList] = useState([]);
  const [ajoutsData, setAjoutsData] = useState({});

  const tableRef = useRef();

  // Fetch clients
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur clients:", err);
        setError("Erreur lors du chargement des clients.");
        setLoading(false);
      });
  }, []);

  // Fetch all cement types
  useEffect(() => {
    fetch("http://localhost:5000/api/types_ciment")
      .then((res) => res.json())
      .then((data) => {
        setCementList(data);
      })
      .catch((err) => {
        console.error("Erreur types ciment:", err);
        setError("Erreur lors du chargement des types de ciment.");
      });
  }, []);

  // Fetch produits with famille information based on selected client
  useEffect(() => {
    if (!selectedClient) {
      setProduits([]);
      setClientTypeCimentId("");
      setProduitDescription("");
      setProduitFamille("");
      setPhase("situation_courante");
      return;
    }

    fetch(`http://localhost:5000/api/produits/${selectedClient}`)
      .then((res) => res.json())
      .then((data) => {
        setProduits(data);
        setClientTypeCimentId("");
        setPhase("situation_courante");
      })
      .catch((err) => {
        console.error("Erreur produits:", err);
        setError("Erreur lors du chargement des produits.");
      });
  }, [selectedClient]);
useEffect(() => {
  console.log("📊 États phase:", {
    phaseReelle: phase,
    phaseAffichage: displayPhase,
    difference: phase !== displayPhase ? "DIFFÉRENTE" : "IDENTIQUE"
  });
}, [phase, displayPhase]);


  // Set description and famille for selected produit
  useEffect(() => {
    if (!clientTypeCimentId) {
      setProduitDescription("");
      setProduitFamille("");
      return;
    }
    
    const produit = produits.find((p) => p.id == clientTypeCimentId);
    if (produit) {
      setProduitDescription(produit.description);
      if (produit.famille) {
        setProduitFamille(produit.famille.nom);
      }
    }
  }, [clientTypeCimentId, produits]);

  // Function to handle product selection change
// Function to handle product selection change
const handleProduitChange = (e) => {
  const selectedProduitId = e.target.value;
  setClientTypeCimentId(selectedProduitId);
  
  if (selectedProduitId) {
    // Check if this product already has data for the selected client
    checkProductPhase(selectedClient, selectedProduitId);
  } else {
    setPhase("situation_courante");
    setDisplayPhase("situation_courante"); // ⭐ Mettre à jour les deux
  }
};

  // Function to check if product exists and determine phase
// Function to check if product exists and determine phase
const checkProductPhase = async (clientId, produitId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/check-product-phase?clientId=${clientId}&produitId=${produitId}`);
    const data = await response.json();
    
    if (data.exists) {
      setPhase("situation_courante");
      setDisplayPhase("situation_courante"); // ⭐ Mettre à jour les deux
    } else {
      setPhase("nouveau_type_produit");
      setDisplayPhase("nouveau_type_produit"); // ⭐ Mettre à jour les deux
    }
  } catch (error) {
    console.error('Error checking product phase:', error);
    setPhase("situation_courante");
    setDisplayPhase("situation_courante"); // ⭐ Mettre à jour les deux
  }
};

  // ⭐ NOUVEAU: State pour le statut d'export
  const [exportStatus, setExportStatus] = useState("");

  // ⭐ NOUVEAU: Mettre à jour le statut d'export
  useEffect(() => {
    setExportStatus(CentralExportService.getStatusMessage());
  }, [activeTab]); // Mettre à jour quand on change d'onglet

  // Fonction pour afficher le détail du statut
  const showExportDetails = () => {
    const status = CentralExportService.getExportStatus();
    const details = Object.entries(status)
      .map(([key, value]) => `${value} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
      .join('\n');
    
    alert(`📊 DÉTAIL DES PAGES:\n\n${details}`);
  };


const handleFileImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ⭐ SAUVEGARDER LA PHASE AVANT IMPORT
  const phaseBeforeImport = phase;
  console.log("💾 Phase sauvegardée avant import:", phaseBeforeImport);
  
  // Stocker cette phase pour le contrôle conformité
  setDisplayPhase(phaseBeforeImport);

  if (!selectedClient || !clientTypeCimentId) {
    alert("Veuillez sélectionner un client et un produit avant d'importer.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = XLSX.utils.sheet_to_json(ws);

      console.log("📊 Fichier Excel chargé:", importedData.length, "lignes");
      console.log("🎯 Phase sélectionnée avant import:", phaseBeforeImport);

      // Formater les données
      const formattedRows = importedData.map((row, index) => {
        const cleanValue = (val) => {
          if (val === null || val === undefined || val === "" || val === " ") {
            return null;
          }
          const strVal = String(val).trim();
          if (strVal === "" || strVal.toLowerCase() === "null" || strVal.toLowerCase() === "undefined") {
            return null;
          }
          return strVal;
        };

        const cleanNumeric = (val) => {
          const cleaned = cleanValue(val);
          if (cleaned === null) return null;
          
          const numericStr = cleaned.replace(',', '.');
          const num = parseFloat(numericStr);
          return isNaN(num) ? null : num;
        };

        return {
          num_ech: cleanValue(row["N° ech"] || row["Ech"] || row["Numéro"]),
          date_test: formatExcelDate(row["Date"] || row["date_test"] || row["DATE"]),
          rc2j: cleanNumeric(row["RC 2j (Mpa)"] || row["RC2J"] || row["RC 2j"]),
          rc7j: cleanNumeric(row["RC 7j (Mpa)"] || row["RC7J"] || row["RC 7j"]),
          rc28j: cleanNumeric(row["RC 28 j (Mpa)"] || row["RC28J"] || row["RC 28j"]),
          prise: cleanNumeric(row["Début prise(min)"] || row["Prise"] || row["Début prise"]),
          stabilite: cleanNumeric(row["Stabilité (mm)"] || row["Stabilité"] || row["Stabilite"]),
          hydratation: cleanNumeric(row["Hydratation"] || row["Chaleur hydratation"]),
          pfeu: cleanNumeric(row["Perte au feu (%)"] || row["PFEU"] || row["Perte au feu"]),
          r_insoluble: cleanNumeric(row["Résidu insoluble (%)"] || row["Résidu insoluble"] || row["Residu insoluble"]),
          so3: cleanNumeric(row["SO3 (%)"] || row["SO3"] || row["SO3"]),
          chlorure: cleanNumeric(row["Cl (%)"] || row["Chlorure"] || row["Cl"]),
          c3a: cleanNumeric(row["C3A"] || row["C3A"]),
          ajout_percent: cleanNumeric(row["Taux d'Ajouts (%)"] || row["Ajout"] || row["Taux ajout"]),
          type_ajout: cleanValue(row["Type ajout"] || row["Type_ajout"] || row["Type"]),
          source: cleanValue(row["SILO N°"] || row["Source"] || row["SILO"]),
        };
      }).filter(row => row.num_ech || row.date_test);

      console.log("📋 Données formatées pour envoi:", formattedRows.length, "lignes valides");

      if (formattedRows.length === 0) {
        alert("Aucune donnée valide à importer.");
        return;
      }

      // 🔥 TEST DE CONNEXION AU SERVEUR
      console.log("🔄 Test de connexion au serveur...");
      try {
        const testResponse = await fetch("http://localhost:5000/api/test", {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!testResponse.ok) {
          throw new Error(`Serveur répond avec erreur: ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        console.log("✅ Serveur accessible:", testData);
      } catch (testError) {
        console.error("❌ Serveur inaccessible:", testError);
        throw new Error("Serveur backend non accessible. Vérifiez que le serveur est démarré sur le port 5000.");
      }

      // 🔥 ENVOI DES DONNÉES D'IMPORT
      console.log("🔄 Envoi des données d'import...");
      console.log("📤 Paramètres envoyés:", {
        clientId: selectedClient,
        produitId: clientTypeCimentId,
        rowsCount: formattedRows.length,
        phaseSelectionnee: phase // Phase réelle pour le traitement
      });

      const res = await fetch("http://localhost:5000/api/echantillons/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          produitId: clientTypeCimentId,
          rows: formattedRows,
          currentPhase: phase // Phase réelle pour le traitement serveur
        }),
      });

      console.log("📨 Réponse HTTP:", res.status, res.statusText);

      // Gérer les réponses non-OK
      if (!res.ok) {
        let errorMessage = `Erreur ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("❌ Détails erreur:", errorData);
        } catch (parseError) {
          console.error("Erreur parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      
      console.log("✅ Import réussi - Détails:", {
        insertedRows: result.insertedRows,
        phaseUtilisee: result.phase,
        message: result.message
      });

      // ⭐⭐ GESTION DE LA PHASE APRÈS IMPORT RÉUSSI - MODIFIÉE
      let messageAlerte = `✅ ${result.message}`;
      
      if (result.phase) {
        const phaseDisplayBefore = phaseBeforeImport === 'nouveau_type_produit' ? 'Nouveau Type Produit' : 'Situation Courante';
        const phaseDisplayAfter = result.phase === 'nouveau_type_produit' ? 'Nouveau Type Produit' : 'Situation Courante';
        
        messageAlerte += `\n\n📊 Phase utilisée pour l'import: ${phaseDisplayBefore}`;
        
        // Mettre à jour la phase RÉELLE (pour les futurs imports)
        if (result.phase !== phase) {
          console.log(`🔄 Mise à jour phase réelle: ${phase} → ${result.phase}`);
          setPhase(result.phase);
          messageAlerte += `\n📊 Phase après import: ${phaseDisplayAfter}`;
          messageAlerte += `\n⚠️ Note: La phase a été mise à jour automatiquement pour les futurs imports`;
        }
        
        // ⭐ NE PAS METTRE À JOUR displayPhase - elle garde la phase d'avant import
        console.log(`💾 Phase pour contrôle conformité gardée: ${phaseBeforeImport}`);
        
        // Sauvegarder la phase RÉELLE dans la base
        try {
          await savePhaseToDatabase(selectedClient, clientTypeCimentId, result.phase);
          console.log(`💾 Phase réelle sauvegardée: ${result.phase}`);
        } catch (phaseError) {
          console.error('⚠️ Erreur sauvegarde phase réelle:', phaseError);
          messageAlerte += `\n⚠️ Attention: Erreur lors de la sauvegarde de la phase`;
        }
      } else {
        messageAlerte += `\n\n📊 Phase utilisée: ${phaseBeforeImport === 'nouveau_type_produit' ? 'Nouveau Type Produit' : 'Situation Courante'}`;
      }

      // Afficher l'alerte avec tous les détails
      alert(messageAlerte);
      
      // ⭐ CONTRÔLE CONFORMITÉ UTILISERA displayPhase (phase avant import)
      console.log("🎯 Phase pour contrôle conformité:", displayPhase);

      // ⭐⭐ VÉRIFICATION DES DONNÉES IMPORTÉES (DEBUG)
      try {
        const verifyResponse = await fetch(
          `http://localhost:5000/api/check-data-phase?clientId=${selectedClient}&produitId=${clientTypeCimentId}`
        );
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('🔍 Vérification données importées:', verifyData);
        }
      } catch (verifyError) {
        console.error('⚠️ Erreur vérification données:', verifyError);
      }
      
      // Recharger les données dans les tableaux
      if (tableRef.current?.refresh) {
        console.log("🔄 Rechargement des données...");
        tableRef.current.refresh();
      }
      
      // Forcer le rechargement de l'onglet actif
      setActiveTab(prevTab => {
        console.log(`🔄 Actualisation onglet: ${prevTab}`);
        return prevTab;
      });
      
      // Reset le champ fichier
      e.target.value = "";
      
      // ⭐ LOG FINAL DES ÉTATS DE PHASE
      console.log("📊 États phase finaux:", {
        phaseAvantImport: phaseBeforeImport,
        phaseReelle: phase,
        phaseAffichage: displayPhase,
        phaseServeur: result.phase
      });
      
    } catch (err) {
      console.error("💥 Erreur complète import:", {
        message: err.message,
        stack: err.stack
      });
      
      // Messages d'erreur spécifiques
      let errorMessage = `❌ Erreur d'import: ${err.message}`;
      
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('CONNECTION_REFUSED') ||
          err.message.includes('NetworkError')) {
        errorMessage = `❌ Impossible de se connecter au serveur backend.\n\nVérifiez que:\n1. Le serveur Node.js est démarré\n2. Il écoute sur le port 5000\n3. Aucun firewall ne bloque la connexion\n\nDétails: ${err.message}`;
      } else if (err.message.includes('Serveur backend non accessible')) {
        errorMessage = `❌ ${err.message}\n\nPour démarrer le serveur:\n1. Ouvrez un terminal\n2. Naviguez vers le dossier backend\n3. Exécutez: node server.js\n4. Attendez le message "✅ API running on http://localhost:5000"`;
      }
      
      alert(errorMessage);
    }
  };

  reader.onerror = (err) => {
    console.error("❌ Erreur FileReader:", err);
    alert("Erreur lors de la lecture du fichier.");
  };

  reader.readAsBinaryString(file);
};

// Ajoutez ces fonctions dans votre composant
const handleExportAllPages = async () => {
  try {
    console.log("🔄 Début de l'export de toutes les pages...");
    
    // Essayer d'abord le PDF combiné
    const success = await CentralExportService.exportAllToPDF();
    
    if (success) {
      setExportStatus(CentralExportService.getStatusMessage());
    } else {
      // Fallback: PDFs séparés
      console.log("🔄 Fallback vers PDFs séparés...");
      const fallbackSuccess = await CentralExportService.exportAllSeparatePDFs();
      if (fallbackSuccess) {
        setExportStatus(CentralExportService.getStatusMessage());
      } else {
        alert("❌ L'export a échoué pour toutes les méthodes.");
      }
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de l'export global:", error);
    alert("Erreur lors de l'export: " + error.message);
  }
};

const handleClearAllExport = () => {
  if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données d'export ?")) {
    CentralExportService.clearAllData();
    setExportStatus(CentralExportService.getStatusMessage());
    alert("🗑️ Toutes les données d'export ont été effacées");
  }
};



// Option avec choix
const handleExportWithChoice = async () => {
  try {
    const choice = window.confirm(
      "Choisissez le mode d'export:\n\n" +
      "✅ OK - PDF COMBINÉ (toutes pages en un seul fichier)\n" +
      "❌ Annuler - PDFs SÉPARÉS (chaque page individuellement)"
    );

    let success;
    if (choice) {
      // PDF combiné
      success = await CentralExportService.exportAllToPDF();
    } else {
      // PDFs séparés
      success = await CentralExportService.exportAllSequential();
    }

    if (success) {
      setExportStatus(CentralExportService.getStatusMessage());
    }
    
  } catch (error) {
    console.error("❌ Erreur export:", error);
    alert("Erreur: " + error.message);
  }
};





// Version alternative avec choix d'export
const handleExportAllPagesWithChoice = async () => {
  try {
    const choice = window.confirm(
      "Choisissez le mode d'export:\n\n" +
      "✅ OK - Export COMBINÉ (toutes pages en un seul PDF)\n" +
      "❌ Annuler - Export SÉQUENTIEL (PDFs individuels)"
    );

    let success;
    if (choice) {
      // Export combiné
      success = await CentralExportService.exportAllToPDF();
    } else {
      // Export séquentiel
      success = await CentralExportService.exportAllSequential();
    }

    if (success) {
      setExportStatus(CentralExportService.getStatusMessage());
    }
    
  } catch (error) {
    console.error("❌ Erreur export:", error);
    alert("Erreur: " + error.message);
  }
};

// Fonction pour sauvegarder la phase
const savePhaseToDatabase = async (clientId, produitId, phase) => {
  try {
    const response = await fetch('http://localhost:5000/api/save-phase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, produitId, phase })
    });
    
    if (!response.ok) throw new Error('Erreur sauvegarde phase');
    
    const result = await response.json();
    console.log('✅ Phase sauvegardée:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur sauvegarde phase:', error);
    throw error;
  }
};

// Fonction de formatage des dates Excel
const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return "";
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, "0");
  const day = String(date_info.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


  const handleTableDataChange = (data, start, end) => {
    setTableData(data);
    setStartDate(start);
    setEndDate(end);
  };

  // Get complete produit info including famille
  const getSelectedProduitInfo = () => {
    if (!clientTypeCimentId) return null;
    
    const produit = produits.find((p) => p.id == clientTypeCimentId);
    if (!produit) return null;
    
    return {
      id: produit.id,
      nom: produit.nom,
      description: produit.description,
      famille: produit.famille || null
    };
  };

  const selectedProduitInfo = getSelectedProduitInfo();

  useEffect(() => {
    fetch("/Data/parnorm.json")
      .then((res) => res.json())
      .then((data) => {
        setAjoutsData(data.ajout || {});
      })
      .catch((err) => {
        console.error("Erreur chargement parnorm.json:", err);
      });
  }, []);

  const getAjoutDescription = (code) => {
    if (!code || !ajoutsData) return "";

    const parts = code.split("-");
    const descriptions = parts.map((part) => {
      const ajout = ajoutsData[part];
      return ajout ? ajout.description : part;
    });

    return descriptions.join(" + ");
  };

  return (
    <div className="trait-donnees-container">
      <Header />
      <h1 className="trait-donnees-title">Traitement Données</h1>
      <div className="tabs-container">
        <button className={activeTab === "donnees" ? "active-tab" : "tab"} onClick={() => setActiveTab("donnees")}>
          Données Traitées
        </button>
        <button className={activeTab === "statistiques" ? "active-tab" : "tab"} onClick={() => setActiveTab("statistiques")}>
          Données Statistiques
        </button>
        <button className={activeTab === "graphique" ? "active-tab" : "tab"} onClick={() => setActiveTab("graphique")}>
          Données Graphiques
        </button>
        <button className={activeTab === "conformite" ? "active-tab" : "tab"} onClick={() => setActiveTab("conformite")}>
          Contrôle de Conformité
        </button>
        <button className={activeTab === "tabconform" ? "active-tab" : "tab"} onClick={() => setActiveTab("tabconform")}>
          Table Conformité
        </button>
      </div>
      
      <div className="selectors">
        <label>
          Client:
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
            <option value="">-- Choisir client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom_raison_sociale}
              </option>
            ))}
          </select>
        </label>

        {selectedClient && (
          <>

                      {/* Product Selection */}
            <label>
              Produit:
              <select value={clientTypeCimentId} onChange={handleProduitChange}>
                <option value="">-- Choisir produit --</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} 
                  </option>
                ))}
              </select>
              {selectedProduitInfo && (
                <div className="produit-info">
                  <div><strong>Description:</strong> {selectedProduitInfo.description}</div>
                </div>
              )}
            </label>

<div>
  <label>
    Phase de production:
  </label>

  <div>
    <label>
      <input
        type="radio"
        value="situation_courante"
        checked={phase === 'situation_courante'}
        onChange={() => {
          setPhase('situation_courante');
          setDisplayPhase('situation_courante'); // ⭐ Mettre à jour les deux
        }}
      />
      Situation courante
    </label>
    <br/>
    <label>
      <input
        type="radio"
        value="nouveau_type_produit"
        checked={phase === 'nouveau_type_produit'}
        onChange={() => {
          setPhase('nouveau_type_produit');
          setDisplayPhase('nouveau_type_produit'); // ⭐ Mettre à jour les deux
        }}
      />
      Nv type produit
    </label>
  </div>
</div>


            {/* Import section - only show when a product is selected */}
            {clientTypeCimentId && (
              <div className="import-section">
                <label>
                  Importer un fichier Excel:
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileImport} />
                  </label>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pass the phase to child components */}
      {activeTab === "donnees" && (
        <EchantillonsTable
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          produitInfo={selectedProduitInfo}
           phase={displayPhase}
          tableData={tableData}
          ajoutsData={ajoutsData}  
          selectedRows={selectedRows}
          onTableDataChange={handleTableDataChange}
        />
      )}

      {activeTab === "statistiques" && (
        <DonneesStatistiques
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          produitInfo={selectedProduitInfo}
          initialStart={startDate}
          initialEnd={endDate}
          clients={clients}
          produits={produits}
          ajoutsData={ajoutsData} 
           phase={displayPhase}
          onTableDataChange={handleTableDataChange}
        />
      )}
      
      {activeTab === "graphique" && (
        <DonneesGraphiques
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          produitInfo={selectedProduitInfo}
          initialStart={startDate}
          initialEnd={endDate}
          clients={clients}
          produits={produits}
           phase={displayPhase}
        />
      )}

      {activeTab === "conformite" && (
        <ControleConformite
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          produitInfo={selectedProduitInfo}
          initialStart={startDate}
          initialEnd={endDate}
          clients={clients}
          produits={produits}
          ajoutsData={ajoutsData} 
         phase={displayPhase}
          onTableDataChange={handleTableDataChange}
        />
      )}

      {activeTab === "tabconform" && (
        <TableConformite
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          produitInfo={selectedProduitInfo}
          initialStart={startDate}
          initialEnd={endDate}
          clients={clients}
          produits={produits}
          ajoutsData={ajoutsData}
          getAjoutDescription={getAjoutDescription}
           phase={displayPhase} 
          onTableDataChange={handleTableDataChange}
        />
      )}

                  {/* ⭐ NOUVEAU: Barre d'export global */}
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>Export Global des Pages</h3>
      
      {/* Statut actuel */}
      <div style={{ marginBottom: '15px' }}>
        <div>
          <strong>Statut Export:</strong>
          <span 
            style={{ 
              marginLeft: '10px', 
              color: CentralExportService.hasData() ? '#28a745' : '#6c757d',
              cursor: 'pointer'
            }}
            onClick={showExportDetails}
            title="Cliquez pour voir le détail"
          >
            {exportStatus}
          </span>
        </div>
        
        {/* Détail des pages (optionnel) */}
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          {Object.entries(CentralExportService.getExportStatus()).map(([key, status]) => (
            <div key={key}>
              {status} - {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleExportAllPages}
          disabled={!CentralExportService.hasData()}
          style={{
            padding: '10px 20px',
            backgroundColor: CentralExportService.hasData() ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: CentralExportService.hasData() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          title={CentralExportService.hasData() ? 
            "Exporter toutes les pages en un seul PDF" : 
            "Aucune donnée à exporter"
          }
        >
          📊 Exporter Toutes les Pages
        </button>
        
        <button 
          onClick={handleClearAllExport}
          disabled={!CentralExportService.hasData()}
          style={{
            padding: '10px 20px',
            backgroundColor: CentralExportService.hasData() ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: CentralExportService.hasData() ? 'pointer' : 'not-allowed',
            fontSize: '14px'
          }}
          title="Effacer toutes les données d'export"
        >
          🗑️ Effacer Tout
        </button>
        </div>
      </div>
      
    </div>
    
  );
};

export default TraitDonnes;