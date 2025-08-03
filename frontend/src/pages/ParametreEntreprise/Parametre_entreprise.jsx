import React, { useState, useEffect } from 'react';
import './parametre_entreprise.css';
import axios from 'axios';
import Header from '../../header/Header';

export default function ParametreEntreprise() {
  const [photo, setPhoto] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState({
    nom_raison_sociale: '',
    adresse: '',
  });
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/clients')
      .then(res => setClients(res.data))
      .catch(err => console.error('Error fetching clients:', err));
  }, []);

  const handleFileChange = (e) => {
    setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);

    if (!clientId) {
      setSelectedClientInfo({ nom_raison_sociale: '', adresse: '' });
      setRows([]);
      return;
    }

    axios.get(`http://localhost:3001/api/clients/${clientId}`)
      .then(res => {
        const { client, parametres } = res.data;
        setSelectedClientInfo({
          nom_raison_sociale: client.nom_raison_sociale || '',
          adresse: client.adresse || '',
        });
        setRows(parametres || []);
      })
      .catch(err => console.error('Error fetching client details:', err));
  };

  return (
    <div className="container">
      <Header/> 
      
      <h1 className="title">Paramètres Entreprise </h1>

      <div className="form-section">
        <label>Photo du client :</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {photo && <img src={photo} alt="Client" className="preview" />}
      </div>

      <div className="form-section">
        <label>Sélectionner un client :</label>
        <select className="input" value={selectedClientId} onChange={handleClientChange}>
          <option value="">-- Choisir un client --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.sigle}
            </option>
          ))}
        </select>
      </div>

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
            {rows.map((row, index) => (
              <tr key={index}>
                <td><input type="text" value={row.type_ciment} readOnly /></td>
                <td><input type="text" value={row.produit_ciment} readOnly /></td>
                <td><input type="text" value={row.methode} readOnly /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}




