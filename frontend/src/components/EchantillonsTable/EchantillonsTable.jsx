import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"; 
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useData } from "../../context/DataContext";

const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return ""; // Ensure it's a valid date
  return excelDate; // Return the date as-is, assuming it's already in "YYYY-MM-DD" format
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
        setNewCement(""); // Clear the selected cement
        setShowNewTypeForm(false); // Close the form
        
        // Refresh the product list
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

    // Fetch cements on component mount
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
          rows, // The data to be saved
        });
        console.log("Saved successfully:", response.data);
        alert("Data saved successfully!");
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error while saving data.");
      }
    };

    const handleDelete = async () => {
      if (selected.size === 0) {
        alert("Veuillez sélectionner au moins un échantillon à supprimer.");
        return;
      }

      if (!window.confirm("Êtes-vous sûr de vouloir supprimer les échantillons sélectionnés ? Cette action est irréversible.")) {
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/api/echantillons/delete", {
          ids: Array.from(selected),
        });

        if (response.data.success) {
          alert("Échantillons supprimés avec succès !");
          fetchRows(); // Refresh the data
          setIsDeleting(false);
          setSelected(new Set());
        } else {
          alert("Erreur lors de la suppression des échantillons.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("Erreur lors de la suppression des échantillons.");
      }
    };

    const handleImportExcel = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (
        !window.confirm(
          "Êtes-vous sûr de vouloir importer ce fichier ? Les données seront ajoutées à la base de données."
        )
      ) {
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
          num_ech: row.num_ech || row["Ech"] || "",
          date_test: formatExcelDate(
            row.date_test || row["Date"] || row["Date test"] || row["date"] || ""
          ),
          rc2j: row.rc2j || row["RC2J"] || "",
          rc7j: row.rc7j || row["RC7J"] || "",
          rc28j: row.rc28j || row["RC28J"] || "",
          prise: row.prise || row["Prise"] || "",
          stabilite: row.stabilite || row["Stabilité"] || "",
          hydratation: row.hydratation || row["Hydratation"] || "",
          pfeu: row.pfeu || row["P. Feu"] || "",
          r_insoluble: row.r_insoluble || row["R. Insoluble"] || "",
          so3: row.so3 || row["SO3"] || "",
          chlorure: row.chlorure || row["Chlorure"] || "",
          c3a: row.c3a || row["C3A"] || "",
          ajout_percent: row.ajout_percent || row["Ajout %"] || "",
          type_ciment: row.type_ciment || row["Type Ciment"] || "", // ✅ include type
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
            produitId: clientTypeCimentId, // This is the product ID
            rows: formattedRows,
          })
          .then((res) => {
            console.log("✅ Imported to DB:", res.data);
            alert("Fichier importé avec succès !");
          })
          .catch((err) => {
            console.error("❌ Import error:", err);
            alert("Erreur lors de l'importation. Voir console.");
          });

        setSelected(new Set());
      };

      reader.readAsArrayBuffer(file);
    };

    // Define exportToExcel outside of handleImportExcel to make it accessible
    const exportToExcel = () => {
      // Convert the filtered rows to Excel format using XLSX
      const ws = XLSX.utils.json_to_sheet(filteredRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");

      // Save the file as an Excel file
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    // Define exportToCSV function to handle exporting data as CSV
    const exportToCSV = () => {
      // Convert the filtered rows to CSV format using XLSX
      const ws = XLSX.utils.json_to_sheet(filteredRows);
      const csv = XLSX.utils.sheet_to_csv(ws);

      // Create a blob from the CSV data and trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "echantillons.csv";
      link.click();
    };

    // Define exportToPDF function to handle exporting data as PDF
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

    // Define handlePrint function
    const handlePrint = () => {
      // Open the print dialog for the page content
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

        {/* Date Filter Button - Only show when produit is selected */}
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
            Période du {start || "......"} au {end || "..........."}{" "}
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
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={13}>Aucune donnée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 10 }}>
          {!isEditing && !isDeleting && (
            <>
              <button onClick={() => setIsEditing(true)}>Modifier</button>
              <button onClick={() => setIsDeleting(true)}>Supprimer</button>
              <button onClick={exportToExcel}>Export Excel</button>
              <button onClick={exportToCSV}>Export CSV</button>
              <button onClick={exportToPDF}>Export PDF</button>
              <button onClick={handlePrint}>Imprimer</button>
            </>
          )}
          
          {isEditing && (
            <>
              <button onClick={handleSave}>Sauvegarder</button>
              <button onClick={() => setIsEditing(false)}>Annuler</button>
            </>
          )}
          
          {isDeleting && (
            <>
              <button onClick={handleDelete} disabled={selected.size === 0}>
                Confirmer suppression
              </button>
              <button onClick={() => setIsDeleting(false)}>Annuler</button>
            </>
          )}
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
                  .filter((cement) => !produits.some((p) => p.id === cement.id)) // Filter out cements the client already has
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