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

  // Situation state
  const [selectedSituation, setSelectedSituation] = useState(null); // "courante" or "nouveau"
  const [availableCementTypes, setAvailableCementTypes] = useState([]);
  const [newCementType, setNewCementType] = useState("");

  // Load clients
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

  // Load produits + available cement types when client changes
  useEffect(() => {
    if (!selectedClient) {
      setProduits([]);
      setSelectedProduit("");
      setProduitDescription("");
      setSelectedSituation(null);
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

    fetch("http://localhost:5000/api/types_ciment")
      .then((res) => res.json())
      .then((data) => {
        setAvailableCementTypes(data);
      })
      .catch((err) => {
        console.error("Erreur types ciment:", err);
        setError("Erreur lors du chargement des types de ciment.");
      });
  }, [selectedClient]);

  // Update produit description
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

  // Handle situation selection
  const handleSituationSelect = (situation) => {
    setSelectedSituation(situation);
    setPhase(situation === "courante" ? "livraison" : "fabrication");
    setSelectedProduit("");
    setProduitDescription("");
    setNewCementType("");
  };

  // Add cement type for client (nouveau)
  const handleAddCementType = async () => {
    if (!newCementType) {
      setError("Veuillez sélectionner un type de ciment.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/client_cement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          typeCimentId: newCementType,
        }),
      });

      if (!res.ok) throw new Error("Erreur ajout type ciment");

      // Refresh produits
      const produitsRes = await fetch(
        `http://localhost:5000/api/produits/${selectedClient}`
      );
      if (produitsRes.ok) {
        const data = await produitsRes.json();
        setProduits(data);

        const newProduct = data.find((p) => p.id == newCementType);
        if (newProduct) {
          setSelectedProduit(newProduct.id);
          setProduitDescription(newProduct.description);
        }
      }

      setSuccess("Type de ciment ajouté avec succès !");
      setError("");
    } catch (err) {
      console.error("Erreur ajout type ciment:", err);
      setError("Impossible d'ajouter le type de ciment.");
      setSuccess("");
    }
  };

  // Import Excel → DB + refresh
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedClient || !selectedProduit || !phase) {
      setError(
        "Veuillez sélectionner un client, un produit et une phase avant d'importer."
      );
      return;
    }

    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir importer ce fichier ? Les données seront ajoutées à la base."
      )
    ) {
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
        const res = await fetch(
          "http://localhost:5000/api/echantillons/import",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId: selectedClient,
              produitId: selectedProduit,
              phase,
              rows: importedData,
            }),
          }
        );

        if (!res.ok) throw new Error("Erreur import serveur");

        setSuccess(
          "Fichier Excel importé et enregistré en base ! (visible désormais dans Situation Courante)"
        );
        setError("");

        // keep data visible temporarily in "nouveau"
        tableRef.current?.refresh();
      } catch (err) {
        console.error("Erreur import:", err);
        setError("Impossible d'importer les données.");
        setSuccess("");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleTableDataChange = (data, s, e) => {
    setTableData(data);
    setStartDate(s);
    setEndDate(e);
  };

  // Example data for graphs
  const parameters = [{ id: "resistance", label: "Résistance (MPa)" }];
  const classOptions = {
    "CEM I": ["32.5 L", "32.5 N", "32.5 R"],
    "CEM II": ["42.5 L", "42.5 N", "42.5 R"],
    "CEM III": ["52.5 L", "52.5 N", "52.5 R"],
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

  return (
    <div className="trait-donnees-container">
      <Header />
      <h1 className="trait-donnees-title">Traitement Données</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Selectors */}
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
            <div className="situation-selector">
              <label>Sélectionnez une situation:</label>
              <div className="situation-buttons">
                <button
                  className={
                    selectedSituation === "courante"
                      ? "active-situation"
                      : "situation-button"
                  }
                  onClick={() => handleSituationSelect("courante")}
                >
                  Situation Courante
                </button>
                <button
                  className={
                    selectedSituation === "nouveau"
                      ? "active-situation"
                      : "situation-button"
                  }
                  onClick={() => handleSituationSelect("nouveau")}
                >
                  Nouveau Type Produit
                </button>
              </div>
            </div>

            {selectedSituation === "courante" && (
              <label>
                Produit:
                <select
                  value={selectedProduit}
                  onChange={(e) => setSelectedProduit(e.target.value)}
                >
                  <option value="">-- Choisir produit --</option>
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
            )}

            {selectedSituation === "nouveau" && (
              <div className="add-cement-form">
                <label>
                  Sélectionnez un nouveau type de ciment:
                  <select
                    value={newCementType}
                    onChange={(e) => setNewCementType(e.target.value)}
                  >
                    <option value="">-- Choisir type de ciment --</option>
                    {availableCementTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.code} - {type.description}
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={handleAddCementType}>
                  Ajouter ce type de ciment
                </button>

                {selectedProduit && (
                  <div className="produit-info">
                    <strong>Produit sélectionné:</strong>{" "}
                    {produits.find((p) => p.id == selectedProduit)?.nom}
                    <div className="produit-description">
                      <strong>Description:</strong> {produitDescription}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedProduit && (
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

      {/* Tabs */}
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

      {/* Tabs content */}
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
            selectedSituation={selectedSituation}
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
            ref={tableRef}
            clientId={selectedClient}
            produitId={selectedProduit}
            initialStart={startDate}
            initialEnd={endDate}
            produitDescription={produitDescription}
            clients={clients}
            produits={produits}
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