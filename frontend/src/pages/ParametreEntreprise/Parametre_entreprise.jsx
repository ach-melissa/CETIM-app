import React, { useState } from 'react';
import Header from "../../header/Header";
import './parametre_entreprise.css';

const ParametreEntreprise = () => {
  const [photo, setPhoto] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientsData] = useState({
    '1': {
      nom_raison_sociale: 'Centre d\'Études et de Contrôle des Matériaux',
      adresse: 'Zone industrielle, Alger',
      essais: [
        { type_ciment: 'CEM I', produit_ciment: 'Ciment Portland', methode: 'EN196-1' },
        { type_ciment: 'CEM II', produit_ciment: 'Ciment Portland composé', methode: 'EN196-2' }
      ]
    },
    '2': {
      nom_raison_sociale: 'Entreprise Nationale des Produits de Construction',
      adresse: 'Rue des cimenteries, Oran',
      essais: [
        { type_ciment: 'CEM II', produit_ciment: 'CEM II/A-S', methode: 'EN196-2' }
      ]
    },
    '3': {
      nom_raison_sociale: 'Société Nationale des Ciments',
      adresse: 'Boumerdès, Algérie',
      essais: [
        { type_ciment: 'CEM IV', produit_ciment: 'Ciment pouzzolanique', methode: 'EN196-4' },
        { type_ciment: 'CEM III', produit_ciment: 'Ciment de haut fourneau', methode: 'EN196-5' }
      ]
    },
    '4': {
      nom_raison_sociale: 'Lafarge Cement Company',
      adresse: 'Zéralda, Alger',
      essais: [
        { type_ciment: 'CEM I', produit_ciment: 'Ciment Portland', methode: 'EN196-1' },
        { type_ciment: 'CEM V', produit_ciment: 'Ciment composé', methode: 'EN196-6' }
      ]
    },
    '5': {
      nom_raison_sociale: 'Holcim Algérie',
      adresse: 'Oran - Route d\'Arzew',
      essais: [
        { type_ciment: 'CEM II', produit_ciment: 'CEM II/B-M', methode: 'EN196-3' },
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
  };

  const selectedClient = selectedClientId ? clientsData[selectedClientId] : null;

  return (
    <div className="container">
      <Header />
      
      <div className="header">
        <h1><i className="fas fa-cogs"></i> Paramètres Entreprise</h1>
        <div className="header-actions">
          <button><i className="fas fa-save"></i> Sauvegarder</button>
          <button><i className="fas fa-print"></i> Imprimer</button>
          <button><i className="fas fa-question-circle"></i> Aide</button>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Informations Générales</h2>
        
        <div className="form-section">
          <label>Photo du client :</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {photo && <img src={photo} alt="Aperçu" className="preview" />}
        </div>
        
        <div className="form-section">
          <label>Sélectionner un client :</label>
          <select 
            className="input" 
            value={selectedClientId} 
            onChange={handleClientChange}
          >
            <option value="">-- Choisir un client --</option>
            <option value="1">CETIM</option>
            <option value="2">ENPC</option>
            <option value="3">SONACIM</option>
            <option value="4">LAFARGE</option>
            <option value="5">HOLCIM</option>
          </select>
        </div>
      </div>
      
      {selectedClient && (
        <>
          <div className="card">
            <h2 className="card-title">Informations Client</h2>
            
            <div className="client-info">
              <div className="form-section">
                <label>Nom / Resaux sociale :</label>
                <input 
                  className="input" 
                  type="text" 
                  value={selectedClient.nom_raison_sociale} 
                  readOnly 
                />
              </div>
              
              <div className="form-section">
                <label>Adresse :</label>
                <input 
                  className="input" 
                  type="text" 
                  value={selectedClient.adresse} 
                  readOnly 
                />
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="card-title">Tableau des Essais</h2>
            
            <table className="table">
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
                    <td><input type="text" value={essai.type_ciment} readOnly /></td>
                    <td><input type="text" value={essai.produit_ciment} readOnly /></td>
                    <td><input type="text" value={essai.methode} readOnly /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn-primary">
          <i className="fas fa-check-circle"></i> Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
};

export default ParametreEntreprise;