import React, { useState } from 'react';
import Header from "../../header/Header";
import './ParametreEntreprise.css';

const ParametreEntreprise = () => {
  const [photo, setPhoto] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  
  // Add this state to fix the header issue
  const [tableData, setTableData] = useState([
    { id: 1, name: 'Service Commercial', value: 'Actif' },
    { id: 2, name: 'Service Client', value: 'Actif' },
    { id: 3, name: 'Service Technique', value: 'Inactif' }
  ]);
  
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

  const handlePrint = () => {
    if (tableData.length === 0) return;
    window.print();
  };

  const handleSave = () => {
    // Simulate save functionality
    alert('Paramètres sauvegardés avec succès!');
  };

  const handleHelp = () => {
    // Simulate help functionality
    alert('Aide: Cette page vous permet de configurer les paramètres de votre entreprise.');
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
            <button className="header-btn" onClick={handleSave}>
              <i className="fas fa-save"></i> Sauvegarder
            </button>
            <button className="action-btn print-btn" onClick={handlePrint} disabled={tableData.length === 0}>
              <i className="fas fa-print"></i> Imprimer
            </button>
            <button className="header-btn" onClick={handleHelp}>
              <i className="fas fa-question-circle"></i> Aide
            </button>
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

      <style jsx>{`
        .parametre-entreprise-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7f9;
          min-height: 100vh;
        }
        
        .parametre-entreprise-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .entreprise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #2c3e50 0%, #4a6491 100%);
          color: white;
          padding: 20px 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        
        .entreprise-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        
        .entreprise-header h1 i {
          margin-right: 15px;
          color: #42a5f5;
        }
        
        .header-actions {
          display: flex;
          gap: 15px;
        }
        
        .header-btn, .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .header-btn {
          background-color: #42a5f5;
          color: white;
        }
        
        .header-btn:hover {
          background-color: #2196f3;
          transform: translateY(-2px);
        }
        
        .print-btn {
          background-color: #66bb6a;
          color: white;
        }
        
        .print-btn:hover:not(:disabled) {
          background-color: #4caf50;
          transform: translateY(-2px);
        }
        
        .print-btn:disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
          transform: none;
        }
        
        .info-card {
          background-color: white;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }
        
        .card-title {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2c3e50;
          font-size: 22px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }
        
        .form-section {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #34495e;
        }
        
        .file-upload-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }
        
        .file-upload-btn {
          display: inline-block;
          background-color: #42a5f5;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .file-upload-btn:hover {
          background-color: #2196f3;
        }
        
        #file-upload {
          display: none;
        }
        
        .image-preview {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
          border: 2px dashed #ddd;
        }
        
        .select-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }
        
        .client-select {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background-color: white;
          font-size: 16px;
          appearance: none;
        }
        
        .select-arrow {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #555;
        }
        
        .client-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          background-color: #f9f9f9;
        }
        
        .table-container {
          overflow-x: auto;
          margin-top: 20px;
        }
        
        .essais-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .essais-table th {
          background-color: #f0f4f8;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #ddd;
        }
        
        .essais-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
        }
        
        .essais-table input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .select-client-message {
          text-align: center;
          padding: 40px;
          background-color: white;
          border-radius: 10px;
          margin-bottom: 25px;
          color: #7f8c8d;
        }
        
        .select-client-message i {
          font-size: 32px;
          margin-bottom: 15px;
          display: block;
          color: #bdc3c7;
        }
        
        .validation-message {
          padding: 15px 20px;
          border-radius: 6px;
          margin-bottom: 25px;
          font-weight: 500;
        }
        
        .validation-message.success {
          background-color: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        }
        
        .validation-message.error {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }
        
        .button-group {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
        }
        
        .primary-btn, .validate-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 25px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .primary-btn {
          background-color: #42a5f5;
          color: white;
        }
        
        .primary-btn:hover {
          background-color: #2196f3;
          transform: translateY(-2px);
        }
        
        .validate-btn {
          background-color: #66bb6a;
          color: white;
        }
        
        .validate-btn:hover {
          background-color: #4caf50;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .entreprise-header {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          
          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .client-info-grid {
            grid-template-columns: 1fr;
          }
          
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ParametreEntreprise;