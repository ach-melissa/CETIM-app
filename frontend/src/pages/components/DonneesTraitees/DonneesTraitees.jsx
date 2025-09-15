import React from 'react';
import './DonneesTraitees.css';

const DonneesTraitees = ({
  tableData,
  clients,
  selectedClient,
  setSelectedClient,
  loading,
  typeFactices,
  selectedType,
  setSelectedType,
  produitsFiltres,
  selectedProduit,
  handleProduitChange,
  produitDescription,
  phase,
  setPhase,
  selectedRows,
  toggleRowSelection,
  toggleSelectAll,
  handleEdit,
  handleFileImport,
  handleExport,
  handlePrint,
  handleSave,
  handleDelete,
  handleClearAll
}) => {
  return (
    <div>
      {/* Selections only in Données Traitées tab */}
      <div className="inputs-layout">
        <div className="input-block">
          <label htmlFor="client">Choisir un client:</label>
          {loading ? (
            <div>Chargement des clients...</div>
          ) : (
            <select
              id="client"
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
            >
              <option value="">-- Sélectionner un client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.nom_raison_sociale}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="input-block">
          <label htmlFor="type">Type (CEM):</label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              handleProduitChange({ target: { value: "" } });
            }}
          >
            <option value="">-- Choisir type --</option>
            {typeFactices.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </select>

          <label htmlFor="produit">Produit:</label>
          <select
            id="produit"
            value={selectedProduit}
            onChange={handleProduitChange}
            disabled={!selectedType}
          >
            <option value="">-- Choisir produit --</option>
            {produitsFiltres.map((produit) => (
              <option key={produit.id} value={produit.id}>
                {produit.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="input-block">
          <label>Phase de production:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="production"
                checked={phase === 'production'}
                onChange={() => setPhase('production')}
                className="radio-input"
                disabled={!selectedProduit}
              />
              Situation courante
            </label>
          </div>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value='developpement'
                checked={phase === 'developpement'}
                onChange={() => setPhase('developpement')}
                className="radio-input"
                disabled={!selectedProduit}
              />
              Nouveau type produit
            </label>
          </div>
        </div>
      </div>

      {/* Data table */}
      <h1></h1>
      <h2>Données à traiter</h2>
      <h2>Périod du ...... au ...........</h2>
      <h3> {selectedProduit && ` ${produitsFiltres.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>
      
      {tableData.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === tableData.length && tableData.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Ech</th>
                <th>Date</th>
                <th>RC2J</th>
                <th>RC7J</th>
                <th>RC28J</th>
                <th>Prise</th>
                <th>Stabilité</th>
                <th>Hydratation</th>
                <th>P. Feu</th>
                <th>R. Insoluble</th>
                <th>SO3</th>
                <th>Chlorure</th>
                {/* Show C3A column only for CEM I */}
                {selectedType && selectedType === "1" && (
                  <th>C3A</th>
                )}
                {/* Show additional columns only for CEM II, III, IV, V */}
                {selectedType && selectedType !== "1" && (
                  <th>Ajout(Type Ajout) %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                  <td>{row.num_ech}</td>
                  <td>{row.date}</td>
                  <td>
                    <input
                      type="number"
                      value={row.rc2j || ''}
                      onChange={(e) => handleEdit(row.id, 'rc2j', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.rc7j || ''}
                      onChange={(e) => handleEdit(row.id, 'rc7j', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.rc28j || ''}
                      onChange={(e) => handleEdit(row.id, 'rc28j', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.prise || ''}
                      onChange={(e) => handleEdit(row.id, 'prise', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.stabilite || ''}
                      onChange={(e) => handleEdit(row.id, 'stabilite', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.hydratation || ''}
                      onChange={(e) => handleEdit(row.id, 'hydratation', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.pfeu || ''}
                      onChange={(e) => handleEdit(row.id, 'pfeu', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.r_insoluble || ''}
                      onChange={(e) => handleEdit(row.id, 'r_insoluble', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.so3 || ''}
                      onChange={(e) => handleEdit(row.id, 'so3', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.chlorure || ''}
                      onChange={(e) => handleEdit(row.id, 'chlorure', e.target.value)}
                      className="editable-cell"
                    />
                  </td>
                  {/* Show C3A column only for CEM I */}
                  {selectedType && selectedType === "1" && (
                    <td>
                      <input
                        type="number"
                        value={row.c3a || ''}
                        onChange={(e) => handleEdit(row.id, 'c3a', e.target.value)}
                        className="editable-cell"
                      />
                    </td>
                  )}
                  {/* Show additional columns only for CEM II, III, IV, V */}
                  {selectedType && selectedType !== "1" && (
                    <td>
                      <input
                        type="number"
                        value={row.ajout_percent || ''}
                        onChange={(e) => handleEdit(row.id, 'ajout_percent', e.target.value)}
                        className="editable-cell"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">
          {selectedClient && selectedProduit && phase ? 
            "Aucune donnée disponible pour ces critères." : 
            "Veuillez sélectionner un client, un produit et une phase pour afficher les données."}
        </p>
      )}

      {/* Data actions */}
      <div className="actions-bar">
        <div className="file-actions">
          <label htmlFor="file-import" className="action-btn import-btn">
            <i className="fas fa-file-import"></i> Importer Excel
          </label>
          <input
            id="file-import"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />

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
          <button 
            className="action-btn delete-btn" 
            onClick={handleDelete}
            disabled={selectedRows.length === 0}
          >
            <i className="fas fa-trash"></i> Supprimer ({selectedRows.length})
          </button>
          <button 
            className="action-btn clear-btn" 
            onClick={handleClearAll}
            disabled={tableData.length === 0}
          >
            <i className="fas fa-broom"></i> Tout effacer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonneesTraitees;