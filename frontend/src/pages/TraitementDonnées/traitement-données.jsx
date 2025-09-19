// TraitDonnes.jsx
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

import "./TraitDonnes.css";
import Header from "../../components/Header/Header";
import DonneesStatistiques from "../../components/DonneesStatistiques/DonneesStatistiques";
import EchantillonsTable from "../../components/EchantillonsTable/EchantillonsTable";
import ControleConformite from "../../components/ControleConformite/ControleConformite";
import TableConformite from "../../components/TableConformite/TableConformite";
import DonneesGraphiques from "../../components/DonneesGraphiques/DonneesGraphiques";

const TraitDonnes = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [produits, setProduits] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState("");
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

const [selectedParameter, setSelectedParameter] = useState("resistance");
const [selectedClass, setSelectedClass] = useState("");

  const tableRef = useRef();
const [filteredTableData, setFilteredTableData] = useState([]);
 
// ================================
  // Load clients
  // ================================
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/clients")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
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

  // ================================
  // Load produits for selected client
  // ================================
  useEffect(() => {
    if (!selectedClient) {
      setProduits([]);
      setSelectedProduit("");
      setProduitDescription("");
      return;
    }

    fetch(`http://localhost:5000/api/produits/${selectedClient}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau produits");
        return res.json();
      })
      .then((data) => {
        setProduits(data);
      })
      .catch((err) => {
        console.error("Erreur produits:", err);
        setError("Erreur lors du chargement des produits.");
      });
  }, [selectedClient]);

  // ================================
  // Update produit description
  // ================================
  useEffect(() => {
    if (!selectedProduit) {
      setProduitDescription("");
      return;
    }
    const produit = produits.find((p) => p.id == selectedProduit);
    if (produit) {
      setProduitDescription(produit.description);
    }
  }, [selectedProduit, produits]);

  // ================================
  // Import Excel → DB + refresh table
  // ================================
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedClient || !selectedProduit || !phase) {
      setError("Veuillez sélectionner un client, un produit et une phase avant d'importer.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = XLSX.utils.sheet_to_json(ws);

      try {
        const res = await fetch("http://localhost:5000/api/echantillons/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: selectedClient,
            produitId: selectedProduit,
            phase,
            rows: importedData,
          }),
        });

        if (!res.ok) throw new Error("Erreur import serveur");

        setSuccess("Fichier Excel importé et enregistré en base !");
        setError("");

        // ✅ Refresh table automatically
        tableRef.current?.refresh();
      } catch (err) {
        console.error("Erreur import:", err);
        setError("Impossible d'importer les données.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // ================================
  // Export
  // ================================
  const handleExport = () => {
    if (tableData.length === 0) {
      setError("Aucune donnée à exporter.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données Traitées");
    XLSX.writeFile(wb, "donnees_traitees.xlsx");
    setSuccess("Données exportées avec succès !");
  };

  const handlePrint = () => window.print();

  // ================================
  // Save modifications
  // ================================
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/echantillons/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: tableData }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setSuccess("Modifications sauvegardées en base !");
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      setError("Impossible de sauvegarder les données.");
    }
  };

  // ================================
  // Row management
  // ================================
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      setError("Veuillez sélectionner au moins une ligne.");
      return;
    }
    if (!window.confirm(`Supprimer ${selectedRows.length} ligne(s) ?`)) return;

    try {
      await fetch("http://localhost:5000/api/echantillons/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows }),
      });

      setTableData((prev) => prev.filter((item) => !selectedRows.includes(item.id)));
      setSelectedRows([]);
      setSuccess("Lignes supprimées !");
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError("Impossible de supprimer les lignes.");
    }
  };

  const handleClearAll = () => {
    if (!window.confirm("Êtes-vous sûr de vouloir vider toutes les données ?")) return;
    setTableData([]);
    setSelectedRows([]);
    setSuccess("Toutes les données ont été supprimées !");
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === tableData.length && tableData.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map((item) => item.id));
    }
  };


  const handleTableDataChange = (data, s, e) => {
  setTableData(data);
  setStartDate(s);
  setEndDate(e);
};
  // Example data (replace with real state you already have)
  const parameters = [
    { id: "resistance", label: "Résistance (MPa)" },
  ];

  const classOptions = {
    "CEM I": ["32.5 L", "32.5 N", "32.5 R"],
    "CEM II": ["42.5 L", "42.5 N","42.5 R"],
    "CEM III": ["52.5 L", "52.5 N","52.5 R"]
  };

  const chartStats = {
    limiteInf: 27,
    limiteSup: 36,
    limiteGarantie: 25,
    moyenne: 32.75,
    countBelowInf: 1,
    percentBelowInf: 25,
    countAboveSup: 1,
    percentAboveSup: 25,
    countBelowGarantie: 0,
    percentBelowGarantie: 0,
  };
  // ================================
  // RENDER
  // ================================
  return (
    <div className="trait-donnees-container">
      <Header />

      <h1 className="trait-donnees-title">Traitement Données</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Sélecteurs */}
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

        <label>
          Produit:
          <select value={selectedProduit} onChange={(e) => setSelectedProduit(e.target.value)}>
            <option value="">-- Choisir produit --</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
                      <div className="produit-description">
              <strong>Description:</strong> {produitDescription}
            </div>
        </label>

        <label>
          Phase:
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="">-- Choisir phase --</option>
            <option value="fabrication"> Nouveau type produit </option>
            <option value="livraison">Situation courante</option>
          </select>
        </label>
      </div>

      {/* Onglets */}
      <div className="tabs-container">
        <button
          className={activeTab === "donnees" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("donnees")}
        >
          Données Traitées
        </button>
        <button
          className={activeTab === "statistiques" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("statistiques")}
        >
          Données Statistiques
        </button>
        <button
          className={activeTab === "graphiques" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("graphiques")}
        >
          Données Graphiques
        </button>
        <button
          className={activeTab === "contConform" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("contConform")}
        >
          Contrôle Conformité
        </button>
        <button
          className={activeTab === "tabconform" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("tabconform")}
        >
          Table Conformité
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === "donnees" && (
          <EchantillonsTable
            ref={tableRef}
            clientId={selectedClient}
            produitId={selectedProduit}
            phase={phase}
            initialStart={startDate}
            initialEnd={endDate}
            produitDescription={produitDescription}
            clients={clients}
            produits={produits}
            onTableDataChange={handleTableDataChange}

            setFilteredTableData={setFilteredTableData}
          />
        )}


        {activeTab === 'statistiques' && (
          <DonneesStatistiques
            ref={tableRef}
            clientId={selectedClient}
            produitId={selectedProduit}
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
       {activeTab === 'graphiques' && (
  <DonneesGraphiques
    parameters={parameters}
    selectedParameter={selectedParameter}
    setSelectedParameter={setSelectedParameter}
    classOptions={classOptions}
    selectedClass={selectedClass}
    setSelectedClass={setSelectedClass}
    chartStats={chartStats}
    tableData={tableData}
    handleExport={handleExport}
    handlePrint={handlePrint}
    handleSave={handleSave}
  />
)}


{activeTab === 'contConform' && (
  <ControleConformite
            ref={tableRef}
            clientId={selectedClient}
            produitId={selectedProduit}
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
        {activeTab === 'tabconform' && (
          <TableConformite
            ref={tableRef}
            clientId={selectedClient}
            produitId={selectedProduit}
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
    </div>
  );
};

export default TraitDonnes;
