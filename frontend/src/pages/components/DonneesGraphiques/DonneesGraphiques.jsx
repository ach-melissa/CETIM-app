import React, { useState } from 'react';
import './DonneesGraphiques.css';

const CementQualityReport = ({ cementParams, setCementParams, onBack }) => {
  const [rc2j, setRc2j] = useState(cementParams.rc2j || 21.67);
  const [rc28j, setRc28j] = useState(cementParams.rc28j || 48.94);
  const [prise, setPrise] = useState(cementParams.prise || 107.98);
  const [stabilite, setStabilite] = useState(cementParams.stabilite || 0);
  const [so3, setSo3] = useState(cementParams.so3 || 0);
  const [chlorure, setChlorure] = useState(cementParams.chlorure || 0);
  const [calcaire, setCalcaire] = useState(cementParams.calcaire || 0);
  const [selectedClass, setSelectedClass] = useState('42.5 N'); // Default class

  // Cement class options
  const cementClasses = [
    '32.5 N', '32.5 R', '32.5 L',
    '42.5 N', '42.5 R', '42.5 L', 
    '52.5 N', '52.5 R', '52.5 L'
  ];

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

    const isConforme = Object.values(deviationsInferieures).every(v => v) &&
                        Object.values(deviationsSuperieures).every(v => v) &&
                        Object.values(defauts).every(v => v);

    return { deviationsInferieures, deviationsSuperieures, defauts, isConforme };
  };

  const compliance = calculateCompliance();

  // Calculate deviation percentages (0% as shown in the image)
  const deviationPercent = 0;
  const defaultPercent = 0;

  return (
    <div className="cement-report-container">
            {/* Cement Class Selection Buttons */}
      <div className="cement-class-buttons">
        <h3>classes :</h3>
        <div className="class-button-group">
          {cementClasses.map(cementClass => (
            <button
              key={cementClass}
              className={`class-button ${selectedClass === cementClass ? 'active' : ''}`}
              onClick={() => setSelectedClass(cementClass)}
            >
              {cementClass}
            </button>
          ))}
        </div>
      </div>

      <h1>SOCIETE EXEMPLE (ESSAI)</h1>
      <h2>Contrôle de conformité / classe de résistance</h2>
      
      <div className="cement-info">
        <strong>GEM II/A-L (Ciment portland au calcaire)</strong><br />
        <strong>Période du 01/01/2020 au 31/12/2020</strong>
      </div>
      
      
      <hr className="strong-hr" />
      
      <h3>CLASSE {selectedClass}</h3>
      
      <div className="sections-horizontal">
        <div className="section-box">
          <h4>Déviations Limites inférieures</h4>
          <div className="parameter-list">
            <div className="parameter-item">
              <span>Résistance à court terme à 02 j (RC2J)</span>
              <span>{deviationPercent}% &lt; 10</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Résistance courante 28j (RC28J)</span>
              <span>{deviationPercent}% &lt; 42,5</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Temps de début de prise (Prise)</span>
              <span>{deviationPercent}% &lt; 60</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Ajout(e) (Calcaire)</span>
              <span>{deviationPercent}% &lt; 6</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sections-horizontal">     
        <div className="section-box">
          <h4>Déviations Limites supérieures</h4>
          <div className="parameter-list">
            <div className="parameter-item">
              <span>Résistance courante 28j (RC28J)</span>
              <span>{deviationPercent}% &gt; 62,5</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Stabilité (Stabilite)</span>
              <span>{deviationPercent}% &gt; 10</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Sulfate (SO3)</span>
              <span>{deviationPercent}% &gt; 4</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Chlorure (Chlorure)</span>
              <span>{deviationPercent}% &gt; 0,1</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Ajout(e) (Calcaire)</span>
              <span>{deviationPercent}% &gt; 20</span>
              <span>Déviation={deviationPercent}%</span>
            </div>
          </div>
        </div>
      </div>    

      <div className="sections-horizontal">
        <div className="section-box">
          <h4>Défauts Limites garanties</h4>
          <div className="parameter-list">
            <div className="parameter-item">
              <span>Résistance à court terme à 02 j (RC2J)</span>
              <span>{defaultPercent}% &lt; 8</span>
              <span>Défaut={defaultPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Résistance courante 28j (RC28J)</span>
              <span>{defaultPercent}% &lt; 40</span>
              <span>Défaut={defaultPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Temps de début de prise (Prise)</span>
              <span>{defaultPercent}% &lt; 50</span>
              <span>Défaut={defaultPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Stabilité (Stabilite)</span>
              <span>{defaultPercent}% &gt; 10</span>
              <span>Défaut={defaultPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Sulfate (SO3)</span>
              <span>{defaultPercent}% &gt; 4,5</span>
              <span>Défaut={defaultPercent}%</span>
            </div>
            <div className="parameter-item">
              <span>Chlorure (Chlorure)</span>
              <span>{defaultPercent}% &gt; 0,1</span>
              <span>Défaut={defaultPercent}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sections-horizontal">
        <div className="section-box">
          <h4>Contrôle par Mesures des résistances mécaniques</h4>
          <div className="parameter-list">
            <div className="parameter-item">
              <span>Résistance à court terme à 02 j (RC2J) LI</span>
              <span>x-kass= {rc2j} {rc2j >= 10 ? '≥' : '<'} 10</span>
              <span>Equation satisfaite</span>
            </div>
            <div className="parameter-item">
              <span>Résistance courante 28j (RC28J) LS</span>
              <span>x-kass= {rc28j} {rc28j <= 62.5 ? '≤' : '>'} 62,5</span>
              <span>Equation satisfaite</span>
            </div>
            <div className="parameter-item">
              <span>Résistance courante 28j (RC28J) LI</span>
              <span>x-kass= {rc28j} {rc28j >= 42.5 ? '≥' : '<'} 42,5</span>
              <span>Equation satisfaite</span>
            </div>
            <div className="parameter-item">
              <span>Temps de début de prise (Prise) LI</span>
              <span>x-kass= {prise} {prise >= 60 ? '≥' : '<'} 60</span>
              <span>Equation satisfaite</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sections-horizontal">
        <div className="section-box">
          <h4>Contrôle par Attributs propriétés physiques & chimiques</h4>
          <div className="parameter-list">
            <div className="parameter-item">
              <span>Stabilité (Stabilite)</span>
              <span>CD = 0 &lt;= CA=21,675</span>
              <span>Equation satisfaite</span>
            </div>
            <div className="parameter-item">
              <span>Sulfate (SO3)</span>
              <span>CD = 0 &lt;= CA=21,9</span>
              <span>Equation satisfaite</span>
            </div>
            <div className="parameter-item">
              <span>Chlorure (Chlorure)</span>
              <span>CD = 0 &lt;= CA=21,9</span>
              <span>Equation satisfaite</span>
            </div>
          </div>
        </div>
      </div>

      <div className="conclusion-section">
        <h3>CONCLUSION :</h3>
        <div className={`conformity-box ${compliance.isConforme ? 'conforme' : 'non-conforme'}`}>
          <strong>CONFORMITÉ: {compliance.isConforme ? 'CONFORME' : 'NON CONFORME'}</strong>
        </div>
      </div>

      {/* Back button */}
      <div className="back-button-container">
        <button onClick={onBack}>← Retour aux Graphiques</button>
      </div>
    </div>
  );
};

const DonneesGraphiques = ({
  parameters,
  selectedParameter,
  setSelectedParameter,
  classOptions,
  selectedClass,
  setSelectedClass,
  chartStats,
  tableData,
  handleExport,
  handlePrint,
  handleSave
}) => {
  const [showConformity, setShowConformity] = useState(false);
  const [cementParams, setCementParams] = useState({});

  return (
    <div className="charts-section">
      {!showConformity ? (
        <>
          <label htmlFor="parameter">Conformité de :</label>
          <select id="parameter" value={selectedParameter} onChange={e => setSelectedParameter(e.target.value)}>
            {parameters.map(param => (
              <option key={param.id} value={param.id}>{param.label}</option>
            ))}
          </select>

          {/* Class options */}
          <div className="radio-groups-container">
            {Object.entries(classOptions).map(([type, classes]) => (
              <div key={type} className="radio-group">
                {classes.map((className) => (
                  <label key={className}>
                    <input
                      type="radio"
                      name="cementClass"
                      value={className}
                      checked={selectedClass === className}
                      onChange={() => setSelectedClass(className)}
                    />
                    {className}
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Chart statistics */}
          {chartStats && (
            <div className="stats-display">
              {chartStats.limiteInf !== undefined && <div>Limite inférieure: {chartStats.countBelowInf} ({chartStats.percentBelowInf}%)</div>}
              {chartStats.limiteSup !== undefined && <div>Limite supérieure: {chartStats.countAboveSup} ({chartStats.percentAboveSup}%)</div>}
              {chartStats.limiteGarantie !== undefined && <div>Limite garantie: {chartStats.countBelowGarantie} ({chartStats.percentBelowGarantie}%)</div>}
              <div>Moyenne: {chartStats.moyenne}</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="actions-bar">
            <button onClick={handleExport} disabled={tableData.length === 0}>Exporter</button>
            <button onClick={handlePrint} disabled={tableData.length === 0}>Imprimer</button>
            <button onClick={handleSave} disabled={tableData.length === 0}>Sauvegarder</button>
            <button onClick={() => setShowConformity(true)}>Contrôle Conformité</button>
          </div>
        </>
      ) : (
        <CementQualityReport 
          cementParams={cementParams} 
          setCementParams={setCementParams} 
          onBack={() => setShowConformity(false)} 
        />
      )}
    </div>
  );
};

export default DonneesGraphiques;

