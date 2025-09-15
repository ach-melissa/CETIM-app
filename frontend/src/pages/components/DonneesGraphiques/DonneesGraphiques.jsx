import React from 'react';
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
  return (
    <div className="charts-section">
      {/* Chart controls */}
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

      <div className="chart-controls">
        <div className="chart-input">
          <p>Le Graphe :</p>
        </div>
        
        {/* Class selection - show for all parameters */}
        <div className="chart-input">
          <label>Classe:</label>
          <div className="radio-groups-container">
            {Object.entries(classOptions).map(([type, classes]) => (
              <div key={type} className="radio-group">
                <div className="radio-options">
                  {classes.map((className) => (
                    <div key={className} className="radio-item">
                      <input
                        type="radio"
                        id={className}
                        name="cementClass"
                        value={className}
                        checked={selectedClass === className}
                        onChange={() => setSelectedClass(className)}
                        className="radio-input"
                      />
                      <label htmlFor={className} className="radio-label">
                        {className}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show statistics for all parameters */}
        {chartStats && (
          <div className="stats-display">
            <div className="stats-column">
              <h5>Moyenne</h5>
              <div className="average-value">{chartStats.moyenne}</div>
              
              <h5>Minimum</h5>
              <div>{chartStats.min}</div>
              
              <h5>Maximum</h5>
              <div>{chartStats.max}</div>
              
              <h5>Nombre d'échantillons</h5>
              <div>{chartStats.count}</div>
            </div>
            
            {/* Show class-based statistics only for resistance parameters */}
            {chartStats.isResistance && (
              <div className="stats-column">
                <h5>Limite inférieure</h5>
                <div>{selectedClass} &lt;= {chartStats.limiteInf} MPa : {chartStats.countBelowInf} ({chartStats.percentBelowInf}%)</div>
                
                <h5>Limite supérieure</h5>
                <div>{selectedClass} &gt;= {chartStats.limiteSup} MPa : {chartStats.countAboveSup} ({chartStats.percentAboveSup}%)</div>
                
                <h5>Limite garantie</h5>
                <div>{selectedClass} &lt;= {chartStats.limiteGarantie} MPa : {chartStats.countBelowGarantie} ({chartStats.percentBelowGarantie}%)</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data actions */}
      <div className="actions-bar">
        <div className="file-actions">
          <button className="action-btn export-btn" onClick={handleExport} disabled={tableData.length === 0}>
            <i className="fas fa-file-export"></i> Exporter
          </button>
          <button className="action-btn print-btn" onClick={handlePrint} disabled={tableData.length === 0}>
            <i className="fas fa-print"></i> Imprimer
          </button>
          <button 
            className="action-btn save-btn" 
            onClick={handleSave}
            disabled={tableData.length === 0}
          >
            <i className="fas fa-save"></i> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonneesGraphiques;