import React, { useState } from 'react';
import Header from "../../header/Header";
import './ParametreEntreprise.css';

const ParametreEntreprise = () => {
  const [photo, setPhoto] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  
  const [clientsData] = useState({
    '1': {
      id: 1,
      nom_raison_sociale: 'Centre d\'Études et de Contrôle des Matériaux',
      adresse: 'Zone industrielle, Alger',
      sigle: 'CETIM',
      essais: [
        { type_ciment: 'CEM I', produit_ciment: 'Ciment Portland', methode: 'EN196-1' },
        { type_ciment: 'CEM II', produit_ciment: 'Ciment Portland composé', methode: 'EN196-2' }
      ]
    },
    '2': {
      id: 2,
      nom_raison_sociale: 'Entreprise Nationale des Produits de Construction',
      adresse: 'Rue des cimenteries, Oran',
      sigle: 'ENPC',
      essais: [
        { type_ciment: 'CEM II', produit_ciment: 'CEM II/A-S', methode: 'EN196-2' }
      ]
    },
    '3': {
      id: 3,
      nom_raison_sociale: 'Société Nationale des Ciments',
      adresse: 'Boumerdès, Algérie',
      sigle: 'SONACIM',
      essais: [
        { type_ciment: 'CEM IV', produit_ciment: 'Ciment pouzzolanique', methode: 'EN196-4' },
        { type_ciment: 'CEM III', produit_ciment: 'Ciment de haut fourneau', methode: 'EN196-5' }
      ]
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
    setValidationMessage('');
  };

  const handleValidate = () => {
    if (!selectedClientId) {
      setValidationMessage('Veuillez sélectionner un client avant de valider.');
      return;
    }
    
    const selectedClient = clientsData[selectedClientId];
    
    console.log('Données validées pour le client:', selectedClient);
    
    setValidationMessage(`✅ Paramètres validés avec succès pour ${selectedClient.nom_raison_sociale}`);
    
    setTimeout(() => {
      setValidationMessage('');
    }, 5000);
  };

  const selectedClient = selectedClientId ? clientsData[selectedClientId] : null;

  return (
    <div className="parametre-entreprise-container">
      <Header />
      <div className="parametre-entreprise-content">
        <div className="entreprise-header">
          <h1><i className="fas fa-cogs"></i> Paramètres Entreprise</h1>
          <div className="header-actions">
            <button className="header-btn"><i className="fas fa-save"></i> Sauvegarder</button>
            <button className="header-btn"><i className="fas fa-print"></i> Imprimer</button>
            <button className="header-btn"><i className="fas fa-question-circle"></i> Aide</button>
          </div>
        </div>
        
        <div className="info-card">
          <h2 className="card-title">Informations Générales</h2>
          
          <div className="form-section">
            <label className="form-label">Photo du client :</label>
            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-upload-btn">
                <i className="fas fa-cloud-upload-alt"></i> Choisir une image
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
              {photo && <img src={photo} alt="Aperçu" className="image-preview" />}
            </div>
          </div>
          
          <div className="form-section">
            <label className="form-label">Sélectionner un client :</label>
            <div className="select-container">
              <select 
                value={selectedClientId} 
                onChange={handleClientChange}
                className="client-select"
              >
                <option value="">-- Choisir un client --</option>
                <option value="1">CETIM</option>
                <option value="2">ENPC</option>
                <option value="3">SONACIM</option>
              </select>
              <div className="select-arrow"></div>
            </div>
          </div>
        </div>
        
        {selectedClient ? (
          <>
            <div className="info-card">
              <h2 className="card-title">Informations Client</h2>
              
              <div className="client-info-grid">
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
                  <label className="form-label">Sigle :</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={selectedClient.sigle} 
                    readOnly 
                  />
                </div>
              </div>
            </div>
            
            <div className="info-card">
              <h2 className="card-title">Tableau des Essais</h2>
              
              <div className="table-container">
                <table className="essais-table">
                  <thead>
                    <tr>
                      <th>Type Ciment</th>
                      <th>Produit Ciment</th>
                      <th>Méthode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClient.essais.map((essai, index) => (
                      <tr key={index}>
                        <td>
                          <input type="text" value={essai.type_ciment} readOnly />
                        </td>
                        <td>
                          <input type="text" value={essai.produit_ciment} readOnly />
                        </td>
                        <td>
                          <input type="text" value={essai.methode} readOnly />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="select-client-message">
            <i className="fas fa-arrow-up"></i>
            <p>Veuillez sélectionner un client pour afficher ses informations</p>
          </div>
        )}
        
        {validationMessage && (
          <div className={`validation-message ${validationMessage.includes('✅') ? 'success' : 'error'}`}>
            {validationMessage}
          </div>
        )}
        
        <div className="button-group">
          <button className="primary-btn">
            <i className="fas fa-check-circle"></i> Enregistrer les paramètres
          </button>
          
          <button className="validate-btn" onClick={handleValidate}>
            <i className="fas fa-check-double"></i> Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParametreEntreprise;