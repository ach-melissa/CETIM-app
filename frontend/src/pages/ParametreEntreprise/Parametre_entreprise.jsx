import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import "./ParametreEntreprise.css";

const ParametreEntreprise = () => {
  // States
  const [selectedClientId, setSelectedClientId] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [clientsData, setClientsData] = useState([]);
  const [typesCiment, setTypesCiment] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  const [newClient, setNewClient] = useState({
    sigle: "",
    nom_raison_sociale: "",
    adresse: "",
    types_ciment: [],
  });

  const [editClient, setEditClient] = useState({
    id: "",
    sigle: "",
    nom_raison_sociale: "",
    adresse: "",
    types_ciment: [],
  });

  // Charger clients + types ciment
  useEffect(() => {
    fetchClients();
    fetchCementTypes();
  }, []);

  const fetchClients = () => {
    fetch("http://localhost:5000/api/clients")
      .then((res) => res.json())
      .then((data) => setClientsData(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("❌ Erreur fetch clients:", err);
        setClientsData([]);
      });
  };

  const fetchCementTypes = () => {
    fetch("http://localhost:5000/api/types_ciment")
      .then((res) => res.json())
      .then((data) => setTypesCiment(data))
      .catch((err) => console.error("❌ Erreur fetch types:", err));
  };

  // Vérifier si le client a des traitements
  const checkClientHasTraitements = async (clientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${clientId}/traitements`);
      const data = await res.json();
      return data.hasTraitements || false;
    } catch (err) {
      console.error("❌ Erreur vérification traitements:", err);
      return false;
    }
  };

  // Handlers
  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
    setValidationMessage("");
  };

  const handleSaveNewClient = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      const savedClient = await res.json();
      setClientsData([...clientsData, savedClient]);
      setNewClient({
        sigle: "",
        nom_raison_sociale: "",
        adresse: "",
        types_ciment: [],
      });
      setShowAddClient(false);
    } catch (err) {
      console.error("❌ Erreur ajout client:", err);
    }
  };

  const openEditClient = () => {
    if (!selectedClientId) {
      alert("Veuillez sélectionner un client à modifier");
      return;
    }
    const client = clientsData.find((c) => c.id === parseInt(selectedClientId));
    if (client) {
      setEditClient({
        id: client.id,
        sigle: client.sigle,
        nom_raison_sociale: client.nom_raison_sociale,
        adresse: client.adresse,
        types_ciment: client.types_ciment.map((tc) => tc.id), // IDs only
      });
      setShowEditClient(true);
    }
  };

  const handleUpdateClient = async () => {
    if (!window.confirm("⚠️ Voulez-vous vraiment mettre à jour ce client ?")) return;

    try {
      const payload = {
        ...editClient,
        types_ciment: editClient.types_ciment, // always IDs
      };

      const res = await fetch(`http://localhost:5000/api/clients/${editClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setValidationMessage("✅ Client modifié avec succès");
        fetchClients();
        setShowEditClient(false);
        setTimeout(() => setValidationMessage(""), 5000);
      } else {
        const errorData = await res.json();
        setValidationMessage(`❌ Erreur: ${errorData.message}`);
      }
    } catch (err) {
      console.error("❌ Erreur modification client:", err);
      setValidationMessage("❌ Erreur lors de la modification du client");
    }
  };

const handleDeleteClient = async () => {
  if (!selectedClientId) {
    alert("Veuillez sélectionner un client à supprimer");
    return;
  }

  const client = clientsData.find((c) => c.id === parseInt(selectedClientId));
  if (!client) {
    alert("Client non trouvé");
    return;
  }

  try {
    console.log("🔍 Vérification des échantillons via API échantillons...");
    
    // UTILISER DIRECTEMENT L'ENDPOINT ÉCHANTILLONS QUI FONCTIONNE
    const resEchantillons = await fetch(`http://localhost:5000/api/echantillons?client_id=${selectedClientId}`);
    
    if (!resEchantillons.ok) {
      throw new Error(`Erreur API échantillons: ${resEchantillons.status}`);
    }
    
    const echantillons = await resEchantillons.json();
    const hasTraitements = echantillons.length > 0;
    const count = echantillons.length;

    console.log(`✅ Client "${client.sigle}" a ${count} échantillon(s)`);

    let shouldDelete = false;

    if (count === 0) {
      // ✅ Client SANS échantillons - confirmation simple
      shouldDelete = window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le client "${client.sigle}" ?\nCe client n'a aucun échantillon enregistré.`);
    } else {
      // 🚨 Client AVEC échantillons - confirmation triple
      const confirm1 = window.confirm(`🚨 ATTENTION CRITIQUE ! Le client "${client.sigle}" a ${count} échantillon(s).\n\nPremière confirmation : Voulez-vous vraiment supprimer ce client ?`);
      if (!confirm1) return;
      
      const confirm2 = window.confirm(`🚨 DEUXIÈME CONFIRMATION : Cette action supprimera également tous les échantillons associés. Confirmez-vous ?`);
      if (!confirm2) return;
      
      const confirm3 = window.confirm(`🚨 DERNIÈRE CONFIRMATION : Êtes-vous ABSOLUMENT certain de vouloir supprimer définitivement ce client et tous ses échantillons ?`);
      shouldDelete = confirm3;
    }

    if (shouldDelete) {
      console.log("🗑️ Suppression du client en cours...");
      
      // Appel à l'API de suppression
      const resDelete = await fetch(`http://localhost:5000/api/clients/${selectedClientId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (resDelete.ok) {
        const result = await resDelete.json();
        console.log("✅ Suppression réussie:", result);
        
        // Mettre à jour l'état local
        setClientsData(prev => prev.filter(c => c.id !== parseInt(selectedClientId)));
        setSelectedClientId("");
        setValidationMessage(result.message || "✅ Client supprimé avec succès");
        
        setTimeout(() => setValidationMessage(""), 5000);
      } else {
        const errorText = await resDelete.text();
        console.error("❌ Erreur suppression:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: "Erreur lors de la suppression du client" };
        }
        alert(errorData.message || "Erreur lors de la suppression du client");
      }
    }
  } catch (err) {
    console.error("❌ Erreur vérification échantillons:", err);
    
    // Fallback ultime : demander directement sans vérification
    const shouldDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.sigle}" ?\n\nImpossible de vérifier les échantillons.`);
    
    if (shouldDelete) {
      try {
        const resDelete = await fetch(`http://localhost:5000/api/clients/${selectedClientId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (resDelete.ok) {
          const result = await resDelete.json();
          setClientsData(prev => prev.filter(c => c.id !== parseInt(selectedClientId)));
          setSelectedClientId("");
          setValidationMessage(result.message || "✅ Client supprimé avec succès");
          setTimeout(() => setValidationMessage(""), 5000);
        } else {
          alert("Erreur lors de la suppression du client");
        }
      } catch (deleteErr) {
        console.error("❌ Erreur suppression finale:", deleteErr);
        alert("Erreur réseau lors de la suppression");
      }
    }
  }
};

  const toggleCementType = (typeId, isNewClient = true) => {
    const clientState = isNewClient ? newClient : editClient;
    const setClientState = isNewClient ? setNewClient : setEditClient;

    let updatedTypes = [...clientState.types_ciment];
    if (updatedTypes.includes(typeId)) {
      updatedTypes = updatedTypes.filter((id) => id !== typeId);
    } else {
      updatedTypes.push(typeId);
    }

    setClientState({
      ...clientState,
      types_ciment: updatedTypes,
    });
  };

  const selectedClient = selectedClientId
    ? clientsData.find((c) => c.id === parseInt(selectedClientId))
    : null;

  useEffect(() => {
    if (selectedClientId) {
      console.log("Selected Client:", selectedClient);
      console.log("Cement Types:", selectedClient?.types_ciment);
      console.log("All Cement Types:", typesCiment);
    }
  }, [selectedClientId, selectedClient, typesCiment]);

  return (
    <div className="parametre-entreprise-container">
      <Header />
      <div className="parametre-entreprise-content">
        <div className="paramh">
          <h1>
            <i className="fas fa-cogs"></i> Paramètres Entreprise
          </h1>
        </div>
           
        {validationMessage && <p className="validation-msg">{validationMessage}</p>}

        {/* Action buttons - MOVED ABOVE CLIENT INFO */}
        <div className="action-buttons">
          <button className="primary-btn" onClick={() => setShowAddClient(true)}> 
            Ajouter Nouveau Client 
          </button>
          <button className="secondary-btn" onClick={openEditClient}> 
            Modifier Client 
          </button>
          <button className="danger-btn" onClick={handleDeleteClient}> 
            Supprimer Client 
          </button>
        </div>
            
        {/* Informations client */}
        <div className="info-card">
          <h2 className="card-title">Informations Client</h2>
          <div className="client-info-grid">
            <div className="form-section">
              <label className="form-label">Sigle :</label>
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

            <div className="form-section">
              <label className="form-label">Nom / Raison sociale :</label>
              <input
                className="form-input"
                type="text"
                value={selectedClient ? selectedClient.nom_raison_sociale : "---"}
                readOnly
              />
            </div>
            <div className="form-section">
              <label className="form-label">Adresse :</label>
              <input
                className="form-input"
                type="text"
                value={selectedClient ? selectedClient.adresse : "---"}
                readOnly
              />
            </div>
           
            <div className="form-section">
              <label className="form-label">Types Ciment :</label>
              <div className="cement-types-list">
                {selectedClient && selectedClient.types_ciment && selectedClient.types_ciment.length > 0 ? (
                  selectedClient.types_ciment.map((tc) => {
                    const typeId = typeof tc === 'object' ? tc.id : tc;
                    const typeObj = typesCiment.find(t => t.id === typeId);
                    
                    return typeObj ? (
                      <span key={typeId} className="cement-tag">
                        {typeObj.code} - {typeObj.description}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="no-cement">---</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Ajouter Client */}
        {showAddClient && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setShowAddClient(false)}>✖</button>
              <h3>Ajouter un client</h3>
              <div className="form-group">
                <label>Sigle :</label>
                <input
                  type="text"
                  value={newClient.sigle}
                  onChange={(e) => setNewClient({ ...newClient, sigle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Nom / Raison Sociale :</label>
                <input
                  type="text"
                  value={newClient.nom_raison_sociale}
                  onChange={(e) => setNewClient({ ...newClient, nom_raison_sociale: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Adresse :</label>
                <input
                  type="text"
                  value={newClient.adresse}
                  onChange={(e) => setNewClient({ ...newClient, adresse: e.target.value })}
                />
              </div>
              <div className="form-group">
                <h3>Types de Ciment</h3>
                <div className="cement-selection">
                  {typesCiment.map((tc) => (
                    <div key={tc.id} className="cement-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={newClient.types_ciment.includes(tc.id)}
                          onChange={() => toggleCementType(tc.id, true)}
                        />
                        <strong>{tc.code}</strong> - {tc.description}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button className="primary-btn" onClick={handleSaveNewClient}>Enregistrer</button>
                <button className="secondary-btn" onClick={() => setShowAddClient(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Modifier Client */}
        {showEditClient && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setShowEditClient(false)}>✖</button>
              <h3>Modifier le client</h3>
              <div className="form-group">
                <label>Sigle :</label>
                <input
                  type="text"
                  value={editClient.sigle}
                  onChange={(e) => setEditClient({ ...editClient, sigle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Nom / Raison Sociale :</label>
                <input
                  type="text"
                  value={editClient.nom_raison_sociale}
                  onChange={(e) => setEditClient({ ...editClient, nom_raison_sociale: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Adresse :</label>
                <input
                  type="text"
                  value={editClient.adresse}
                  onChange={(e) => setEditClient({ ...editClient, adresse: e.target.value })}
                />
              </div>
              <div className="form-group">
                <h3>Types de Ciment</h3>
                <h5>Ciment Courant:</h5>
                <div className="cement-selected">
                  {editClient.types_ciment.length > 0 ? (
                    editClient.types_ciment.map((id) => {
                      const obj = typesCiment.find((t) => t.id === id);
                      return (
                        <span key={id} className="cement-tag">
                          {obj?.code} - {obj?.description}
                        </span>
                      );
                    })
                  ) : (
                    <span className="no-cement">Aucun sélectionné</span>
                  )}
                </div>
                <div className="cement-selection">
                  {typesCiment.map((tc) => (
                    <div key={tc.id} className="cement-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={editClient.types_ciment.includes(tc.id)}
                          onChange={() => toggleCementType(tc.id, false)}
                        />
                        <strong>{tc.code}</strong> - {tc.description}
                      </label>
                    </div>
                  ))}
                </div>
                
              </div>
              <div className="modal-actions">
                <button className="primary-btn" onClick={handleUpdateClient}>Mettre à jour</button>
                <button className="secondary-btn" onClick={() => setShowEditClient(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParametreEntreprise;