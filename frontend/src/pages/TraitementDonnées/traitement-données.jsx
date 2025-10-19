import React, { useState, useEffect, useRef } from "react";
import "./TraitDonnes.css";
import Header from "../../components/Header/Header";
import handleExportAllPDF from "../../services/handleExportAllPDF";
import DonneesStatistiques from "../../components/DonneesStatistiques/DonneesStatistiques";
import EchantillonsTable from "../../components/EchantillonsTable/EchantillonsTable";
import ControleConformite from "../../components/ControleConformite/ControleConformite";
import TableConformite from "../../components/TableConformite/TableConformite";
import DonneesGraphiques from "../../components/DonneesGraphiques/DonneesGraphiques";
import DonneesClients from "../../components/DonneesClients/DonneesClients";
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
  const [displayPhase, setDisplayPhase] = useState("situation_courante");
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("donneesClients");
  const [loading, setLoading] = useState(false);
  const [cementList, setCementList] = useState([]);
  const [ajoutsData, setAjoutsData] = useState({});

  const tableRef = useRef();
  const donneesClientsRef = useRef(null);
  const echantillonsRef = useRef();
  const statistiquesRef = useRef();
  const conformiteRef = useRef();
  const tableConformRef = useRef();
  const graphiquesRef = useRef();
  
const [traitementMode, setTraitementMode] = useState(false);


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
  const handleProduitChange = (e) => {
    const selectedProduitId = e.target.value;
    setClientTypeCimentId(selectedProduitId);
    if (selectedProduitId) {
      checkProductPhase(selectedClient, selectedProduitId);
    } else {
      setPhase("situation_courante");
      setDisplayPhase("situation_courante");
    }
  };

  // Function to check if product exists and determine phase
  const checkProductPhase = async (clientId, produitId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/check-product-phase?clientId=${clientId}&produitId=${produitId}`);
      const data = await response.json();
      if (data.exists) {
        setPhase("situation_courante");
        setDisplayPhase("situation_courante");
      } else {
        setPhase("nouveau_type_produit");
        setDisplayPhase("nouveau_type_produit");
      }
    } catch (error) {
      console.error('Error checking product phase:', error);
      setPhase("situation_courante");
      setDisplayPhase("situation_courante");
    }
  };

  // Handle file import
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const phaseBeforeImport = phase;
    console.log("💾 Phase sauvegardée avant import:", phaseBeforeImport);
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

        // Test de connexion au serveur
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

        // Envoi des données d'import
        console.log("🔄 Envoi des données d'import...");
        console.log("📤 Paramètres envoyés:", {
          clientId: selectedClient,
          produitId: clientTypeCimentId,
          rowsCount: formattedRows.length,
          phaseSelectionnee: phase
        });

        const res = await fetch("http://localhost:5000/api/echantillons/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: selectedClient,
            produitId: clientTypeCimentId,
            rows: formattedRows,
            currentPhase: phase
          }),
        });

        console.log("📨 Réponse HTTP:", res.status, res.statusText);

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

        let messageAlerte = `✅ ${result.message}`;
        if (result.phase) {
          const phaseDisplayBefore = phaseBeforeImport === 'nouveau_type_produit' ? 'Nouveau Type Produit' : 'Situation Courante';
          const phaseDisplayAfter = result.phase === 'nouveau_type_produit' ? 'Nouveau Type Produit' : 'Situation Courante';
          messageAlerte += `\n\n📊 Phase utilisée pour l'import: ${phaseDisplayBefore}`;

          if (result.phase !== phase) {
            console.log(`🔄 Mise à jour phase réelle: ${phase} → ${result.phase}`);
            setPhase(result.phase);
            messageAlerte += `\n📊 Phase après import: ${phaseDisplayAfter}`;
            messageAlerte += `\n⚠️ Note: La phase a été mise à jour automatiquement pour les futurs imports`;
          }

          console.log(`💾 Phase pour contrôle conformité gardée: ${phaseBeforeImport}`);

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

        alert(messageAlerte);
        console.log("🎯 Phase pour contrôle conformité:", displayPhase);

        // Vérification des données importées
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

        setActiveTab(prevTab => {
          console.log(`🔄 Actualisation onglet: ${prevTab}`);
          return prevTab;
        });

        e.target.value = "";

        console.log("📊 États phase finaux:", {
          phaseAvantImport: phaseBeforeImport,
          phaseReelle: phase,
          phaseAffichage: displayPhase,
          phaseServeur: result.phase
        });
      } catch (err) {
        console.error("💥 Erreur complète import:", { message: err.message, stack: err.stack });
        let errorMessage = `❌ Erreur d'import: ${err.message}`;
        if (err.message.includes('Failed to fetch') || err.message.includes('CONNECTION_REFUSED') || err.message.includes('NetworkError')) {
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

  const handleExportAllClick = async () => {
    await handleExportAllPDF([
      echantillonsRef,
      statistiquesRef,
      graphiquesRef,
      conformiteRef,
      tableConformRef,
    ]);
  };

  return (
    <div className="trait-donnees-container">
      <Header />
      <h1 className="trait-donnees-title">Traitement Données</h1>
      
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
              <label> Phase de production: </label>
              <div>
                <label>
                  <input 
                    type="radio" 
                    value="situation_courante" 
                    checked={phase === 'situation_courante'} 
                    onChange={() => {
                      setPhase('situation_courante');
                      setDisplayPhase('situation_courante');
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
                      setDisplayPhase('nouveau_type_produit');
                    }} 
                  />
                  Nv type produit
                </label>
              </div>
            </div>

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

     <div className="nav-tabs">
  <button 
  className={activeTab === "donneesClients" ? "active-tab" : "tab"}
    onClick={() => setActiveTab("donneesClients")} 
    disabled={traitementMode} 
    style={{
      cursor: traitementMode ? "not-allowed" : "pointer",
      opacity: traitementMode ? 0.5 : 1
    }}
  >
    Données Clients
  </button>

 <button
    className={activeTab === "echantillons" ? "active-tab" : "tab"}
    onClick={() => setActiveTab("echantillons")}
    disabled={!traitementMode}
  >
    Données Traitées
  </button>
  <button 
  className={activeTab === "statistiques" ? "active-tab" : "tab"}
    onClick={() => setActiveTab("statistiques")}
    disabled={!traitementMode}
    style={{
      cursor: !traitementMode ? "not-allowed" : "pointer",
      opacity: !traitementMode ? 0.5 : 1
    }}
  >
    Données Statistiques
  </button>
  
  <button className={activeTab === "graphique" ? "active-tab" : "tab"} onClick={() => setActiveTab("graphique")
  }
  disabled={!traitementMode}
    style={{
      cursor: !traitementMode ? "not-allowed" : "pointer",
      opacity: !traitementMode ? 0.5 : 1
    }}>
          Données Graphiques
        </button>
  <button 
  className={activeTab === "conformite" ? "active-tab" : "tab"}
    onClick={() => setActiveTab("conformite")}
    disabled={!traitementMode}
    style={{
      cursor: !traitementMode ? "not-allowed" : "pointer",
      opacity: !traitementMode ? 0.5 : 1
    }}
  >
    Contrôle Conformité
  </button>
  <button className={activeTab === "tabconform" ? "active-tab" : "tab"} onClick={() => setActiveTab("tabconform")}
      disabled={!traitementMode}
    style={{
      cursor: !traitementMode ? "not-allowed" : "pointer",
      opacity: !traitementMode ? 0.5 : 1
    }}>
          Table Conformité
        </button>
</div>

{traitementMode && (
  <div className="traitement-actions">
    <button
      onClick={() => {
        const confirmReset = window.confirm(
          "Êtes-vous sûr de vouloir réinitialiser ? "
        );
        if (!confirmReset) return;

        // ✅ Only reset if confirmed
        setTraitementMode(false);
        setActiveTab("donneesClients");
        setSelectedClient("");
        setClientTypeCimentId("");
        setPhase("situation_courante");
        setDisplayPhase("situation_courante");
      }}
    >
      Réinitialiser
    </button>
  </div>
)}


    
    {activeTab === "donneesClients" && (
  <DonneesClients 
  ref={donneesClientsRef}
  clientId={selectedClient}
  clientTypeCimentId={clientTypeCimentId}
  produitInfo={selectedProduitInfo}
  phase={phase}
    clients={clients}        // ✅ pass full list of clients
  produits={produits}
  ajoutsData={ajoutsData}
  tableData={tableData}
  selectedRows={selectedRows}
  onTableDataChange={handleTableDataChange}
  onStartTraitement={() => {
  setTraitementMode(true);
  setActiveTab("echantillons");
}}
/>

)}


      {activeTab === "echantillons" && (
        <EchantillonsTable
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          produitInfo={selectedProduitInfo}
          phase={phase}
          ajoutsData={ajoutsData}
          tableData={tableData}
          startDate={startDate}
          endDate={endDate}
            clients={clients}        // ✅ pass full list of clients
  produits={produits}
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
          phase={phase}
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
          phase={phase}
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
          phase={phase}
          onTableDataChange={handleTableDataChange}
        />
      )}
    </div>
  );
};

export default TraitDonnes;