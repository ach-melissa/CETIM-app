import React, { useState, useMemo } from 'react';
import './DonneesGraphiques.css';






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
  const [currentView, setCurrentView] = useState('main'); // 'main', 'conformity', 'table'
  const [cementParams, setCementParams] = useState({});
const [activeTab, setActiveTab] = useState('graphiques');


  return (
    <div className="charts-section">
      
      {currentView === 'main' && (
        <>
          <label htmlFor="parameter">Conformité de :</label>
          <select 
            id="parameter" 
            value={selectedParameter} 
            onChange={e => setSelectedParameter(e.target.value)}
          >
            {parameters.map(param => (
              <option key={param.id} value={param.id}>{param.label}</option>
            ))}
          </select>

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

          {chartStats && (
            <div className="stats-display">
              {chartStats.limiteInf !== undefined && <div>Limite inférieure: {chartStats.countBelowInf} ({chartStats.percentBelowInf}%)</div>}
              {chartStats.limiteSup !== undefined && <div>Limite supérieure: {chartStats.countAboveSup} ({chartStats.percentAboveSup}%)</div>}
              {chartStats.limiteGarantie !== undefined && <div>Limite garantie: {chartStats.countBelowGarantie} ({chartStats.percentBelowGarantie}%)</div>}
              <div>Moyenne: {chartStats.moyenne}</div>
            </div>
          )}

          <div className="actions-bar">
            <button onClick={handleExport} disabled={tableData.length === 0}>Exporter</button>
            <button onClick={handlePrint} disabled={tableData.length === 0}>Imprimer</button>
            <button onClick={handleSave} disabled={tableData.length === 0}>Sauvegarder</button> 
          </div>
        </>
      )}
      
    </div>
  );
};

export default DonneesGraphiques;