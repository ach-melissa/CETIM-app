import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"; 
import axios from "axios";
import "./DonneesClients.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useData } from "../../context/DataContext";
import PDFExportService from "../ControleConformite/PDFExportService";

const formatExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return "";
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, "0");
  const day = String(date_info.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatExcelTime = (excelTime) => {
  if (!excelTime) return "";

  if (typeof excelTime === "string") {
    const parts = excelTime.split(":");
    if (parts.length >= 2) {
      const hours = String(parts[0]).padStart(2, "0");
      const minutes = String(parts[1]).padStart(2, "0");
      const seconds = parts[2] ? String(parts[2]).padStart(2, "0") : "00";
      return `${hours}:${minutes}:${seconds}`;
    }
    return excelTime;
  }

  if (!isNaN(excelTime)) {
    const totalSeconds = Math.floor(excelTime * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return "";
};

const DonneesClients = forwardRef(
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
      onStartTraitement,
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

    const showC3A = produitInfo && produitInfo.famille?.code === "CEM I";
    const showTauxAjout = produitInfo && produitInfo.famille?.code !== "CEM I";

    // Récupérer le nom du client
    const getClientName = () => {
      if (!clientId) return "Aucun client sélectionné";
      const client = clients.find(c => c.id == clientId);
      return client ? client.nom_raison_sociale : "Client non trouvé";
    };

    const fetchRows = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const params = { client_id: clientId };

        if (clientTypeCimentId) {
          params.client_type_ciment_id = clientTypeCimentId;
        }

        if (phase) params.phase = phase;
        // Remove date filtering from the API call to get all data
        const resp = await axios.get("http://localhost:5000/api/echantillons", { params });
        
        // DEBUG: Check what's in the response
        console.log("API Response:", resp.data);
        
        const formattedData = (resp.data || []).map(item => {
          console.log("Raw item heure_test:", {
            num_ech: item.num_ech,
            heure_test: item.heure_test,
            type: typeof item.heure_test
          });
          
          return {
            ...item,
            date_test: item.date_test
              ? new Date(item.date_test).toLocaleDateString("fr-CA")
              : item.date_test,
            heure_test: item.heure_test || "", // Ensure this is not null/undefined
          };
        });
        
        setRows(formattedData);
        setSelected(new Set());

        // Apply date filtering locally for internal use
        const locallyFilteredData = applyDateFilter(formattedData, start, end);
        setFilteredRows(locallyFilteredData);
        
        updateFilteredData(locallyFilteredData, start, end);
        if (onTableDataChange) {
          onTableDataChange(locallyFilteredData, start, end);
        }
      } catch (err) {
        console.error("Erreur fetch echantillons", err);
        setRows([]);
        setFilteredRows([]);
        updateFilteredData([], start, end);
        if (onTableDataChange) {
          onTableDataChange([], "", "");
        }
      } finally {
        setLoading(false);
      }
    };

    // Function to apply date filtering locally
    const applyDateFilter = (data, startDate, endDate) => {
      if (!startDate && !endDate) return data;
      
      return data.filter(item => {
        const itemDate = new Date(item.date_test);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          return itemDate >= start && itemDate <= end;
        } else if (start) {
          return itemDate >= start;
        } else if (end) {
          return itemDate <= end;
        }
        return true;
      });
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
        setFilteredRows([]);
        updateFilteredData([], "", "");
        if (onTableDataChange) {
          onTableDataChange([], "", "");
        }
        return;
      }
      fetchRows();
    }, [clientId, clientTypeCimentId, phase]);

    useEffect(() => {
      // Apply both type filtering and date filtering locally
      let result = rows;
      
      // Apply type filtering
      if (selectedType) {
        result = result.filter((r) => r.type_ciment === selectedType);
      }
      
      // Apply date filtering locally
      result = applyDateFilter(result, start, end);
      
      setFilteredRows(result);
      
      // Update context with filtered data for export/processing
      updateFilteredData(result, start, end);
      if (onTableDataChange) {
        onTableDataChange(result, start, end);
      }
    }, [rows, selectedType, start, end]);

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

      setRowsToEdit(filteredRowsToEdit);
      setIsEditing(true);
      setShowEditForm(false);
      
      const idsToEdit = filteredRowsToEdit.map(row => row.id);
      setSelected(new Set(idsToEdit));
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setRowsToEdit([]);
      setSelected(new Set());
      fetchRows();
    };

    const handleImportExcel = (e) => {
      console.log("🔍 DEBUG IMPORT - Phase:", phase, "Type:", typeof phase);
      const file = e.target.files[0];
      if (!file) return;

      if (!window.confirm("Êtes-vous sûr de vouloir importer ce fichier ? Les données seront ajoutées à la base de données.")) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (evt) => { // Changez en async
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

        try {
          console.log("🚀 Envoi import avec phase:", phase);
          
          // 1. Envoyer les données à l'API
          const response = await axios.post("http://localhost:5000/api/echantillons/import", {
            clientId: clientId,
            produitId: clientTypeCimentId,
            phase: phase,
            rows: formattedRows,
          });

          console.log("✅ Réponse import:", response.data);
          
          // 2. Rafraîchir IMMÉDIATEMENT les données après l'import réussi
          await fetchRows(); // Attendre le rafraîchissement
          
          // 3. Réinitialiser le fichier input
          e.target.value = "";
          
          alert("Fichier importé avec succès ! Les données sont maintenant affichées.");
          
        } catch (err) {
          console.error("❌ Import error:", err);
          alert("Erreur lors de l'importation.");
        }
      };

      reader.readAsArrayBuffer(file);
    };

    const exportToExcel = () => {
      // Use filteredRows for export (internal filtered data)
      const dataToExport = rowsToEdit.length > 0 ? rowsToEdit : filteredRows;
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    const exportToPDF = async () => {
      // Use filteredRows for export (internal filtered data)
      const dataToExport = rowsToEdit.length > 0 ? rowsToEdit : filteredRows;
      
      if (dataToExport.length === 0) {
        alert("Aucune donnée à exporter !");
        return;
      }
      
      console.log("Exporting to PDF:", dataToExport);
      
      try {
        const { jsPDF } = await import('jspdf');
        
        // Remove "Heure" from headers
        const headers = ["Ech", "Date", "RC2J", "RC7J", "RC28J", "Prise", "Stabilité", "Hydratation", "P. Feu", "R. Insoluble", "SO3", "Chlorure"];
        
        if (showC3A) {
          headers.push("C3A");
        }
        
        if (showTauxAjout) {
          headers.push("Taux Ajout");
        }

        // Préparer les données pour le PDF
        const pdfData = dataToExport.map(row => {
          console.log(`Row ${row.num_ech}:`, {
            date_test: row.date_test,
            isEdited: rowsToEdit.some(editedRow => editedRow.num_ech === row.num_ech)
          });

          const baseRow = [
            row.num_ech || "",
            row.date_test || "",
            // Removed heure_test column completely
            row.rc2j || "",
            row.rc7j || "",
            row.rc28j || "",
            row.prise || "",
            row.stabilite || "",
            row.hydratation || "",
            row.pfeu || "",
            row.r_insoluble || "",
            row.so3 || "",
            row.chlorure || ""
          ];
          
          if (showC3A) {
            baseRow.push(row.c3a || "");
          }
          
          if (showTauxAjout) {
            baseRow.push(row.ajout_percent || "");
          }
          
          return baseRow;
        });

        const doc = new jsPDF();

        // Add title and header information
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Traitement Données", 14, 15);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        const clientName = getClientName();
        doc.text(`Client: ${clientName}`, 14, 25);
        doc.text(`Période: du ${start || "......"} au ${end || "..........."}`, 14, 32);
        
        if (produitInfo?.description) {
          doc.text(`Produit: ${produitInfo.description}`, 14, 39);
        }

        // Manual table creation
        const startY = 50;
        const margin = 14;
        const pageWidth = doc.internal.pageSize.width;
        const availableWidth = pageWidth - 2 * margin;
        const colCount = headers.length;
        const colWidth = availableWidth / colCount;
        
        let currentY = startY;
        
        // Table header
        doc.setFillColor(41, 128, 185);
        doc.rect(margin, currentY - 5, availableWidth, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        
        headers.forEach((header, index) => {
          const x = margin + (index * colWidth);
          const displayHeader = header.length > 8 ? header.substring(0, 6) + '...' : header;
          doc.text(displayHeader, x + 2, currentY);
        });
        
        currentY += 4;
        
        // Table rows
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        
        pdfData.forEach((row, rowIndex) => {
          if (rowIndex % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, currentY - 3, availableWidth, 4, 'F');
          }
          
          row.forEach((cell, cellIndex) => {
            const x = margin + (cellIndex * colWidth);
            const displayValue = String(cell || "").length > 10 ? 
              String(cell || "").substring(0, 8) + '...' : 
              String(cell || "");
            doc.text(displayValue, x + 1, currentY);
          });
          
          currentY += 4;
          
          if (currentY > doc.internal.pageSize.height - 20) {
            doc.addPage();
            currentY = 20;
            
            doc.setFillColor(41, 128, 185);
            doc.rect(margin, currentY - 5, availableWidth, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            
            headers.forEach((header, index) => {
              const x = margin + (index * colWidth);
              const displayHeader = header.length > 8 ? header.substring(0, 6) + '...' : header;
              doc.text(displayHeader, x + 2, currentY);
            });
            
            currentY += 4;
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
          }
        });

        doc.save("traitement_donnees.pdf");
        
        console.log("PDF exported successfully with title: Traitement Données");
        console.log("PDF data without time column:", pdfData);
      } catch (error) {
        console.error("Error exporting PDF:", error);
        alert("Erreur lors de l'export PDF: " + error.message);
      }
    };

    const handlePrint = () => {
      window.print();
    };

    const handleApplyDateFilter = () => {
      // Apply date filtering locally without refetching
      const locallyFilteredData = applyDateFilter(rows, start, end);
      setFilteredRows(locallyFilteredData);
      
      // Update context with filtered data for export/processing
      updateFilteredData(locallyFilteredData, start, end);
      if (onTableDataChange) {
        onTableDataChange(locallyFilteredData, start, end);
      }
      
      setShowDateFilter(false);
    };

    const handleClearDateFilter = () => {
      setStart("");
      setEnd("");
      // Reset filteredRows to show all data
      setFilteredRows(rows);
      
      // Update context with all data
      updateFilteredData(rows, "", "");
      if (onTableDataChange) {
        onTableDataChange(rows, "", "");
      }
      
      setShowDateFilter(false);
    };

    // Always display all rows (no filtering for display), but use filteredRows internally for exports
    const displayRows = isEditing && rowsToEdit.length > 0 ? rowsToEdit : rows;

    // Calculer le nombre de colonnes pour le colspan (without Heure column for display)
    const colSpanCount = 12 + (showC3A ? 1 : 0) + (showTauxAjout ? 1 : 0);

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
                      value="range" 
                      defaultChecked 
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
                <p style={{fontSize: '0.9em', color: '#666', marginTop: '10px'}}>
                  <strong>Note:</strong> Le filtre de date s'applique uniquement pour l'export et le traitement. 
                  Tous les échantillons restent visibles dans le tableau.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={handleClearDateFilter}>Annuler</button>
               <button onClick={() => {
  handleApplyDateFilter(); 
  setShowDateFilter(false); // existing date filter logic
  onStartTraitement?.();    // trigger traitement mode in parent
}}>
  Traiter
</button>

              </div>
            </div>
          </div>
        )}

        {/* Title Section - Moved above buttons */}
        <div style={{ marginBottom: "1rem" }}>
          <h2>Données à traiter</h2>
          <strong>Client :</strong>{" "}
              <p><strong>{clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}</strong></p>
          
          {produitInfo && (
            <>
              <h3>{produitInfo.description}</h3>
              <p><strong>Type: {produitInfo.nom}</strong></p>
            </>
          )}
          
          {/* Display filter status */}
          {(start || end) && (
            <div style={{ backgroundColor: "#e6f7ff", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
              <strong>Filtre actif:</strong> Période du {start || "..."} au {end || "..."} 
              <span style={{fontSize: '0.9em', color: '#666', marginLeft: '10px'}}>
                (appliqué pour l'export et le traitement uniquement)
              </span>
            </div>
          )}
          
          {isEditing && rowsToEdit.length > 0 && (
            <div style={{ backgroundColor: "#e6f7ff", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
              <strong>Mode édition :</strong> Vous modifiez {rowsToEdit.length} échantillon(s)
            </div>
          )}
        </div>

        {/* Action Buttons - Below the title */}
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

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ech</th>
                <th>Date</th>
                {/* No Heure column in browser display */}
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
                {showTauxAjout && <th>Taux Ajout</th>}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.num_ech}</td>
                  <td>{row.date_test}</td>
                  {/* No Heure column in browser display */}
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
                  {showTauxAjout && (
                    <td>
                      <input
                        type="number"
                        value={row.ajout_percent || ""}
                        onChange={(e) => handleEdit(row.id, "ajout_percent", e.target.value)}
                        disabled={!isEditing}
                      />
                    </td>
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

export default DonneesClients;