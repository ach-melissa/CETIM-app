import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../header/Header';
import './parametre_entreprise.css';

export default function ParametreEntreprise() {
  const [photo, setPhoto] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState({
    nom_raison_sociale: '',
    adresse: '',
    famillecement: '',
    typecement: '',
    methodeessai: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3001/api/clients')
      .then(res => {
        setClients(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching clients:', err);
        setError('Erreur lors du chargement des clients');
        setLoading(false);
      });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    setError('');

    if (!clientId) {
      setSelectedClientInfo({
        nom_raison_sociale: '',
        adresse: '',
        famillecement: '',
        typecement: '',
        methodeessai: ''
      });
      setRows([]);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:3001/api/clients/${clientId}`)
      .then(res => {
        const client = res.data;
        setSelectedClientInfo({
          nom_raison_sociale: client.nom_resaux_sociale || client.nom_raison_sociale || '',
          adresse: client.adresse || '',
          famillecement: client.famillecement || '',
          typecement: client.typecement || '',
          methodeessai: client.methodeessai || ''
        });
        
        // Si vous avez des paramètres supplémentaires, vous pouvez les traiter ici
        if (client.parametres) {
          setRows(client.parametres);
        } else {
          // Créer une ligne avec les données du client si aucun paramètre spécifique n'existe
          setRows([{
            type_ciment: client.typecement || '',
            produit_ciment: client.famillecement || '',
            methode: client.methodeessai || ''
          }]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching client details:', err);
        setError('Erreur lors du chargement des détails du client');
        setLoading(false);
      });
  };

  return (
    <div className="container">
      <Header /> 
      
      <h1 className="title">Paramètres Entreprise</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <label>Photo du client :</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {photo && <img src={photo} alt="Client" className="preview" />}
      </div>

      <div className="form-section">
        <label>Sélectionner un client :</label>
        <select className="input" value={selectedClientId} onChange={handleClientChange} disabled={loading}>
          <option value="">-- Choisir un client --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.sigle}
            </option>
          ))}
        </select>
        {loading && <div className="loading">Chargement...</div>}
      </div>

      {selectedClientId && (
        <>
          <div className="form-section">
            <label>Informations client :</label>
            <div className="form-group">
              <label>Nom / Raison sociale :</label>
              <input className="input" type="text" value={selectedClientInfo.nom_raison_sociale} readOnly />
            </div>
            <div className="form-group">
              <label>Adresse :</label>
              <input className="input" type="text" value={selectedClientInfo.adresse} readOnly />
            </div>
          </div>

          <div className="form-section">
            <label>Tableau des essais :</label>
            <table className="table">
              <thead>
                <tr>
                  <th>Type Ciment</th>
                  <th>Produit Ciment</th>
                  <th>Méthode</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr key={index}>
                      <td><input type="text" value={row.type_ciment || row.typecement || ''} readOnly /></td>
                      <td><input type="text" value={row.produit_ciment || row.famillecement || ''} readOnly /></td>
                      <td><input type="text" value={row.methode || row.methodeessai || ''} readOnly /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">Aucune donnée d'essai disponible</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}