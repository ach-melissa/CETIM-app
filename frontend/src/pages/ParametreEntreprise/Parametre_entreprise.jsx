import React, { useState } from 'react';
import Header from "../../header/Header";

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
    setValidationMessage(''); // Effacer le message de validation quand on change de client
  };

  const handleValidate = () => {
    if (!selectedClientId) {
      setValidationMessage('Veuillez sélectionner un client avant de valider.');
      return;
    }
    
    const selectedClient = clientsData[selectedClientId];
    
    // Simuler l'envoi des données (remplacer par un appel API réel)
    console.log('Données validées pour le client:', selectedClient);
    
    // Afficher un message de confirmation
    setValidationMessage(`✅ Paramètres validés avec succès pour ${selectedClient.nom_raison_sociale}`);
    
    // Optionnel: Réinitialiser après un délai
    setTimeout(() => {
      setValidationMessage('');
    }, 5000);
  };

  const selectedClient = selectedClientId ? clientsData[selectedClientId] : null;

  // Styles inline
  const styles = {
    container: { 
      maxWidth: '1200px', 
      margin: '80px auto 30px',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    headerContent: { 
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', 
      color: 'white', 
      padding: '20px', 
      borderRadius: '10px', 
      marginBottom: '30px', 
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    headerTitle: { 
      fontSize: '28px', 
      fontWeight: '600' 
    },
    headerActions: { 
      display: 'flex', 
      gap: '15px' 
    },
    headerButton: { 
      background: 'rgba(255, 255, 255, 0.2)', 
      border: 'none', 
      color: 'white', 
      padding: '10px 15px', 
      borderRadius: '5px', 
      cursor: 'pointer', 
      transition: 'background 0.3s' 
    },
    card: { 
      background: 'white', 
      borderRadius: '10px', 
      padding: '25px', 
      marginBottom: '25px', 
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' 
    },
    cardTitle: { 
      fontSize: '20px', 
      fontWeight: '600', 
      color: '#2c3e50', 
      marginBottom: '20px', 
      paddingBottom: '10px', 
      borderBottom: '2px solid #f0f4f8' 
    },
    formSection: { 
      marginBottom: '25px' 
    },
    formLabel: { 
      display: 'block', 
      marginBottom: '8px', 
      fontWeight: '500', 
      color: '#2c3e50' 
    },
    input: { 
      width: '100%', 
      padding: '12px 15px', 
      border: '1px solid #ddd', 
      borderRadius: '6px', 
      fontSize: '16px', 
      transition: 'border 0.3s' 
    },
    preview: { 
      display: 'block', 
      maxWidth: '200px', 
      maxHeight: '200px', 
      marginTop: '15px', 
      borderRadius: '6px', 
      border: '1px solid #ddd', 
      padding: '5px' 
    },
    clientInfo: { 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '20px',
      marginTop: '20px'
    },
    table: { 
      width: '100%', 
      borderCollapse: 'collapse', 
      marginTop: '15px' 
    },
    tableHeader: { 
      backgroundColor: '#f8f9fa', 
      fontWeight: '600', 
      color: '#2c3e50', 
      border: '1px solid #e1e5eb', 
      padding: '15px', 
      textAlign: 'left' 
    },
    tableCell: { 
      border: '1px solid #e1e5eb', 
      padding: '15px', 
      textAlign: 'left' 
    },
    tableInput: { 
      width: '100%', 
      border: 'none', 
      color:' #020202ff',
      padding: '8px', 
      fontSize: '15px' 
    },
    primaryButton: { 
      background: 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)', 
      color: 'white', 
      border: 'none', 
      padding: '12px 25px', 
      borderRadius: '6px', 
      fontSize: '16px', 
      fontWeight: '500', 
      cursor: 'pointer', 
      transition: 'transform 0.2s, box-shadow 0.2s',
      marginTop: '30px'
    },
    validateButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      color: 'white', 
      border: 'none', 
      padding: '12px 25px', 
      borderRadius: '6px', 
      fontSize: '16px', 
      fontWeight: '500', 
      cursor: 'pointer', 
      transition: 'transform 0.2s, box-shadow 0.2s',
      marginLeft: '15px'
    },
    selectClientMessage: {
      textAlign: 'center',
      padding: '40px',
      color: '#666',
      fontStyle: 'italic',
      fontSize: '18px'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginTop: '30px'
    },
    validationMessage: {
      textAlign: 'center',
      padding: '15px',
      margin: '20px 0',
      borderRadius: '8px',
      fontWeight: '500'
    },
    successMessage: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    }
  };

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}><i className="fas fa-cogs"></i> Paramètres Entreprise</h1>
          <div style={styles.headerActions}>
            <button style={styles.headerButton}><i className="fas fa-save"></i> Sauvegarder</button>
            <button style={styles.headerButton}><i className="fas fa-print"></i> Imprimer</button>
            <button style={styles.headerButton}><i className="fas fa-question-circle"></i> Aide</button>
          </div>
        </div>
        
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Informations Générales</h2>
          
          <div style={styles.formSection}>
            <label style={styles.formLabel}>Photo du client :</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {photo && <img src={photo} alt="Aperçu" style={styles.preview} />}
          </div>
          
          <div style={styles.formSection}>
            <label style={styles.formLabel}>Sélectionner un client :</label>
            <select 
              style={styles.input} 
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
        
        {selectedClient ? (
          <>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Informations Client</h2>
              
              <div style={styles.clientInfo}>
                <div style={styles.formSection}>
                  <label style={styles.formLabel}>Nom / Raison sociale :</label>
                  <input 
                    style={styles.input} 
                    type="text" 
                    value={selectedClient.nom_raison_sociale} 
                    readOnly 
                  />
                </div>
                
                <div style={styles.formSection}>
                  <label style={styles.formLabel}>Adresse :</label>
                  <input 
                    style={styles.input} 
                    type="text" 
                    value={selectedClient.adresse} 
                    readOnly 
                  />
                </div>
              </div>
            </div>
            
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Tableau des Essais</h2>
              
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Type Ciment</th>
                    <th style={styles.tableHeader}>Produit Ciment</th>
                    <th style={styles.tableHeader}>Méthode</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClient.essais.map((essai, index) => (
                    <tr key={index}>
                      <td style={styles.tableCell}>
                        <input style={styles.tableInput} type="text" value={essai.type_ciment} readOnly />
                      </td>
                      <td style={styles.tableCell}>
                        <input style={styles.tableInput} type="text" value={essai.produit_ciment} readOnly />
                      </td>
                      <td style={styles.tableCell}>
                        <input style={styles.tableInput} type="text" value={essai.methode} readOnly />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={styles.selectClientMessage}>
            <i className="fas fa-arrow-up" style={{fontSize: '24px', marginBottom: '15px', display: 'block'}}></i>
            <p>Veuillez sélectionner un client pour afficher ses informations</p>
          </div>
        )}
        
        {/* Message de validation */}
        {validationMessage && (
          <div style={{
            ...styles.validationMessage,
            ...(validationMessage.includes('✅') ? styles.successMessage : styles.errorMessage)
          }}>
            {validationMessage}
          </div>
        )}
        
        <div style={styles.buttonGroup}>
          <button style={styles.primaryButton}>
            <i className="fas fa-check-circle"></i> Enregistrer les paramètres
          </button>
          
          <button style={styles.validateButton} onClick={handleValidate}>
            <i className="fas fa-check-double"></i> Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParametreEntreprise;