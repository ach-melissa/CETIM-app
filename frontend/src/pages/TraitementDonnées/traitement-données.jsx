import React, { useState, useEffect, useRef } from "react";
import "./TraitDonnes.css";
import Header from "../../components/Header/Header";
import DonneesStatistiques from "../../components/DonneesStatistiques/DonneesStatistiques";
import EchantillonsTable from "../../components/EchantillonsTable/EchantillonsTable";
import ControleConformite from "../../components/ControleConformite/ControleConformite";
import TableConformite from "../../components/TableConformite/TableConformite";
import DonneesGraphiques from "../../components/DonneesGraphiques/DonneesGraphiques";
import * as XLSX from "xlsx";
 const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return "";
  // Convert Excel serial date to JS Date
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400; 
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split("T")[0]; // YYYY-MM-DD
};





const TraitDonnes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [produits, setProduits] = useState([]);
  const [clientTypeCimentId, setClientTypeCimentId] = useState("");
  const [produitDescription, setProduitDescription] = useState("");
  const [phase, setPhase] = useState("");
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("donnees");
  const [loading, setLoading] = useState(false);
  const [newCement, setNewCement] = useState("");
  const [cementList, setCementList] = useState([]);
  const [clientId, setClientId] = useState("");
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);

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

  // Fetch produits based on selected client
  useEffect(() => {
    if (!selectedClient) {
      setProduits([]);
      setClientTypeCimentId("");
      setProduitDescription("");
      return;
    }

    fetch(`http://localhost:5000/api/produits/${selectedClient}`)
      .then((res) => res.json())
      .then((data) => {
        setProduits(data);
      })
      .catch((err) => {
        console.error("Erreur produits:", err);
        setError("Erreur lors du chargement des produits.");
      });
  }, [selectedClient]);

  // Set description for selected produit
  useEffect(() => {
    if (!clientTypeCimentId) {
      setProduitDescription("");
      return;
    }
    const produit = produits.find((p) => p.id == clientTypeCimentId);
    if (produit) {
      setProduitDescription(produit.description);
    }
  }, [clientTypeCimentId, produits]);

  // Add cement for selected client
  const addCementForClient = async () => {
    if (!newCement) {
      setError("Veuillez sélectionner un ciment.");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/client_types_ciment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    clientId: selectedClient,
    typeCimentId: newCement,
  }),
});

      setSuccess("Ciment ajouté au client avec succès !");
      setError(""); // Clear any previous errors
      setNewCement(""); // Clear the selected cement
      setShowNewTypeForm(false); // Close the form
      
      // Refresh the products list
      fetch(`http://localhost:5000/api/produits/${selectedClient}`)
        .then((res) => res.json())
        .then((data) => {
          setProduits(data);
        });
    } catch (err) {
      console.error("Erreur ajout ciment:", err);
      setError("Erreur lors de l'ajout du ciment.");
      setSuccess(""); // Clear success message
    }
  };

  // Handle file import
  
const handleFileImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!selectedClient || !clientTypeCimentId) {
    setError("Veuillez sélectionner un client et un produit avant d'importer.");
    return;
  }

  if (!window.confirm("Êtes-vous sûr de vouloir importer ce fichier ? Les données seront ajoutées à la base de données.")) {
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



const formattedRows = importedData.map((row, index) => ({
  id: Date.now() + index,

  num_ech: row["N° ech"] || row["Ech"] || "",
  date_test: formatExcelDate(row["Date"] || row.date_test || ""),
  rc2j: row["RC 2j (Mpa)"] || row["RC2J"] || "",
  rc7j: row["RC 7j (Mpa)"] || row["RC7J"] || "",
  rc28j: row["RC 28 j (Mpa)"] || row["RC28J"] || "",

  // Excel → DB
  prise: row["Début prise(min)"] || "",
  stabilite: row["Stabilité (mm)"] || "",
  hydratation: row["Hydratation"] || "",

  pfeu: row["Perte au feu (%)"] || "",
  r_insoluble: row["Résidu insoluble (%)"] || "",
  so3: row["SO3 (%)"] || "",
  chlorure: row["Cl (%)"] || "",
  c3a: row["C3A"] || "",
  ajout_percent: row["Taux d'Ajouts (%)"] || "",
  type_ajout: row["Type ajout"] || "",
  source: row["SILO N°"] || "",
}));




      // Sending data to the backend
      const res = await fetch("http://localhost:5000/api/echantillons/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          produitId: clientTypeCimentId,
          rows: formattedRows,
          
        }),
      });
 console.log("Imported data with date_test:", importedData);

      if (!res.ok) {
        const error = await res.json();
        console.error("Import failed:", error);
        setError("Erreur lors de l'importation des données.");
        return;
      }

      setSuccess("Fichier Excel importé et enregistré en base !");
      setError(""); // Clear any errors
      tableRef.current?.refresh(); // Refresh data table
    } catch (err) {
      console.error("Erreur import:", err);
      setError("Impossible d'importer les données.");
      setSuccess(""); // Clear success message
    }
  };

  reader.onerror = (err) => {
    console.error("FileReader error:", err);
    setError("Erreur lors de la lecture du fichier.");
  };

  reader.readAsBinaryString(file);
};










  // Define handleTableDataChange
  const handleTableDataChange = (data, start, end) => {
    setTableData(data);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="trait-donnees-container">
      <Header />
      <h1 className="trait-donnees-title">Traitement Données</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
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
         <button
          className={activeTab === "tabconform" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("tabconform")}
        >
          Table Conformité
        </button>
      </div>
      <div className="selectors">
        <label>
          Client:
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
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
              <select
                value={clientTypeCimentId}
                onChange={(e) => setClientTypeCimentId(e.target.value)}
              >
                <option value="">-- Tous les produits --</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
              {produitDescription && (
                <div className="produit-description">
                  <strong>Description:</strong> {produitDescription}
                </div>
              )}
            </label>

            {/* Button to trigger new cement form */}
            <button
              className="new-type-produit-btn"
              onClick={() => setShowNewTypeForm(true)}
              disabled={!selectedClient} // Disable when no client is selected
            >
              Nouveau Type Produit
            </button>
                {clientTypeCimentId && (
              <div className="import-section">
                <label>
                  Importer un fichier Excel:
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileImport}
                  />
                </label>
              </div>
            )}
            
          </>
        )}
      </div>

      {/* New Cement Type Form */}
      {showNewTypeForm && (
        <div className="form-container">
          <h3>Ajouter un Nouveau Type de Ciment</h3>
          <label>
            Sélectionner le type de ciment:
            <select
              value={newCement}
              onChange={(e) => setNewCement(e.target.value)}
            >
              <option value="">-- Choisir ciment --</option>
              {cementList.map((cement) => {
                // Check if the client already has this cement
                const clientHasCement = produits.some(p => p.id === cement.id);
                
                return (
                  <option 
                    key={cement.id} 
                    value={cement.id}
                    disabled={clientHasCement}
                    style={clientHasCement ? { color: '#ccc' } : {}}
                  >
                    {cement.nom || cement.code} {clientHasCement ? "(Déjà associé)" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <div className="form-buttons">
            <button onClick={addCementForClient}>Ajouter</button>
            <button onClick={() => {
              setShowNewTypeForm(false);
              setNewCement("");
            }}>Annuler</button>
          </div>
        </div>
      )}


      {activeTab === "donnees" && (
        <EchantillonsTable
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          phase={phase}
          tableData={tableData}
          selectedRows={selectedRows}
          handleTableDataChange={handleTableDataChange}
        />
      )}

      {activeTab === "statistiques" && (
        <DonneesStatistiques
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          initialStart={startDate}
          initialEnd={endDate}
          produitDescription={produitDescription}
          clients={clients}
          produits={produits}
          onTableDataChange={(data, s, e) => {
            setTableData(data);
            setStartDate(s);
            setEndDate(e);
          }}
        />
      )}
      
      {activeTab === "graphique" && (
        <DonneesGraphiques
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          initialStart={startDate}
          initialEnd={endDate}
          produitDescription={produitDescription}
          clients={clients}
          produits={produits}
        />
      )}

      {activeTab === "conformite" && (
        <ControleConformite
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          initialStart={startDate}
          initialEnd={endDate}
          produitDescription={produitDescription}
          clients={clients}
          produits={produits}
          onTableDataChange={(data, s, e) => {
            setTableData(data);
            setStartDate(s);
            setEndDate(e);
          }}
        />
      )}

      {activeTab === "tabconform" && (
        <TableConformite
          ref={tableRef}
          clientId={selectedClient}
          clientTypeCimentId={clientTypeCimentId}
          initialStart={startDate}
          initialEnd={endDate}
          produitDescription={produitDescription}
          clients={clients}
          produits={produits}
          onTableDataChange={(data, s, e) => {
            setTableData(data);
            setStartDate(s);
            setEndDate(e);
          }}
        />
      )}
      {activeTab === 'contConform' && (
          <ControleConformite
            ref={tableRef}
            clientId={selectedClient}
            clientTypeCimentId={clientTypeCimentId}
            initialStart={startDate}
            initialEnd={endDate}
            produitDescription={produitDescription}
            clients={clients}
            produits={produits}
            onTableDataChange={(data, s, e) => {
              setTableData(data);
              setStartDate(s);
              setEndDate(e);
            }}
          />
        )}
    </div>
  );
};

export default TraitDonnes; 