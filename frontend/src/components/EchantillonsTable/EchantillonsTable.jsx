import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"; 
import axios from "axios";
import "./EchantillonsTable.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useData } from "../../context/DataContext";

const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return "";
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  // Retourne YYYY-MM-DD en heure locale (pas UTC)
  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, "0");
  const day = String(date_info.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatExcelTime = (excelTime) => {
  if (!excelTime) return "";

  // If it's already a string like "14:30" or "14:30:00"
  if (typeof excelTime === "string") {
    const parts = excelTime.split(":");
    if (parts.length >= 2) {
      const hours = String(parts[0]).padStart(2, "0");
      const minutes = String(parts[1]).padStart(2, "0");
      const seconds = parts[2] ? String(parts[2]).padStart(2, "0") : "00";
      return `${hours}:${minutes}:${seconds}`;
    }
    return excelTime; // fallback
  }

  // If it's a number (Excel serial time)
  if (!isNaN(excelTime)) {
    const totalSeconds = Math.floor(excelTime * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return "";
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
      ajoutsData,
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
    const [deleteType, setDeleteType] = useState("single");
    const [editType, setEditType] = useState("single");
    const [rowsToEdit, setRowsToEdit] = useState([]);
    const { updateFilteredData } = useData();

    // Liste des produits qui nécessitent C3A
    const c3aProducts = ["CEM I-SR 0", "CEM I-SR 3", "CEM I-SR 5", "CEM IV/A-SR", "CEM IV/B-SR"];
    
    // Liste des produits qui nécessitent Ajout
    const ajoutProducts = [
      "CEM II/A-S", "CEM II/B-S", "CEM II/A-D", "CEM II/A-P", "CEM II/B-P",
      "CEM II/A-Q", "CEM II/B-Q", "CEM II/A-V", "CEM II/B-V",
      "CEM II/A-W", "CEM II/B-W", "CEM II/A-T", "CEM II/B-T",
      "CEM II/A-L", "CEM II/B-L", "CEM II/A-LL", "CEM II/B-LL",
      "CEM II/A-M", "CEM II/B-M"
    ];

    // Déterminer quelles colonnes afficher
    const showC3A =
      produitInfo &&
      (produitInfo.famille?.code === "CEM I" || c3aProducts.includes(produitInfo.nom));

    const showAjoutFields = produitInfo && ajoutProducts.includes(produitInfo.nom);

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
        const formattedData = (resp.data || []).map(item => ({
          ...item,
          date_test: item.date_test
            ? new Date(item.date_test).toLocaleDateString("fr-CA")
            : item.date_test,
          heure_test: item.heure_test || "",
        }));
        
        setRows(formattedData);
        setSelected(new Set());

        updateFilteredData(formattedData, start, end);
        if (onTableDataChange) {
          onTableDataChange(formattedData, start, end);
        }
      } catch (err) {
        console.error("Erreur fetch echantillons", err);
        setRows([]);
        updateFilteredData([], start, end);
        if (onTableDataChange) {
          onTableDataChange([], "", "");
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

    const handleEdit = (id, field, value) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    };

    const handleSave = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/echantillons/save", {
          rows: rowsToEdit.length > 0 ? rowsToEdit : rows,
        });
        alert("Données sauvegardées avec succès !");
        setIsEditing(false);
        setRowsToEdit([]);
        fetchRows();
      } catch (error) {
        console.error("Erreur sauvegarde:", error);
        alert("Erreur lors de la sauvegarde des données.");
      }
    };

    const handleDeleteByDate = async () => {
      if (deleteType === "single" && !deleteStartDate) {
        alert("Veuillez spécifier une date.");
        return;
      }

      if (deleteType === "range" && (!deleteStartDate || !deleteEndDate)) {
        alert("Veuillez spécifier les deux dates pour la période.");
        return;
      }

      if (!window.confirm("Êtes-vous sûr de vouloir supprimer les échantillons dans cette période ? Cette action est irréversible.")) {
        return;
      }

      try {
        const rowsToDelete = rows.filter(row => {
          const rowDate = new Date(row.date_test);
          const start = deleteStartDate ? new Date(deleteStartDate) : null;
          const end = deleteType === "single" ? start : (deleteEndDate ? new Date(deleteEndDate) : null);
          
          if (deleteType === "single" && start) {
            return rowDate.toDateString() === start.toDateString();
          } else if (deleteType === "range" && start && end) {
            return rowDate >= start && rowDate <= end;
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
      if (editType === "single" && !editStartDate) {
        alert("Veuillez spécifier une date.");
        return;
      }

      if (editType === "range" && (!editStartDate || !editEndDate)) {
        alert("Veuillez spécifier les deux dates pour la période.");
        return;
      }

      // Filter rows by date range for editing
      const filteredRowsToEdit = rows.filter(row => {
        const rowDate = new Date(row.date_test);
        const start = editStartDate ? new Date(editStartDate) : null;
        const end = editType === "single" ? start : (editEndDate ? new Date(editEndDate) : null);
        
        if (editType === "single" && start) {
          return rowDate.toDateString() === start.toDateString();
        } else if (editType === "range" && start && end) {
          return rowDate >= start && rowDate <= end;
        }
        return false;
      });

      if (filteredRowsToEdit.length === 0) {
        alert("Aucun échantillon trouvé dans la période spécifiée.");
        return;
      }

      // Set the rows to edit and enable editing mode
      setRowsToEdit(filteredRowsToEdit);
      setIsEditing(true);
      setShowEditForm(false);
      
      // Select the rows to edit
      const idsToEdit = filteredRowsToEdit.map(row => row.id);
      setSelected(new Set(idsToEdit));
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setRowsToEdit([]);
      setSelected(new Set());
      fetchRows(); // Refresh to get original data
    };

const handleImportExcel = (e) => {
  console.log("🔍 DEBUG IMPORT - Phase:", phase, "Type:", typeof phase);
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
      heure_test: formatExcelTime(row["Heure"] || row["Heure essai"] || row.heure_test || ""),
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
      ajout_percent: row["Taux d'Ajouts (%)"] || row["Taux Ajout"] || "",
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

    // ⭐⭐ CORRECTION : AJOUTER LA PHASE DANS L'IMPORT ⭐⭐
    console.log("🚀 Envoi import avec phase:", phase); // Debug
    axios
      .post("http://localhost:5000/api/echantillons/import", {
        clientId: clientId,
        produitId: clientTypeCimentId,
        phase: phase, // ⭐⭐ CE PARAMÈTRE ÉTAIT MANQUANT ⭐⭐
        rows: formattedRows,
      })
      .then((res) => {
        console.log("✅ Réponse import:", res.data); // Debug
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
      const dataToExport = rowsToEdit.length > 0 ? rowsToEdit : filteredRows;
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    const exportToPDF = () => {
      const dataToExport = rowsToEdit.length > 0 ? rowsToEdit : filteredRows;
      
      // Déterminer les colonnes à exporter en fonction du type de produit
      const headers = ["Ech", "Date", "Heure", "RC2J", "RC7J", "RC28J", "Prise", "Stabilité", "Hydratation", "P. Feu", "R. Insoluble", "SO3", "Chlorure"];
      
      if (showC3A) {
        headers.push("C3A");
      }
      
      if (showAjoutFields) {
        headers.push("Taux Ajout");
        headers.push("Type Ajout");
        headers.push("Description Ajout");
      }

      const doc = new jsPDF();
      doc.autoTable({
        head: [headers],
        body: dataToExport.map(row => {
          const baseRow = [
            row.num_ech,
            row.date_test,
            row.heure_test,
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
          ];
          
          if (showC3A) {
            baseRow.push(row.c3a);
          }
          
          if (showAjoutFields) {
            baseRow.push(row.ajout_percent);
            baseRow.push(row.type_ajout);
            baseRow.push(getAjoutDescription(row.type_ajout));
          }
          
          return baseRow;
        })
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

    // Use rowsToEdit when in editing mode, otherwise use filteredRows
    const displayRows = isEditing && rowsToEdit.length > 0 ? rowsToEdit : filteredRows;

    // Calculer le nombre de colonnes pour le colspan
    const colSpanCount = 13 + (showC3A ? 1 : 0) + (showAjoutFields ? 3 : 0);

    const getAjoutDescription = (codeAjout) => {
      if (!codeAjout || !ajoutsData) return "";

      // Découper en parties (ex: "S-L" → ["S","L"])
      const parts = codeAjout.split("-");

      // Remplacer chaque partie par sa description
      const descriptions = parts.map((part) => {
        const ajout = ajoutsData[part];
        return ajout ? ajout.description : part; // fallback au code brut
      });

      // Assembler
      return descriptions.join(" + ");
    };

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
                <div className="date-selection">
                  <label>
                    <input 
                      type="radio" 
                      name="deleteType" 
                      value="single" 
                      checked={deleteType === "single"}
                      onChange={(e) => setDeleteType(e.target.value)}
                    />
                    Une seule date
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="deleteType" 
                      value="range" 
                      checked={deleteType === "range"}
                      onChange={(e) => setDeleteType(e.target.value)}
                    />
                    Par période
                  </label>
                </div>
                <label>
                  Date {deleteType === "single" ? "" : "de début"}:
                  <input type="date" value={deleteStartDate} onChange={(e) => setDeleteStartDate(e.target.value)} />
                </label>
                {deleteType === "range" && (
                  <label>
                    Date de fin:
                    <input type="date" value={deleteEndDate} onChange={(e) => setDeleteEndDate(e.target.value)} />
                  </label>
                )}
                <p>Les échantillons correspondant à la sélection seront supprimés définitivement.</p>
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
                <div className="date-selection">
                  <label>
                    <input 
                      type="radio" 
                      name="editType" 
                      value="single" 
                      checked={editType === "single"}
                      onChange={(e) => setEditType(e.target.value)}
                    />
                    Une seule date
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="editType" 
                      value="range" 
                      checked={editType === "range"}
                      onChange={(e) => setEditType(e.target.value)}
                    />
                    Par période
                  </label>
                </div>
                <label>
                  Date {editType === "single" ? "" : "de début"}:
                  <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                </label>
                {editType === "range" && (
                  <label>
                    Date de fin:
                    <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                  </label>
                )}
                <p>Les échantillons correspondant à la sélection seront modifiables.</p>
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
                <div className="date-selection">
                  <label>
                    <input 
                      type="radio" 
                      name="filterType" 
                      value="single" 
                      defaultChecked 
                    />
                    Une seule date
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="filterType" 
                      value="range" 
                    />
                    Par période
                  </label>
                </div>
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
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                style={{ display: "none" }}
                id="import-excel"
              />
              <button onClick={() => document.getElementById("import-excel").click()}>
                Importer Excel
              </button>
              <button onClick={exportToExcel}>Export Excel</button>
              <button onClick={exportToPDF}>Export PDF</button>
              <button onClick={handlePrint}>Imprimer</button>
            </>
          ) : (
            <>
              <button onClick={handleSave}>Sauvegarder</button>
              <button onClick={handleCancelEdit}>Annuler</button>
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
          {produitInfo && (
            <>
              <h3>{produitInfo.description}</h3>
              <p><strong>Type: {produitInfo.nom}</strong></p>
            </>
          )}
          {isEditing && rowsToEdit.length > 0 && (
            <div style={{ backgroundColor: "#e6f7ff", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
              <strong>Mode édition :</strong> Vous modifiez {rowsToEdit.length} échantillon(s)
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
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
                {showAjoutFields && (
                  <>
                    <th>Taux Ajout</th>
                    <th>Type Ajout</th>
                    <th>Description Ajout</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.id}>
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
                    <>
                      <td>
                        <input
                          type="number"
                          value={row.ajout_percent || ""}
                          onChange={(e) => handleEdit(row.id, "ajout_percent", e.target.value)}
                          disabled={!isEditing}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.type_ajout || ""}
                          onChange={(e) => handleEdit(row.id, "type_ajout", e.target.value)}
                          disabled={!isEditing}
                        />
                      </td>
                      <td>{getAjoutDescription(row.type_ajout)}</td>
                    </>
                  )}
                </tr>
              ))}
              {displayRows.length === 0 && (
                <tr>
                  <td colSpan={colSpanCount}>Aucune donnée</td>
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