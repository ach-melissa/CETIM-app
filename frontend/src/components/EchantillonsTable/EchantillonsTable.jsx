import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"; 
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useData } from "../../context/DataContext";

function formatExcelDateTime(dateStr, timeStr) {
  let date = null;
  let time = null;

  if (dateStr) {
    if (typeof dateStr === "number") {
      // Excel serial date
      const excelDate = XLSX.SSF.parse_date_code(dateStr);
      if (excelDate) {
        const y = excelDate.y;
        const m = String(excelDate.m).padStart(2, "0");
        const d = String(excelDate.d).padStart(2, "0");
        date = `${y}-${m}-${d}`;
      }
    } else if (typeof dateStr === "string") {
      const parts = dateStr.split(/[\/-]/);
      if (parts.length === 3) {
        // ✅ Always interpret as JJ-MM-AAAA (French style)
        const [p1, p2, p3] = parts;
        const d = p1.padStart(2, "0");
        const m = p2.padStart(2, "0");
        const y = p3.length === 2 ? `20${p3}` : p3; // handle 2-digit years
        date = `${y}-${m}-${d}`;
      }
    }
  }

  if (timeStr) {
    if (typeof timeStr === "number") {
      const totalSeconds = Math.round(timeStr * 24 * 60 * 60);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      time = `${hours}:${minutes}:${seconds}`;
    } else {
      const t = String(timeStr).trim();
      time = t.length === 5 ? `${t}:00` : t;
    }
  }

  return { date, time };
}





const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  let d, m, y;

  // Cas YYYY-MM-DD (DB)
  if (dateString.includes("-")) {
    [y, m, d] = dateString.split("-");
  }

  // Cas DD/MM/YYYY (Excel)
  else if (dateString.includes("/")) {
    [d, m, y] = dateString.split("/");
  }

  return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
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
      produitDescription,
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
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [deleteMode, setDeleteMode] = useState("single"); // "single" or "range"
    const [selectedEditDate, setSelectedEditDate] = useState("");
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
        if (start) params.start = start;
        if (end) {
          const endDate = new Date(end);
          endDate.setDate(endDate.getDate() + 1);
          params.end = end;

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
          .then((data) => setProduits(data))
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
        console.log("Saved successfully:", response.data);
        alert("Data saved successfully!");
        setIsEditing(false);
        fetchRows(); // Refresh data
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error while saving data.");
      }
    };

    const handleDeleteByDate = async () => {
      if (deleteMode === "single" && !selectedDate) {
        alert("Veuillez saisir une date.");
        return;
      }

      if (deleteMode === "range" && (!selectedStartDate || !selectedEndDate)) {
        alert("Veuillez saisir une plage de dates.");
        return;
      }

      const startDateToDelete = deleteMode === "single" ? selectedDate : selectedStartDate;
      const endDateToDelete = deleteMode === "single" ? selectedDate : selectedEndDate;

      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer tous les échantillons du ${startDateToDelete} au ${endDateToDelete} ? Cette action est irréversible.`)) {
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/api/echantillons/delete-by-date", {
          client_id: clientId,
          client_type_ciment_id: clientTypeCimentId,
          start_date: startDateToDelete,
          end_date: endDateToDelete
        });

        if (response.data.success) {
          alert(`Échantillons du ${startDateToDelete} au ${endDateToDelete} supprimés avec succès !`);
          fetchRows(); // Refresh data
          setShowDeleteForm(false);
          setSelectedDate("");
          setSelectedStartDate("");
          setSelectedEndDate("");
        } else {
          alert("Erreur lors de la suppression des échantillons.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("Erreur lors de la suppression des échantillons.");
      }
    };

    const handleEditByDate = async () => {
      if (!selectedEditDate) {
        alert("Veuillez saisir une date.");
        return;
      }

      try {
        // Get samples for the selected date
        const response = await axios.get("http://localhost:5000/api/echantillons/by-date", {
          params: {
            client_id: clientId,
            client_type_ciment_id: clientTypeCimentId,
            date: selectedEditDate
          }
        });

        if (response.data.length === 0) {
          alert("Aucun échantillon trouvé pour cette date.");
          return;
        }

        // Update local state with the samples for editing
        setRows(response.data);
        setIsEditing(true);
        setShowEditForm(false);
      } catch (error) {
        console.error("Error fetching samples by date:", error);
        alert("Erreur lors de la récupération des échantillons.");
      }
    };

 const handleImportExcel = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.name.endsWith(".csv")) {
    reader.onload = (evt) => {
      const text = evt.target.result;
      
      // Parse CSV with proper semicolon delimiter
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return; // No data
      
      const headers = lines[0].split(';').map(h => h.trim());
      
      const jsonData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';');
        const row = {};
        
        headers.forEach((header, index) => {
          let value = values[index] ? values[index].trim() : '';
          
          // Handle French number format (comma as decimal separator)
          if (value && !isNaN(value.replace(',', '.')) && value !== '') {
            value = parseFloat(value.replace(',', '.'));
          }
          
          row[header] = value;
        });
        
        if (Object.keys(row).length > 0) {
          jsonData.push(row);
        }
      }

      // ✅ Fix date parsing for CSV files
      const parsedData = jsonData.map((row) => {
        // Handle French date format DD/MM/YYYY
        let date = null;
        if (row["Date"]) {
          const dateStr = String(row["Date"]).trim();
          if (dateStr.includes("/")) {
            const [d, m, y] = dateStr.split("/");
            if (d && m && y) {
              // Ensure 4-digit year and proper formatting
              const year = y.length === 2 ? `20${y}` : y;
              date = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            }
          } else if (dateStr.includes("-")) {
            // Already in YYYY-MM-DD format (from previous imports)
            date = dateStr;
          }
        }

        // Handle time (ensure it's properly formatted)
        let time = row["heure"] || "10:00";
        if (time && time.length === 5) {
          time = `${time}:00`; // Add seconds if missing
        }

        // Convert numbers with commas to floats
        const normalize = (val) => {
          if (typeof val === "string" && val.includes(",")) {
            return parseFloat(val.replace(",", "."));
          }
          return val;
        };

        return {
          num_ech: row["N° ech"] || row["Ech"] || "",
          date_test: date,
          heure_test: time,
          rc2j: normalize(row["RC 2j (Mpa)"] || row["RC2J"]),
          rc7j: normalize(row["RC 7j (Mpa)"] || row["RC7J"]),
          rc28j: normalize(row["RC 28 j (Mpa)"] || row["RC28J"]),
          prise: normalize(row["Début prise(min)"] || row["Prise"]),
          stabilite: normalize(row["Stabilité (mm)"] || row["Stabilité"]),
          hydratation: normalize(row["Chaleur hydratation (J/g)"] || row["Hydratation"]),
          pfeu: normalize(row["Perte au feu (%)"] || row["P. Feu"]),
          r_insoluble: normalize(row["Résidu insoluble (%)"] || row["R. Insoluble"]),
          so3: normalize(row["SO3 (%)"] || row["SO3"]),
          chlorure: normalize(row["Cl (%)"] || row["Chlorure"]),
          c3a: normalize(row["C3A"]),
          ajout_percent: normalize(row["Taux d'Ajouts (%)"] || row["Taux Ajouts"]),
          type_ajout: row["Type ajout"] || row["Type Ajout"] || "",
        };
      });

      console.log("✅ Clean CSV data:", parsedData);
      setRows(parsedData);
    };
    reader.readAsText(file, 'ISO-8859-1');
  } else {
    // Excel processing (keep your existing code)
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const parsedData = jsonData.map((row) => {
        const { date, time } = formatExcelDateTime(row["Date"], row["Heure"]);
        return {
          ...row,
          date_test: date,
          heure_test: time,
        };
      });

      console.log("✅ Clean Excel data:", parsedData);
      setRows(parsedData);
    };
    reader.readAsArrayBuffer(file);
  }
};


    const exportToExcel = () => {
      const ws = XLSX.utils.json_to_sheet(filteredRows.map(row => ({
        ...row,
        date_test: formatDisplayDate(row.date_test)
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    const exportToCSV = () => {
      const ws = XLSX.utils.json_to_sheet(filteredRows.map(row => ({
        ...row,
        date_test: formatDisplayDate(row.date_test)
      })));
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
          ["Ech", "Date", "Heure", "RC2J", "RC7J", "RC28J", "Prise", "Stabilité", "Hydratation", "P. Feu", "R. Insoluble", "SO3", "Chlorure", "C3A", "Taux Ajouts", "Type Ajout"]
        ],
        body: filteredRows.map(row => [
          row.num_ech,
          formatDisplayDate(row.date_test),
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
          row.chlorure,
          row.c3a,
          row.ajout_percent,
          row.type_ajout
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

    return (
      <div>
        {/* Delete Form Modal */}
        {showDeleteForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '500px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Supprimer par date</h3>
                <button 
                  onClick={() => setShowDeleteForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label>
                  Mode de suppression:
                  <select 
                    value={deleteMode} 
                    onChange={(e) => setDeleteMode(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  >
                    <option value="single">Supprimer une seule date</option>
                    <option value="range">Supprimer une plage de dates</option>
                  </select>
                </label>
              </div>
              
              {deleteMode === "single" ? (
                <div style={{ marginBottom: "20px" }}>
                  <label>
                    Saisir la date à supprimer (YYYY-MM-DD):
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                  </label>
                </div>
              ) : (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <label style={{ flex: 1 }}>
                      Date de début:
                      <input 
                        type="date" 
                        value={selectedStartDate} 
                        onChange={(e) => setSelectedStartDate(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                    </label>
                    <label style={{ flex: 1 }}>
                      Date de fin:
                      <input 
                        type="date" 
                        value={selectedEndDate} 
                        onChange={(e) => setSelectedEndDate(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                    </label>
                  </div>
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button 
                  onClick={() => setShowDeleteForm(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteByDate}
                  disabled={deleteMode === "single" ? !selectedDate : (!selectedStartDate || !selectedEndDate)}
                  style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Confirmer suppression
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Modifier par date</h3>
                <button 
                  onClick={() => setShowEditForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: "20px" }}>
                <label>
                  Saisir la date à modifier (YYYY-MM-DD):
                  <input 
                    type="date" 
                    value={selectedEditDate} 
                    onChange={(e) => setSelectedEditDate(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </label>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button 
                  onClick={() => setShowEditForm(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleEditByDate}
                  disabled={!selectedEditDate}
                  style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Filter Modal */}
        {showDateFilter && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Filtrer par date</h3>
                <button 
                  onClick={() => setShowDateFilter(false)}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <label>
                  Du{" "}
                  <input 
                    type="date" 
                    value={start} 
                    onChange={(e) => setStart(e.target.value)} 
                    style={{ padding: '5px', width: '100%' }}
                  />
                </label>
                <label>
                  Au{" "}
                  <input 
                    type="date" 
                    value={end} 
                    onChange={(e) => setEnd(e.target.value)} 
                    style={{ padding: '5px', width: '100%' }}
                  />
                </label>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button 
                  onClick={handleClearDateFilter}
                  style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleApplyDateFilter}
                  disabled={loading || !clientId}
                  style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Traiter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Moved ABOVE the table */}
        <div style={{ marginBottom: "1rem", display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isEditing && (
            <>
              <button onClick={() => setShowEditForm(true)}>Modifier</button>
              <button onClick={() => setShowDeleteForm(true)}>Supprimer</button>
             <input
  type="file"
  accept=".xlsx,.xls,.csv"  // Add .csv here
  onChange={handleImportExcel}
  style={{ display: 'none' }}
  id="excel-import"
/>
              <button onClick={() => document.getElementById('excel-import').click()}>
                Importer Excel
              </button>
              <button onClick={exportToExcel}>Export Excel</button>
              <button onClick={exportToCSV}>Export CSV</button>
              <button onClick={exportToPDF}>Export PDF</button>
              <button onClick={handlePrint}>Imprimer</button>
            </>
          )}
          
          {isEditing && (
            <>
              <button onClick={handleSave}>Sauvegarder</button>
              <button onClick={() => {
                setIsEditing(false);
                fetchRows(); // Refresh to discard changes
              }}>Annuler</button>
            </>
          )}
        </div>

        {/* Date Filter Button */}
        {clientTypeCimentId && (
          <div style={{ marginBottom: "1rem" }}>
            <button 
              onClick={() => setShowDateFilter(true)}
              style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
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
          <h2>
            Période du {formatDisplayDate(start) || "......"} au {formatDisplayDate(end) || "..........."}{" "}
          </h2>
          {clientTypeCimentId && <h3>{produitDescription}</h3>}
        </div>

        <div className="table-container">
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                <th>Heure</th>
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
                <th>C3A</th>
                <th>Taux Ajouts</th>
                <th>Type Ajout</th>
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
                 <td>{row.date_test ? formatDisplayDate(row.date_test) : ""}</td>
                  <td>{row.heure_test}</td>
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
                  <td>
                    <input
                      type="number"
                      value={row.c3a || ""}
                      onChange={(e) => handleEdit(row.id, "c3a", e.target.value)}
                      disabled={!isEditing}
                    />
                  </td>
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
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={17}>Aucune donnée</td>
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
              <select
                value={newCement}
                onChange={(e) => setNewCement(e.target.value)}
              >
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