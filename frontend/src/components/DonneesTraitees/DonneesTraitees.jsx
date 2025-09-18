import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import './DonneesTraitees.css';

const DonneesTraitees = ({
  tableData,
  setTableData,
  clients,
  selectedClient,
  setSelectedClient,
  loading,
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
  handleExport,
  handlePrint,
  handleDelete,
  handleClearAll,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  const [filteredRows, setFilteredRows] = useState([]);

  // --- Handle Excel import ---
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Assign unique IDs for each row
      const dataWithId = data.map((row, index) => ({
        ...row,
        id: Date.now() + index
      }));

      // Update parent tableData
      setTableData(prev => [...prev, ...dataWithId]);

      alert("Fichier Excel importé avec succès !");
    };

    reader.readAsBinaryString(file);
  };

  // --- Filter tableData whenever tableData or date period changes ---
  useEffect(() => {
    if (!tableData || tableData.length === 0) {
      setFilteredRows([]);
      return;
    }

    const filtered = tableData.filter(row => {
      if (!startDate || !endDate) return true; // show all if no period
      const rowDate = new Date(row.date);
      return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
    });

    setFilteredRows(filtered);
  }, [tableData, startDate, endDate]);

  // --- Save selection ---
  const handleSauvegarder = () => {
    if (!selectedClient || !selectedProduit || !phase || !startDate || !endDate) {
      alert("Veuillez sélectionner un client, un produit, une phase et une période.");
      return;
    }

    const selection = {
      client: selectedClient,
      produit: selectedProduit,
      phase,
      startDate,
      endDate
    };

    localStorage.setItem("selection", JSON.stringify(selection));
    alert("Sélection sauvegardée !");
  };

  return (
    <div>
      {/* --- Filters --- */}
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
          <label>Période de traitement:</label>
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="date-input"
            />
            <span className="date-separator">au</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        <div className="input-block">
          <label htmlFor="produit">Produit:</label>
          <select
            id="produit"
            value={selectedProduit}
            onChange={handleProduitChange}
          >
            <option value="">-- Choisir produit --</option>
            {produitsFiltres.map((produit) => (
              <option key={produit.id} value={produit.id}>
                {produit.nom}
              </option>
            ))}
          </select>
          {produitDescription && (
            <div className="produit-description">
              <strong>Description:</strong> {produitDescription}
            </div>
          )}
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
                disabled={!selectedProduit}
              />
              Situation courante
            </label>
          </div>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type='radio'
                value='developpement'
                checked={phase === 'developpement'}
                onChange={() => setPhase('developpement')}
                disabled={!selectedProduit}
              />
              Nouveau type produit
            </label>
          </div>
        </div>
      </div>

      {/* --- Data Table --- */}
      <p><strong>{clients.find(c => c.id == selectedClient)?.nom_raison_sociale || 'Aucun'}</strong></p>
      <h2>Données à traiter</h2>
      <h2>Période du {startDate || '......'} au {endDate || '...........'}</h2>
      <h3>{selectedProduit && `${produitsFiltres.find(p => p.id == selectedProduit)?.nom}`} ({produitDescription})</h3>

      {filteredRows.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
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
                {selectedType === 1 && <th>C3A</th>}
                {selectedType && selectedType !== 1 && <th>Ajout (Type Ajout) %</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(row => (
                <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                  <td>
                    <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => toggleRowSelection(row.id)} />
                  </td>
                  <td>{row.num_ech}</td>
                  <td>{row.date}</td>
                  <td><input type="number" value={row.rc2j || ''} onChange={e => handleEdit(row.id, 'rc2j', e.target.value)} /></td>
                  <td><input type="number" value={row.rc7j || ''} onChange={e => handleEdit(row.id, 'rc7j', e.target.value)} /></td>
                  <td><input type="number" value={row.rc28j || ''} onChange={e => handleEdit(row.id, 'rc28j', e.target.value)} /></td>
                  <td><input type="text" value={row.prise || ''} onChange={e => handleEdit(row.id, 'prise', e.target.value)} /></td>
                  <td><input type="text" value={row.stabilite || ''} onChange={e => handleEdit(row.id, 'stabilite', e.target.value)} /></td>
                  <td><input type="text" value={row.hydratation || ''} onChange={e => handleEdit(row.id, 'hydratation', e.target.value)} /></td>
                  <td><input type="number" value={row.pfeu || ''} onChange={e => handleEdit(row.id, 'pfeu', e.target.value)} /></td>
                  <td><input type="number" value={row.r_insoluble || ''} onChange={e => handleEdit(row.id, 'r_insoluble', e.target.value)} /></td>
                  <td><input type="number" value={row.so3 || ''} onChange={e => handleEdit(row.id, 'so3', e.target.value)} /></td>
                  <td><input type="number" value={row.chlorure || ''} onChange={e => handleEdit(row.id, 'chlorure', e.target.value)} /></td>
                  {selectedType === 1 && <td><input type="number" value={row.c3a || ''} onChange={e => handleEdit(row.id, 'c3a', e.target.value)} /></td>}
                  {selectedType && selectedType !== 1 && <td><input type="number" value={row.ajout_percent || ''} onChange={e => handleEdit(row.id, 'ajout_percent', e.target.value)} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">
          {selectedClient && selectedProduit && phase
            ? "Aucune donnée disponible pour ces critères."
            : "Veuillez sélectionner un client, un produit et une phase pour afficher les données."}
        </p>
      )}

      {/* --- Actions --- */}
      <div className="actions-bar">
        <div className="file-actions">
          <input type="file" id="file-import" accept=".xlsx,.xls" onChange={handleFileImport} style={{ display: 'none' }} />
          <label htmlFor="file-import" className="action-btn import-btn">Importer Excel</label>
          <button className="action-btn export-btn" onClick={handleExport} disabled={filteredRows.length === 0}>Exporter</button>
          <button className="action-btn print-btn" onClick={handlePrint} disabled={tableData.length === 0}>Imprimer</button>
        </div>

        <div className="data-actions">
          <button className="action-btn save-btn" onClick={handleSauvegarder} disabled={filteredRows.length === 0}>Sauvegarder</button>
          <button className="action-btn delete-btn" onClick={handleDelete} disabled={selectedRows.length === 0}>Supprimer ({selectedRows.length})</button>
<button 
  className="action-btn clear-btn" 
  onClick={handleClearAll} 
  disabled={tableData.length === 0} // enable only if there is data
>
  Tout effacer
</button>

        </div>
      </div>
    </div>
  );
};

export default DonneesTraitees;


