// Parametre_entreprise.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import "./ParametreEntreprise.css";

const ParametreEntreprise = () => {
  // States
  const [photo, setPhoto] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [clientsData, setClientsData] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showDeleteClient, setShowDeleteClient] = useState(false);
  const [newClient, setNewClient] = useState({
    sigle: "",
    nom_raison_sociale: "",
    adresse: "",
    essais: [{ type_ciment: "", produit_ciment: "", methode: "" }],
  });

  // Load clients from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/clients")
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 Données reçues du backend:", data);
        setClientsData(Array.isArray(data) ? data : []); // sécurité
      })
      .catch((err) => {
        console.error("❌ Erreur fetch clients:", err);
        setClientsData([]); // éviter le crash
      });
  }, []);

  // Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
    setValidationMessage("");
  };

  const handleValidate = () => {
    if (!selectedClientId) {
      setValidationMessage("Veuillez sélectionner un client avant de valider.");
      return;
    }
    const client = clientsData.find((c) => c.id === parseInt(selectedClientId));
    setValidationMessage(`✅ Paramètres validés pour ${client.nom_raison_sociale}`);
    setTimeout(() => setValidationMessage(""), 5000);
  };

  const handlePrint = () => window.print();
  const handleSave = () => alert("Paramètres sauvegardés avec succès!");
  const handleHelp = () =>
    alert("Aide: Cette page vous permet de configurer les paramètres de votre entreprise.");

  // Essais add/remove in "newClient"
  const handleAddEssaiRow = () => {
    setNewClient({
      ...newClient,
      essais: [...newClient.essais, { type_ciment: "", produit_ciment: "", methode: "" }],
    });
  };

  const handleRemoveEssaiRow = (index) => {
    const updatedEssais = newClient.essais.filter((_, i) => i !== index);
    setNewClient({ ...newClient, essais: updatedEssais });
  };

  // Adding a new client (local only for now)
  const handleSaveNewClient = () => {
    const newId = clientsData.length + 1;
    setClientsData([...clientsData, { id: newId, ...newClient }]);
    setNewClient({
      sigle: "",
      nom_raison_sociale: "",
      adresse: "",
      essais: [{ type_ciment: "", produit_ciment: "", methode: "" }],
    });
    setShowAddClient(false);
  };

  // Deleting a client (local only for now)
  const handleDeleteClient = (id) => {
    if (!id) return;
    const updated = clientsData.filter((c) => c.id !== parseInt(id));
    setClientsData(updated);
    if (selectedClientId === id) setSelectedClientId("");
    setShowDeleteClient(false);
  };

  const selectedClient = selectedClientId
    ? clientsData.find((c) => c.id === parseInt(selectedClientId))
    : null;

  return (
    <div className="parametre-entreprise-container">
      <Header />

      <div className="parametre-entreprise-content">
        <div className="entreprise-header">
          <h1>
            <i className="fas fa-cogs"></i> Paramètres Entreprise
          </h1>
        </div>

        

        {/* Informations client */}
        <div className="info-card">
          <h2 className="card-title">Informations Client</h2>
          <div className="client-info-grid">
            <div className="form-section">
              <label className="form-label">Sigle :</label>
              <div className="select-container">
                <select
                  value={selectedClientId}
                  onChange={handleClientChange}
                  className="client-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {clientsData.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.sigle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedClient && (
              <>
                <div className="form-section">
                  <label className="form-label">Nom / Raison sociale :</label>
                  <input
                    className="form-input"
                    type="text"
                    value={selectedClient.nom_raison_sociale}
                    readOnly
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">Adresse :</label>
                  <input
                    className="form-input"
                    type="text"
                    value={selectedClient.adresse}
                    readOnly
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">Type Ciment :</label>
                  <input
  className="form-input"
  type="text"
  value={selectedClient.types_ciment || "Non défini"}
  readOnly
/>

                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal: Ajouter un client */}
        {showAddClient && (
          <div className="modal">
            <div className="modal-content">
              <h3>Ajouter un client</h3>
              <label>Sigle :</label>
              <input
                type="text"
                value={newClient.sigle}
                onChange={(e) => setNewClient({ ...newClient, sigle: e.target.value })}
              />
              <label>Nom / Raison Sociale :</label>
              <input
                type="text"
                value={newClient.nom_raison_sociale}
                onChange={(e) =>
                  setNewClient({ ...newClient, nom_raison_sociale: e.target.value })
                }
              />
              <label>Adresse :</label>
              <input
                type="text"
                value={newClient.adresse}
                onChange={(e) => setNewClient({ ...newClient, adresse: e.target.value })}
              />

              <h3>Essais</h3>
              {newClient.essais.map((essai, index) => (
                <div key={index} className="essai-row">
                  <input
                    type="text"
                    placeholder="Type ciment"
                    value={essai.type_ciment}
                    onChange={(e) => {
                      const updated = [...newClient.essais];
                      updated[index].type_ciment = e.target.value;
                      setNewClient({ ...newClient, essais: updated });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Produit ciment"
                    value={essai.produit_ciment}
                    onChange={(e) => {
                      const updated = [...newClient.essais];
                      updated[index].produit_ciment = e.target.value;
                      setNewClient({ ...newClient, essais: updated });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Méthode"
                    value={essai.methode}
                    onChange={(e) => {
                      const updated = [...newClient.essais];
                      updated[index].methode = e.target.value;
                      setNewClient({ ...newClient, essais: updated });
                    }}
                  />
                  <button className="danger small" onClick={() => handleRemoveEssaiRow(index)}>
                    ❌
                  </button>
                </div>
              ))}
              <button className="secondary-btn" onClick={handleAddEssaiRow}>
                + Ajouter un essai
              </button>
              <div className="modal-actions">
                <button className="primary-btn" onClick={handleSaveNewClient}>
                  Enregistrer
                </button>
                <button className="secondary-btn" onClick={() => setShowAddClient(false)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Supprimer un client */}
        {showDeleteClient && (
          <div className="modal">
            <div className="modal-content">
              <h2>Supprimer un Client</h2>
              <select onChange={(e) => handleDeleteClient(e.target.value)}>
                <option value="">Sélectionnez un client</option>
                {clientsData.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.sigle} - {c.nom_raison_sociale}
                  </option>
                ))}
              </select>
              <button className="secondary-btn" onClick={() => setShowDeleteClient(false)}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <div
            className={`validation-message ${
              validationMessage.includes("✅") ? "success" : "error"
            }`}
          >
            {validationMessage}
          </div>
        )}

        {/* Action buttons */}
        <div className="header-actions">
          <button className="action-btn print-btn" onClick={handlePrint}>
            <i className="fas fa-print"></i> Imprimer
          </button>
          <button className="header-btn" onClick={() => setShowAddClient(true)}>
            <i className="fas fa-user-plus"></i> Ajouter Client
          </button>
          <button className="header-btn danger" onClick={() => setShowDeleteClient(true)}>
            <i className="fas fa-user-times"></i> Supprimer Client
          </button>
          <button className="primary-btn" onClick={handleSave}>
            <i className="fas fa-check-circle"></i> Enregistrer
          </button>
          <button className="validate-btn" onClick={handleValidate}>
            <i className="fas fa-check-double"></i> Valider
          </button>
          <button className="secondary-btn" onClick={handleHelp}>
            <i className="fas fa-question-circle"></i> Aide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParametreEntreprise;
