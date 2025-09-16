import React from 'react';
import './DonneesStatistiques.css';


// Utility function to calculate stats
const calculateStats = (data, key) => {
  const values = data
    .map((row) => parseFloat(row[key]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) {
    return { count: 0, min: "-", max: "-", mean: "-", std: "-" };
  }

  const count = values.length;
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);
  const mean = (values.reduce((a, b) => a + b, 0) / count).toFixed(2);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
  const std = Math.sqrt(variance).toFixed(2);

  return { count, min, max, mean, std };
};



  // Helper function to get limits from mockDetails
const getLimitsByClass = (mockDetails, classe, key) => {
  const found = mockDetails[key]?.find(item => item.classe === classe);
  return {
    li: found?.resistance_min ?? "",
    ls: found?.resistance_max ?? "",
    lg: found?.garantie ?? "",
  };
};



const DonneesStatistiques = ({
  clients,
  selectedClient,
  selectedProduit,
  produits,
  produitDescription,
  selectedType,
  tableData,
  handleExport,
  handlePrint,
  handleSave,
}) => {
  // List of all parameters we want to analyze
  const parameters = [
    { key: "rc2j", label: "RC2J" },
    { key: "rc7j", label: "RC7J" },
    { key: "rc28j", label: "RC28J" },
    { key: "prise", label: "Prise" },
    { key: "stabilite", label: "Stabilité" },
    { key: "hydratation", label: "Hydratation" },
    { key: "pfeu", label: "P. Feu" },
    { key: "r_insoluble", label: "R. Insoluble" },
    { key: "so3", label: "SO3" },
    { key: "chlorure", label: "Chlorure" },
  ];

  if (selectedType === "1") {
    parameters.push({ key: "c3a", label: "C3A" });
  } else {
    parameters.push({ key: "ajout_percent", label: "Ajout (%)" });
  }

  // Calculate all stats for all parameters
  const allStats = parameters.reduce((acc, param) => {
    acc[param.key] = calculateStats(tableData, param.key);
    return acc;
  }, {});

  // Define the rows (metrics)
  const statRows = [
    { key: "count", label: "Nombre" },
    { key: "min", label: "Min" },
    { key: "max", label: "Max" },
    { key: "mean", label: "Moyenne" },
    { key: "std", label: "Écart type" },
  ];
  
  return (
    <div className="stats-section">
      <p><strong>{clients.find(c => c.id == selectedClient)?.nom_raison_sociale || 'Aucun'}</strong></p>    
      <h2>Données Statistiques</h2>
      <h3>{selectedProduit && ` ${produits.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>
      

      {tableData.length > 0 ? (
        <div>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Statistique</th>
                {parameters.map((param) => (
                  <th key={param.key}>{param.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  {parameters.map((param) => (
                    <td key={param.key}>{allStats[param.key][row.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Class sections outside the table */}
          <div className="class-section">
            <h4>CLASSE 32.5L</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 32.5N</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td></td><td>16.00</td><td>32.50</td><td>75.00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td>52.5</td><td></td><td>10.00</td><td></td><td></td><td></td><td>4.00</td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td></td><td>14.00</td><td>30.00</td><td>60.00</td><td>10.00</td><td></td><td></td><td></td><td>4.50</td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
          <div className="class-section">
            <h4>CLASSE 32.5R</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td>10.00</td><td> </td><td>32.50</td><td>75.00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td> </td><td> </td><td>52.50</td><td></td><td>10.00</td><td></td><td></td><td></td><td>4.00</td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td>8.00</td><td></td><td>30.00</td><td>60.00</td><td>10.00</td><td></td><td></td><td></td><td>4.50</td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 42.5L</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 42.5N</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td>10.00</td><td></td><td>42.50</td><td>60.00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td>62.50</td><td></td><td>10.00</td><td></td><td></td><td></td><td>4.00</td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td>8.00</td><td></td><td>40.00</td><td>50.00</td><td>10.00</td><td></td><td></td><td></td><td>4.50</td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 42.5R</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td>20.00</td><td></td><td>42.50</td><td>60.00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td>62.5</td><td></td><td>10.00</td><td></td><td></td><td></td><td></td><td>4.00</td><td>0.100</td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td>18.00</td><td></td><td>40.00</td><td>50.00</td><td>10.00</td><td></td><td></td><td></td><td>4.50</td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 52.5L</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 52.5N</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td>20.00</td><td>52.50</td><td>45.00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td></td><td></td><td>10.00</td><td></td><td></td><td></td><td>4.00</td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td>18.00</td><td></td><td>50.00</td><td>40.00</td><td>10.00</td><td></td><td></td><td></td><td>4.50</td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        <div className="class-section">
            <h4>CLASSE 52.5R</h4>
            <table className="stats-table">
              <tbody>
                <tr><td>Limite inférieure (LI)</td><td>30.00</td><td></td><td>52.50</td><td>45.00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>N &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LI</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite supérieure (LS)</td><td></td><td></td><td></td><td></td><td>10.00</td><td></td><td></td><td></td><td>4.00</td><td>0.100</td><td></td></tr>
                <tr><td>N &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &gt; LS</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>Limite garantie (LG)</td><td>28.00</td><td></td><td>50.00</td><td>40.00</td><td>10.00</td><td></td><td></td><td></td><td>4.50</td><td>0.100</td><td></td></tr>
                <tr><td>N &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td>% &lt; LG</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>


   

        </div>
      ) : (
        <p className="no-data">
          Veuillez d'abord sélectionner un client, un produit et une phase.
        </p>
      )}

      {/* Data actions */}
      <div className="actions-bar">
        <div className="file-actions">
          <button className="action-btn export-btn" onClick={handleExport} disabled={tableData.length === 0}>
            <i className="fas fa-file-export"></i> Exporter
          </button>
          <button className="action-btn print-btn" onClick={handlePrint} disabled={tableData.length === 0}>
            <i className="fas fa-print"></i> Imprimer
          </button>
        </div>
        
        <div className="data-actions">
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

export default DonneesStatistiques;