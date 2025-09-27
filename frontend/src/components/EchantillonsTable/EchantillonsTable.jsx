import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"; 
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useData } from "../../context/DataContext";

const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return "";
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400; 
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split("T")[0];
};

const EchantillonsTable = forwardRef(
  (
    {
      clientId,
      clientTypeCimentId,
      phase,
      selectedType,
      onTableDataChange,
      initialStart,
      initialEnd,
      produitInfo,
      clients = [],
      produits = [],
      hasData,
    },
    ref
  ) => {
    const [start, setStart] = useState(initialStart || "");
    const [end, setEnd] = useState(initialEnd || "");
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [showNewTypeForm, setShowNewTypeForm] = useState(false);
    const [newCement, setNewCement] = useState(null);
    const [cementList, setCementList] = useState([]);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteStartDate, setDeleteStartDate] = useState("");
    const [deleteEndDate, setDeleteEndDate] = useState("");
    const [editStartDate, setEditStartDate] = useState("");
    const [editEndDate, setEditEndDate] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const { updateFilteredData } = useData();

    const fetchRows = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const params = { client_id: clientId };

        if (clientTypeCimentId) {
          params.client_type_ciment_id = clientTypeCimentId;
        }

        if (phase) params.phase = phase;
        if (start) params.start = new Date(start).toISOString().split("T")[0];
        if (end) {
          const endDate = new Date(end);
          endDate.setDate(endDate.getDate() + 1);
          params.end = endDate.toISOString().split("T")[0];
        }

        const resp = await axios.get("http://localhost:5000/api/echantillons", { params });
        setRows(resp.data || []);
        setSelected(new Set());

        updateFilteredData(resp.data || [], start, end);
        if (onTableDataChange) {
          onTableDataChange(resp.data || [], start, end);
        }
      } catch (err) {
        console.error("Erreur fetch echantillons", err);
        setRows([]);
        updateFilteredData([], start, end);
        if (onTableDataChange) {
          onTableDataChange([], start, end);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchCements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/types_ciment");
        setCementList(response.data);
      } catch (err) {
        console.error("Erreur fetch cement types", err);
      }
    };

    const addCementForClient = async () => {
      if (!newCement) {
        alert("Veuillez sélectionner un ciment.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/client_types_ciment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
            typeCimentId: newCement,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Erreur lors de l'ajout du ciment: ${error.message}`);
          return;
        }

        alert("Ciment ajouté au client avec succès !");
        setNewCement("");
        setShowNewTypeForm(false);
        
        fetch(`http://localhost:5000/api/produits/${clientId}`)
          .then((res) => res.json())
          .then((data) => produits = data)
          .catch((err) => alert("Erreur lors du chargement des produits."));
        
      } catch (err) {
        console.error("Erreur ajout ciment:", err);
        alert("Erreur lors de l'ajout du ciment.");
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchRows,
    }));

    useEffect(() => {
      if (!clientId) {
        setRows([]);
        updateFilteredData([], "", "");
        if (onTableDataChange) {
          onTableDataChange([], "", "");
        }
        return;
      }
      fetchRows();
    }, [clientId, clientTypeCimentId, phase]);

    useEffect(() => {
      if (!selectedType) {
        setFilteredRows(rows);
      } else {
        setFilteredRows(rows.filter((r) => r.type_ciment === selectedType));
      }
    }, [rows, selectedType]);

    useEffect(() => {
      fetchCements();
    }, []);

    const toggleRow = (id) => {
      const s = new Set(selected);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      setSelected(s);
    };

    const toggleAll = () => {
      if (selected.size === filteredRows.length) {
        setSelected(new Set());
      } else {
        setSelected(new Set(filteredRows.map((r) => r.id)));
      }
    };

    const handleEdit = (id, field, value) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    };

    const handleSave = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/echantillons/save", {
          rows,
        });
        alert("Données sauvegardées avec succès !");
        setIsEditing(false);
        fetchRows();
      } catch (error) {
        console.error("Erreur sauvegarde:", error);
        alert("Erreur lors de la sauvegarde des données.");
      }
    };

    const handleDeleteByDate = async () => {
      if (!deleteStartDate && !deleteEndDate) {
        alert("Veuillez spécifier au moins une date.");
        return;
      }

      if (!window.confirm("Êtes-vous sûr de vouloir supprimer les échantillons dans cette période ? Cette action est irréversible.")) {
        return;
      }

      try {
        // Get IDs to delete based on date range
        const rowsToDelete = rows.filter(row => {
          const rowDate = new Date(row.date_test);
          const start = deleteStartDate ? new Date(deleteStartDate) : null;
          const end = deleteEndDate ? new Date(deleteEndDate) : null;
          
          if (start && end) {
            return rowDate >= start && rowDate <= end;
          } else if (start) {
            return rowDate >= start;
          } else if (end) {
            return rowDate <= end;
          }
          return false;
        });

        const idsToDelete = rowsToDelete.map(row => row.id);

        if (idsToDelete.length === 0) {
          alert("Aucun échantillon trouvé dans la période spécifiée.");
          return;
        }

        const response = await axios.post("http://localhost:5000/api/echantillons/delete", {
          ids: idsToDelete,
        });

        if (response.data.success) {
          alert(`${idsToDelete.length} échantillon(s) supprimé(s) avec succès !`);
          setShowDeleteForm(false);
          setDeleteStartDate("");
          setDeleteEndDate("");
          fetchRows();
        } else {
          alert("Erreur lors de la suppression des échantillons.");
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression des échantillons.");
      }
    };

    const handleEditByDate = async () => {
      if (!editStartDate && !editEndDate) {
        alert("Veuillez spécifier au moins une date.");
        return;
      }

      // Filter rows by date range for editing
      const rowsToEdit = rows.filter(row => {
        const rowDate = new Date(row.date_test);
        const start = editStartDate ? new Date(editStartDate) : null;
        const end = editEndDate ? new Date(editEndDate) : null;
        
        if (start && end) {
          return rowDate >= start && rowDate <= end;
        } else if (start) {
          return rowDate >= start;
        } else if (end) {
          return rowDate <= end;
        }
        return false;
      });

      if (rowsToEdit.length === 0) {
        alert("Aucun échantillon trouvé dans la période spécifiée.");
        return;
      }

      setIsEditing(true);
      setShowEditForm(false);
      setEditStartDate("");
      setEditEndDate("");
    };

    const handleImportExcel = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!window.confirm("Êtes-vous sûr de vouloir importer ce fichier ? Les données seront ajoutées à la base de données.")) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const formattedRows = jsonData.map((row, index) => ({
          id: Date.now() + index,
          num_ech: row["N° ech"] || row["Ech"] || "",
          date_test: formatExcelDate(row["Date"] || row.date_test || ""),
          rc2j: row["RC 2j (Mpa)"] || row["RC2J"] || "",
          rc7j: row["RC 7j (Mpa)"] || row["RC7J"] || "",
          rc28j: row["RC 28 j (Mpa)"] || row["RC28J"] || "",
          prise: row["Début prise(min)"] || "",
          stabilite: row["Stabilité (mm)"] || "",
          hydratation: row["Hydratation"] || "",
          pfeu: row["Perte au feu (%)"] || "",
          r_insoluble: row["Résidu insoluble (%)"] || "",
          so3: row["SO3 (%)"] || "",
          chlorure: row["Cl (%)"] || "",
          c3a: row["C3A"] || "",
          ajout_percent: row["Taux d'Ajouts (%)"] || "",
          type_ajout: row["Type ajout"] || "",
          source: row["SILO N°"] || "",
        }));

        setRows((prevRows) => {
          const updated = [...prevRows, ...formattedRows];
          updateFilteredData(updated, start, end);
          if (onTableDataChange) {
            onTableDataChange(updated, start, end);
          }
          return updated;
        });

        axios
          .post("http://localhost:5000/api/echantillons/import", {
            clientId: clientId,
            produitId: clientTypeCimentId,
            rows: formattedRows,
          })
          .then((res) => {
            alert("Fichier importé avec succès !");
            e.target.value = ""; // Reset file input
            fetchRows();
          })
          .catch((err) => {
            console.error("❌ Import error:", err);
            alert("Erreur lors de l'importation.");
          });

        setSelected(new Set());
      };

      reader.readAsArrayBuffer(file);
    };

    const exportToExcel = () => {
      const ws = XLSX.utils.json_to_sheet(filteredRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    const exportToCSV = () => {
      const ws = XLSX.utils.json_to_sheet(filteredRows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "echantillons.csv";
      link.click();
    };

    const exportToPDF = () => {
      const doc = new jsPDF();
      doc.autoTable({
        head: [
          ["Ech", "Date", "RC2J", "RC7J", "RC28J", "Prise", "Stabilité", "Hydratation", "P. Feu", "R. Insoluble", "SO3", "Chlorure"]
        ],
        body: filteredRows.map(row => [
          row.num_ech,
          row.date_test,
          row.rc2j,
          row.rc7j,
          row.rc28j,
          row.prise,
          row.stabilite,
          row.hydratation,
          row.pfeu,
          row.r_insoluble,
          row.so3,
          row.chlorure
        ])
      });
      doc.save("echantillons.pdf");
    };

    const handlePrint = () => {
      window.print();
    };

    const handleApplyDateFilter = () => {
      fetchRows();
      setShowDateFilter(false);
    };

    const handleClearDateFilter = () => {
      setStart("");
      setEnd("");
      fetchRows();
      setShowDateFilter(false);
    };

    // Determine which fields to show based on cement type
    const showC3A = produitInfo && produitInfo.nom && produitInfo.nom.includes("CEM I");
    const showAjoutFields = produitInfo && produitInfo.nom && !produitInfo.nom.includes("CEM I");

    return (
      <div>
        {/* Delete Form Modal */}
        {showDeleteForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Supprimer par date</h3>
                <button onClick={() => setShowDeleteForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <label>
                  Date de début:
                  <input type="date" value={deleteStartDate} onChange={(e) => setDeleteStartDate(e.target.value)} />
                </label>
                <label>
                  Date de fin:
                  <input type="date" value={deleteEndDate} onChange={(e) => setDeleteEndDate(e.target.value)} />
                </label>
                <p>Laissez un champ vide pour supprimer à partir de/ jusqu'à une date spécifique.</p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowDeleteForm(false)}>Annuler</button>
                <button onClick={handleDeleteByDate}>Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Modifier par date</h3>
                <button onClick={() => setShowEditForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <label>
                  Date de début:
                  <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                </label>
                <label>
                  Date de fin:
                  <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                </label>
                <p>Laissez un champ vide pour modifier à partir de/ jusqu'à une date spécifique.</p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowEditForm(false)}>Annuler</button>
                <button onClick={handleEditByDate}>Modifier</button>
              </div>
            </div>
          </div>
        )}

        {/* Date Filter Modal */}
        {showDateFilter && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Filtrer par date</h3>
                <button onClick={() => setShowDateFilter(false)}>×</button>
              </div>
              <div className="modal-body">
                <label>
                  Du:
                  <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </label>
                <label>
                  Au:
                  <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                </label>
              </div>
              <div className="modal-footer">
                <button onClick={handleClearDateFilter}>Annuler</button>
                <button onClick={handleApplyDateFilter}>Traiter</button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Above the table */}
        <div className="action-buttons-top">
          {!isEditing ? (
            <>
              <button onClick={() => setShowEditForm(true)}>Modifier</button>
              <button onClick={() => setShowDeleteForm(true)}>Supprimer</button>
              <button onClick={exportToExcel}>Export Excel</button>
              <button onClick={exportToCSV}>Export CSV</button>
              <button onClick={exportToPDF}>Export PDF</button>
              <button onClick={handlePrint}>Imprimer</button>
            </>
          ) : (
            <>
              <button onClick={handleSave}>Sauvegarder</button>
              <button onClick={() => setIsEditing(false)}>Annuler</button>
            </>
          )}
        </div>

        {/* Date Filter Button */}
        {clientTypeCimentId && (
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={() => setShowDateFilter(true)}>
              Commencer traitement
            </button>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>
              {clients.find((c) => c.id == clientId)?.nom_raison_sociale || "Aucun client"}
            </strong>
          </p>
          <h2>Données à traiter</h2>
          <h2>Période du {start || "......"} au {end || "..........."}</h2>
          {produitInfo && <h3>{produitInfo.description}</h3>}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={toggleAll}
                    checked={filteredRows.length > 0 && selected.size === filteredRows.length}
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
                {showC3A && <th>C3A</th>}
                {showAjoutFields && <th>Taux Ajout</th>}
                {showAjoutFields && <th>Type Ajout</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className={selected.has(row.id) ? "selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td>{row.num_ech}</td>
                  <td>{row.date_test}</td>
                  <td>
                    <input
                      type="number"
                      value={row.rc2j || ""}
                      onChange={(e) => handleEdit(row.id, "rc2j", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.rc7j || ""}
                      onChange={(e) => handleEdit(row.id, "rc7j", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.rc28j || ""}
                      onChange={(e) => handleEdit(row.id, "rc28j", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.prise || ""}
                      onChange={(e) => handleEdit(row.id, "prise", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.stabilite || ""}
                      onChange={(e) => handleEdit(row.id, "stabilite", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.hydratation || ""}
                      onChange={(e) => handleEdit(row.id, "hydratation", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.pfeu || ""}
                      onChange={(e) => handleEdit(row.id, "pfeu", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.r_insoluble || ""}
                      onChange={(e) => handleEdit(row.id, "r_insoluble", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.so3 || ""}
                      onChange={(e) => handleEdit(row.id, "so3", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.chlorure || ""}
                      onChange={(e) => handleEdit(row.id, "chlorure", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
                  {showC3A && (
                    <td>
                      <input
                        type="number"
                        value={row.c3a || ""}
                        onChange={(e) => handleEdit(row.id, "c3a", e.target.value)}
                        disabled={!isEditing}
                      />
                    </td>
                  )}
                  {showAjoutFields && (
                    <td>
                      <input
                        type="number"
                        value={row.ajout_percent || ""}
                        onChange={(e) => handleEdit(row.id, "ajout_percent", e.target.value)}
                        disabled={!isEditing}
                      />
                    </td>
                  )}
                  {showAjoutFields && (
                    <td>
                      <input
                        type="text"
                        value={row.type_ajout || ""}
                        onChange={(e) => handleEdit(row.id, "type_ajout", e.target.value)}
                        disabled={!isEditing}
                      />
                    </td>
                  )}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={13 + (showC3A ? 1 : 0) + (showAjoutFields ? 2 : 0)}>Aucune donnée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* New Cement Type Form */}
        {showNewTypeForm && (
          <div className="form-container">
            <h3>Ajouter un Nouveau Type de Ciment</h3>
            <label>
              Sélectionner le type de ciment:
              <select value={newCement} onChange={(e) => setNewCement(e.target.value)}>
                <option value="">-- Choisir ciment --</option>
                {cementList
                  .filter((cement) => !produits.some((p) => p.id === cement.id))
                  .map((cement) => (
                    <option key={cement.id} value={cement.id}>
                      {cement.nom}
                    </option>
                  ))}
              </select>
            </label>
            <button onClick={addCementForClient}>Ajouter</button>
            <button onClick={() => setShowNewTypeForm(false)}>Annuler</button>
          </div>
        )}
      </div>
    );
  }
);

export default EchantillonsTable;