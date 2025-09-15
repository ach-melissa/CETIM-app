import React, { useState } from 'react';

import './ParametreEntreprise.css';

const ParametreEntreprise = () => {
  // State declarations
  const [photo, setPhoto] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showDeleteClient, setShowDeleteClient] = useState(false);
  const [newClient, setNewClient] = useState({
    sigle: '',
    nom_raison_sociale: '',
    adresse: '',
    essais: [{ type_ciment: '', produit_ciment: '', methode: '' }]
  });

  // Initial clients data
  const [clientsData, setClientsData] = useState({
    '1': {
      id: '1',
      nom_raison_sociale: 'Centre d\'Études et de Contrôle des Matériaux',
      adresse: 'Zone industrielle, Alger',
      sigle: 'CETIM',
      essais: [
        { type_ciment: 'CEM I', produit_ciment: 'Ciment Portland', methode: 'EN196-1' },
        { type_ciment: 'CEM II', produit_ciment: 'Ciment Portland composé', methode: 'EN196-2' }
      ]
    },
    '2': {
      id: '2',
      nom_raison_sociale: 'Entreprise Nationale des Produits de Construction',
      adresse: 'Rue des cimenteries, Oran',
      sigle: 'ENPC',
      essais: [
        { type_ciment: 'CEM II', produit_ciment: 'CEM II/A-S', methode: 'EN196-2' }
      ]
    },
    '3': {
      id: '3',
      nom_raison_sociale: 'Société Nationale des Ciments',
      adresse: 'Boumerdès, Algérie',
      sigle: 'SONACIM',
      essais: [
        { type_ciment: 'CEM IV', produit_ciment: 'Ciment pouzzolanique', methode: 'EN196-4' },
        { type_ciment: 'CEM III', produit_ciment: 'Ciment de haut fourneau', methode: 'EN196-5' }
      ]
    }
  });

  // Event handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
    setValidationMessage('');
  };

  const handlePrint = () => window.print();
  const handleSave = () => alert('Paramètres sauvegardés avec succès!');
  const handleHelp = () => alert('Aide: Cette page vous permet de configurer les paramètres de votre entreprise.');

  const handleValidate = () => {
    if (!selectedClientId) {
      setValidationMessage('Veuillez sélectionner un client avant de valider.');
      return;
    }
    const selectedClient = clientsData[selectedClientId];
    setValidationMessage(`✅ Paramètres validés avec succès pour ${selectedClient.nom_raison_sociale}`);
    setTimeout(() => setValidationMessage(''), 5000);
  };

  const handleAddEssaiRow = () => {
    setNewClient({
      ...newClient,
      essais: [...newClient.essais, { type_ciment: '', produit_ciment: '', methode: '' }]
    });
  };

  const handleRemoveEssaiRow = (index) => {
    const updatedEssais = newClient.essais.filter((_, i) => i !== index);
    setNewClient({ ...newClient, essais: updatedEssais });
  };

  const handleSaveNewClient = () => {
    const newId = String(Object.keys(clientsData).length + 1);
    setClientsData({
      ...clientsData,
      [newId]: { id: newId, ...newClient }
    });
    setNewClient({
      sigle: '',
      nom_raison_sociale: '',
      adresse: '',
      essais: [{ type_ciment: '', produit_ciment: '', methode: '' }]
    });
    setShowAddClient(false);
  };

  const handleDeleteClient = (id) => {
    if (!id) return;
    
    const updated = { ...clientsData };
    delete updated[id];
    setClientsData(updated);
    
    if (selectedClientId === id) {
      setSelectedClientId('');
    }
    setShowDeleteClient(false);
  };

  const handleAddRow = () => {
    if (!selectedClientId) return;
    
    const updated = { ...clientsData };
    updated[selectedClientId].essais.push({
      type_ciment: '',
      produit_ciment: '',
      methode: ''
    });
    setClientsData(updated);
  };

  const handleDeleteRow = (index) => {
    if (!selectedClientId) return;
    
    const updated = { ...clientsData };
    updated[selectedClientId].essais.splice(index, 1);
    setClientsData(updated);
  };

  const selectedClient = selectedClientId ? clientsData[selectedClientId] : null;

  return (
    <div className="parametre-entreprise-container">


      <div className="parametre-entreprise-content">
        {/* Header Section */}
        <div className="entreprise-header">
          <h1><i className="fas fa-cogs"></i> Paramètres Entreprise</h1>
        </div>

        {/* General Information Section */}
        <div className="form-section">
          <h2 className="card-title">Informations Générales</h2>
          <label className="form-label">Photo du client :</label>
          <div className="file-upload-container">
            <label htmlFor="file-upload" className="file-upload-btn">
              <i className="fas fa-cloud-upload-alt"></i> Image
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
            {photo && <img src={photo} alt="Aperçu" className="image-preview" />}
          </div>
        </div>

        {/* Client Information Section */}
        <div className="info-card">
          <h2 className="card-title">Informations Client</h2>

          <div className="client-info-grid">
            <div className="form-section">
              <label className="form-label">Sigle :</label>
              <div className="select-container">
                <select value={selectedClientId} onChange={handleClientChange} className="client-select">
                  <option value="">-- Sélectionner --</option>
                  {Object.values(clientsData).map((client) => (
                    <option key={client.id} value={client.id}>{client.sigle}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClient && (
              <>
                <div className="form-section">
                  <label className="form-label">Nom / Raison sociale :</label>
                  <input className="form-input" type="text" value={selectedClient.nom_raison_sociale} readOnly />
                </div>
                <div className="form-section">
                  <label className="form-label">Adresse :</label>
                  <input className="form-input" type="text" value={selectedClient.adresse} readOnly />
                </div>
              </>
            )}
          </div>

        </div>

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="modal">
            <div className="modal-content">
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
                onChange={(e) => setNewClient({ ...newClient, nom_raison_sociale: e.target.value })}
              />

              <label>Adresse :</label>
              <input
                type="text"
                value={newClient.adresse}
                onChange={(e) => setNewClient({ ...newClient, adresse: e.target.value })}
              />

              <h3>Essais (Types de Ciment)</h3>
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

              <button className="secondary-btn" onClick={handleAddEssaiRow}>+ Ajouter un essai</button>
              <div className="modal-actions">
                <button className="primary-btn" onClick={handleSaveNewClient}>Enregistrer</button>
                <button className="secondary-btn" onClick={() => setShowAddClient(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Client Modal */}
        {showDeleteClient && (
          <div className="modal">
            <div className="modal-content">
              <h2>Supprimer un Client</h2>
              <select onChange={(e) => handleDeleteClient(e.target.value)}>
                <option value="">Sélectionnez un client</option>
                {Object.values(clientsData).map((c) => (
                  <option key={c.id} value={c.id}>{c.sigle} - {c.nom_raison_sociale}</option>
                ))}
              </select>
              <button className="secondary-btn" onClick={() => setShowDeleteClient(false)}>Fermer</button>
            </div>
          </div>
        )}

        {/* Essais Table Section */}
        {selectedClient ? (
          <div className="info-card">
            <h2 className="card-title">Tableau des Essais</h2>

            <div className="table-container">
              <table className="essais-table">
                <thead>
                  <tr>
                    <th>Type Ciment</th>
                    <th>Produit Ciment</th>
                    <th>Méthode</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClient.essais.map((essai, index) => (
                    <tr key={index}>
                      <td><input type="text" value={essai.type_ciment} readOnly /></td>
                      <td><input type="text" value={essai.produit_ciment} readOnly /></td>
                      <td><input type="text" value={essai.methode} readOnly /></td>
                      <td>
                        <button className="header-btn" onClick={() => handleDeleteRow(index)}>
                          <i className="fas fa-trash"></i>Supp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="button-group">
              <button className="primary-btn" onClick={handleAddRow}>
                <i className="fas fa-plus"></i> Ajouter Ligne
              </button>
            </div>
          </div>
        ) : (
          <div className="select-client-message">
            <i className="fas fa-arrow-up"></i>
            <p>Veuillez sélectionner un client pour afficher ses informations</p>
          </div>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <div className={`validation-message ${validationMessage.includes('✅') ? 'success' : 'error'}`}>
            {validationMessage}
          </div>
        )}

        {/* Action Buttons */}

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
          <button className="primary-btn"><i className="fas fa-check-circle"></i> Enregistrer</button>
          <button className="validate-btn" onClick={handleValidate}><i className="fas fa-check-double"></i> Valider</button>
        
        </div>
      </div>
    </div>
  );
};

export default ParametreEntreprise;
