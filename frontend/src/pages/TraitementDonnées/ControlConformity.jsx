 import React, { useState } from 'react';

const CementQualityReport = () => {
  // State for input values
  const [rc2j, setRc2j] = useState(21.67);
  const [rc28j, setRc28j] = useState(48.94);
  const [prise, setPrise] = useState(107.98);
  const [stabilite, setStabilite] = useState(0);
  const [so3, setSo3] = useState(0);
  const [chlorure, setChlorure] = useState(0);
  const [calcaire, setCalcaire] = useState(0);

  // Calculate compliance status
  const calculateCompliance = () => {
    const deviationsInferieures = {
      rc2j: rc2j >= 10,
      rc28j: rc28j >= 42.5,
      prise: prise >= 60,
      calcaire: calcaire <= 20
    };

    const deviationsSuperieures = {
      rc28j: rc28j <= 62.5,
      stabilite: stabilite <= 10,
      so3: so3 <= 4,
      chlorure: chlorure <= 0.1,
      calcaire: calcaire <= 20
    };

    const defauts = {
      rc2j: rc2j >= 8,
      rc28j: rc28j >= 40,
      prise: prise >= 50,
      stabilite: stabilite <= 10,
      so3: so3 <= 4.5,
      chlorure: chlorure <= 0.1
    };

    // Check if all conditions are met
    const isConforme = 
      Object.values(deviationsInferieures).every(v => v) &&
      Object.values(deviationsSuperieures).every(v => v) &&
      Object.values(defauts).every(v => v);

    return {
      deviationsInferieures,
      deviationsSuperieures,
      defauts,
      isConforme
    };
  };

  const compliance = calculateCompliance();

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      margin: 0, 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '5px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>SOCIETE EXEMPLE (ESSAI)</h1>
        
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Contrôle de conformité / classe de résistance
        </h2>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <strong>GEM II/A-L (Ciment portland au calcaire)</strong><br />
          <strong>Période du 01/01/2020 au 31/12/2020</strong>
        </div>
        
        <hr style={{ marginBottom: '30px' }} />
        
        <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>CLASSE 42,5 N</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ width: '48%', marginBottom: '20px' }}>
            <h4>Déviations Limites inférieures</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li>Résistance à court terme à 02 j (RC2J): {rc2j} MPa</li>
              <li>Résistance courante 28j (RC28J): {rc28j} MPa</li>
              <li>Temps de début de prise (Prise): {prise} min</li>
              <li>Ajout(e) (Calcaire): {calcaire} %</li>
            </ul>
          </div>
          
          <div style={{ width: '48%', marginBottom: '20px' }}>
            <h4>Déviations Limites supérieures</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li>Résistance courante 28j (RC28J): {rc28j} MPa</li>
              <li>Stabilité: {stabilite} mm</li>
              <li>Sulfate (SO3): {so3} %</li>
              <li>Chlorure: {chlorure} %</li>
              <li>Ajout(e) (Calcaire): {calcaire} %</li>
            </ul>
          </div>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <h4>Défauts Limites garanties</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li>Résistance à court terme à 02 j (RC2J): {rc2j} MPa</li>
            <li>Résistance courante 28j (RC28J): {rc28j} MPa</li>
            <li>Temps de début de prise (Prise): {prise} min</li>
            <li>Stabilité: {stabilite} mm</li>
            <li>Sulfate (SO3): {so3} %</li>
            <li>Chlorure: {chlorure} %</li>
          </ul>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ width: '48%', marginBottom: '20px' }}>
            <h4>Contrôle par Mesures des résistances mécaniques</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li>Résistance à court terme à 02 j (RC2J) LI: {rc2j} MPa</li>
              <li>Résistance courante 28j (RC28J) LS: {rc28j} MPa</li>
              <li>Résistance courante 28j (RC28J) LI: {rc28j} MPa</li>
              <li>Temps de début de prise (Prise) LI: {prise} min</li>
            </ul>
          </div>
          
          <div style={{ width: '48%', marginBottom: '20px' }}>
            <h4>Contrôle par Attributs propriétés physiques & chimiques</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li>Stabilité: {stabilite} mm</li>
              <li>Sulfate (SO3): {so3} %</li>
              <li>Chlorure: {chlorure} %</li>
            </ul>
          </div>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <h3>CONCLUSION :</h3>
          <div style={{ 
            textAlign: 'center', 
            padding: '10px', 
            backgroundColor: compliance.isConforme ? '#d4edda' : '#f8d7da',
            border: `1px solid ${compliance.isConforme ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <strong>CONFORMITÉ: {compliance.isConforme ? 'CONFORME' : 'NON CONFORME'}</strong>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ width: '48%', marginBottom: '20px' }}>
              <h5>Limites inférieures</h5>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>RC2J: {rc2j >= 10 ? '✓' : '✗'} ≥ 10 MPa</li>
                <li>RC28J: {rc28j >= 42.5 ? '✓' : '✗'} ≥ 42.5 MPa</li>
                <li>Prise: {prise >= 60 ? '✓' : '✗'} ≥ 60 min</li>
                <li>Calcaire: {calcaire <= 20 ? '✓' : '✗'} ≤ 20%</li>
              </ul>
            </div>
            
            <div style={{ width: '48%', marginBottom: '20px' }}>
              <h5>Limites supérieures</h5>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li>RC28J: {rc28j <= 62.5 ? '✓' : '✗'} ≤ 62.5 MPa</li>
                <li>Stabilité: {stabilite <= 10 ? '✓' : '✗'} ≤ 10 mm</li>
                <li>SO3: {so3 <= 4 ? '✓' : '✗'} ≤ 4%</li>
                <li>Chlorure: {chlorure <= 0.1 ? '✓' : '✗'} ≤ 0.1%</li>
                <li>Calcaire: {calcaire <= 20 ? '✓' : '✗'} ≤ 20%</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <h4>Équations de contrôle</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li>x-kass = {rc2j} {rc2j >= 10 ? '≥' : '<'} 10</li>
            <li>x-kass = {rc28j} {rc28j <= 62.5 ? '≤' : '>'} 62.5</li>
            <li>x-kass = {rc28j} {rc28j >= 42.5 ? '≥' : '<'} 42.5</li>
            <li>x-kass = {prise} {prise >= 60 ? '≥' : '<'} 60</li>
          </ul>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <h4>Paramètres de contrôle</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div>
              <label>RC2J (MPa): </label>
              <input 
                type="number" 
                value={rc2j} 
                onChange={(e) => setRc2j(parseFloat(e.target.value))} 
                step="0.01"
                style={{ width: '80px' }}
              />
            </div>
            <div>
              <label>RC28J (MPa): </label>
              <input 
                type="number" 
                value={rc28j} 
                onChange={(e) => setRc28j(parseFloat(e.target.value))} 
                step="0.01"
                style={{ width: '80px' }}
              />
            </div>
            <div>
              <label>Prise (min): </label>
              <input 
                type="number" 
                value={prise} 
                onChange={(e) => setPrise(parseFloat(e.target.value))} 
                step="0.01"
                style={{ width: '80px' }}
              />
            </div>
            <div>
              <label>Stabilité (mm): </label>
              <input 
                type="number" 
                value={stabilite} 
                onChange={(e) => setStabilite(parseFloat(e.target.value))} 
                step="0.1"
                style={{ width: '80px' }}
              />
            </div>
            <div>
              <label>SO3 (%): </label>
              <input 
                type="number" 
                value={so3} 
                onChange={(e) => setSo3(parseFloat(e.target.value))} 
                step="0.01"
                style={{ width: '80px' }}
              />
            </div>
            <div>
              <label>Chlorure (%): </label>
              <input 
                type="number" 
                value={chlorure} 
                onChange={(e) => setChlorure(parseFloat(e.target.value))} 
                step="0.01"
                style={{ width: '80px' }}
              />
            </div>
            <div>
              <label>Calcaire (%): </label>
              <input 
                type="number" 
                value={calcaire} 
                onChange={(e) => setCalcaire(parseFloat(e.target.value))} 
                step="0.1"
                style={{ width: '80px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CementQualityReport;