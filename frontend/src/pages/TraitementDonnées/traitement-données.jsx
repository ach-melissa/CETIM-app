import React, { useState, useEffect, useRef } from "react";
import "./TraitDonnes.css";
import Header from "../../components/Header/Header";
import DonneesStatistiques from "../../components/DonneesStatistiques/DonneesStatistiques";
import EchantillonsTable from "../../components/EchantillonsTable/EchantillonsTable";
import ControleConformite from "../../components/ControleConformite/ControleConformite";
import TableConformite from "../../components/TableConformite/TableConformite";
import DonneesGraphiques from "../../components/DonneesGraphiques/DonneesGraphiques";
import * as XLSX from "xlsx";

function formatExcelDateTime(dateStr, timeStr) {
  let date = null;
  let time = null;

  if (dateStr) {
    if (typeof dateStr === "number") {
      // Excel serial date
      const excelDate = XLSX.SSF.parse_date_code(dateStr);
      if (excelDate) {
        const y = excelDate.y;
        const m = String(excelDate.m).padStart(2, "0");
        const d = String(excelDate.d).padStart(2, "0");
        date = `${y}-${m}-${d}`;
      }
    } else if (typeof dateStr === "string") {
      const parts = dateStr.split(/[\/-]/);
      if (parts.length === 3) {
        // ✅ Always interpret as JJ-MM-AAAA (French style)
        const [p1, p2, p3] = parts;
        const d = p1.padStart(2, "0");
        const m = p2.padStart(2, "0");
        const y = p3.length === 2 ? `20${p3}` : p3; // handle 2-digit years
        date = `${y}-${m}-${d}`;
      }
    }
  }

  if (timeStr) {
    if (typeof timeStr === "number") {
      const totalSeconds = Math.round(timeStr * 24 * 60 * 60);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      time = `${hours}:${minutes}:${seconds}`;
    } else {
      const t = String(timeStr).trim();
      time = t.length === 5 ? `${t}:00` : t;
    }
  }

  return { date, time };
}





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
      let importedData = [];
      const data = evt.target.result;

      if (file.name.endsWith(".csv")) {
        // 📌 Parse CSV as text
        const wb = XLSX.read(data, { type: "string" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        importedData = XLSX.utils.sheet_to_json(ws);
      } else {
        // 📌 Parse Excel (xls/xlsx)
        const wb = XLSX.read(data, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        importedData = XLSX.utils.sheet_to_json(ws);
      }

      // 👉 Now format your rows as you already do
      const formattedRows = importedData.map((row, index) => {
  const { date, time } = formatExcelDateTime(row["Date"], row["heure"]);
  return {
    id: Date.now() + index,
    num_ech: row["N° ech"] || row["Ech"] || "",
    date_test: date,
    heure_test: time,
    rc2j: row["RC 2j (Mpa)"] || row["RC2J"] || "",
    rc7j: row["RC 7j (Mpa)"] || row["RC7J"] || "",
    rc28j: row["RC 28 j (Mpa)"] || row["RC28J"] || "",
          prise: row["Début prise(min)"] || "",
          stabilite: row["Stabilité (mm)"] || "",
          hydratation: row["Chaleur hydratation (J/g)"] || "",
          pfeu: row["Perte au feu (%)"] || "",
          r_insoluble: row["Résidu insoluble (%)"] || "",
          so3: row["SO3 (%)"] || "",
          chlorure: row["Cl (%)"] || "",
          c3a: row["C3A"] || "",
          ajout_percent: row["Taux d'Ajouts (%)"] || "",
          type_ajout: row["Type ajout"] || "",
          source: row["SILO N°"] || "",
        };
      });

      // Reset input
      e.target.value = "";

      // Send to backend
      const res = await fetch("http://localhost:5000/api/echantillons/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          produitId: clientTypeCimentId,
          rows: formattedRows,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Import failed:", error);
        setError("Erreur lors de l'importation des données.");
        return;
      }

      setSuccess("Fichier importé et enregistré en base !");
      setError("");
      tableRef.current?.refresh();
    } catch (err) {
      console.error("Erreur import:", err);
      setError("Impossible d'importer les données.");
      setSuccess("");
    }
  };

  if (file.name.endsWith(".csv")) {
    reader.readAsText(file, "utf-8"); // read CSV as text
  } else {
    reader.readAsBinaryString(file);  // read Excel as binary
  }
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
  accept=".xlsx,.xls,.csv"
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