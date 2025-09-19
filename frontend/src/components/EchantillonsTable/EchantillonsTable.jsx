// EchantillonsTable.jsx
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useData } from "../../context/DataContext";


const EchantillonsTable = forwardRef( 
  (
    { 
      clientId, 
      produitId, 
      phase, 
      selectedType, 
      onTableDataChange,
      initialStart, 
      initialEnd, 
      produitDescription,
      clients = [], 
      produits = [] 
    },
    ref
  ) => {
    const [start, setStart] = useState(initialStart || "");
    const [end, setEnd] = useState(initialEnd || "");
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(false);
    
    const { updateFilteredData } = useData();

    const fetchRows = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const params = { client_id: clientId };
        if (produitId) params.produit_id = produitId;
        if (phase) params.phase = phase;
        if (start){
          const startDate = new Date(start);
          startDate.setDate(startDate.getDate() + 1); // include last day
          params.start = startDate.toISOString().split("T")[0];
        } 
        if (end) {
          const endDate = new Date(end);
          endDate.setDate(endDate.getDate() + 1); // include last day
          params.end = endDate.toISOString().split("T")[0];
        }

        const resp = await axios.get("http://localhost:5000/api/echantillons", { params });
        setRows(resp.data || []);
        setSelected(new Set());
        
        // Mettre à jour le contexte et le parent
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
    }, [clientId, produitId, phase]);

    const toggleRow = (id) => {
      const s = new Set(selected);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      setSelected(s);
    };

    const toggleAll = () => {
      if (selected.size === rows.length) {
        setSelected(new Set());
      } else {
        setSelected(new Set(rows.map((r) => r.id)));
      }
    };

    const handleEdit = (id, field, value) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    };

    const formatExcelDate = (excelDate) => {
      if (!excelDate) return null;

      if (excelDate instanceof Date) {
        return excelDate.toISOString().split("T")[0];
      }

      if (typeof excelDate === "number") {
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date.toISOString().split("T")[0];
      }

      if (typeof excelDate === "string") {
        const parts = excelDate.split(/[\/\-]/);
        if (parts.length === 3) {
          let [day, month, year] = parts.map((p) => p.padStart(2, "0"));
          if (year.length === 4 && Number(day) <= 31 && Number(month) <= 12) {
            return `${year}-${month}-${day}`;
          }
        }
        return excelDate;
      }

      return null;
    };

    const handleImportExcel = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });


        
        const formattedRows = jsonData.map((row, index) => ({
          id: Date.now() + index,
          num_ech: row.num_ech || row["Ech"] || "",
          date_test: formatExcelDate(row.date_test || row["Date"] || row["Date test"] || row["date"] || ""),
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
        }));

        setRows((prevRows) => {
          const updated = [...prevRows, ...formattedRows];
          updateFilteredData(updated, start, end);
          if (onTableDataChange) {
            onTableDataChange(updated, start, end);
          }
          return updated;
        });

        axios.post("http://localhost:5000/api/echantillons/bulk", {
          client_id: clientId,
          produit_id: produitId,
          phase: phase,
          rows: formattedRows
        })
        .then((res) => {
          console.log("✅ Imported to DB:", res.data);
        })
        .catch((err) => {
          console.error("❌ Import error:", err);
        });

        setSelected(new Set());
      };

      reader.readAsArrayBuffer(file);
    };

    const exportToExcel = () => {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    const exportToCSV = () => {
      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "echantillons.csv";
      a.click();
    };

    const exportToPDF = () => {
      const doc = new jsPDF();
      if (rows.length === 0) {
        doc.text("Aucune donnée", 10, 10);
      } else {
        const columns = Object.keys(rows[0]);
        const body = rows.map((row) => columns.map((col) => row[col]));
        doc.autoTable({ head: [columns], body });
      }
      doc.save("echantillons.pdf");
    };

    const handlePrint = () => {
      const printWindow = window.open("", "_blank");
      if (!rows.length) {
        printWindow.document.write("<p>Aucune donnée à imprimer</p>");
      } else {
        const columns = Object.keys(rows[0]);
        const tableHtml = `
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map((row) =>
                `<tr>${columns.map((c) => `<td>${row[c] ?? ""}</td>`).join("")}</tr>`
              ).join("")}
            </tbody>
          </table>`;
        printWindow.document.write(`<html><body>${tableHtml}</body></html>`);
      }
      printWindow.document.close();
      printWindow.print();
    };

const handleSave = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/echantillons/save", { rows });
    alert(`✅ Sauvegardé ${res.data.updated} lignes`);
  } catch (err) {
    console.error("Erreur lors de la sauvegarde:", err.response?.data || err.message);
    alert("❌ Erreur lors de la sauvegarde. Voir console.");
  }
};



    return (
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <label>
            Du{" "}
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            Au{" "}
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <button onClick={fetchRows} disabled={loading || !clientId}>
            Filtrer
          </button>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>
              {clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}
            </strong>
          </p>
          <h2>Données à traiter</h2>
          <h2>Période du {start || "......"} au {end || "..........."} </h2>
          {produitId && <h3>{produitDescription}</h3>}
        </div>

        <div className="table-container">
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={toggleAll}
                    checked={rows.length > 0 && selected.size === rows.length}
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
              {rows.map((row) => (
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
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.rc7j || ""}
                      onChange={(e) => handleEdit(row.id, "rc7j", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.rc28j || ""}
                      onChange={(e) => handleEdit(row.id, "rc28j", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.prise || ""}
                      onChange={(e) => handleEdit(row.id, "prise", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.stabilite || ""}
                      onChange={(e) => handleEdit(row.id, "stabilite", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.hydratation || ""}
                      onChange={(e) => handleEdit(row.id, "hydratation", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.pfeu || ""}
                      onChange={(e) => handleEdit(row.id, "pfeu", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.r_insoluble || ""}
                      onChange={(e) => handleEdit(row.id, "r_insoluble", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.so3 || ""}
                      onChange={(e) => handleEdit(row.id, "so3", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.chlorure || ""}
                      onChange={(e) => handleEdit(row.id, "chlorure", e.target.value)}
                    />
                  </td>
                  {selectedType === 1 && (
                    <td>
                      <input
                        type="number"
                        value={row.c3a || ""}
                        onChange={(e) => handleEdit(row.id, "c3a", e.target.value)}
                      />
                    </td>
                  )}
                  {selectedType && selectedType !== 1 && (
                    <td>
                      <input
                        type="number"
                        value={row.ajout_percent || ""}
                        onChange={(e) => handleEdit(row.id, "ajout_percent", e.target.value)}
                      />
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={15}>Aucune donnée pour cette période / client</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

<div style={{ marginBottom: 10 }}>
  <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} />
<button onClick={handleSave} disabled={rows.length === 0}>Sauvegarder</button>

  <button onClick={exportToExcel}>Export Excel</button>
  <button onClick={exportToCSV}>Export CSV</button>
  <button onClick={exportToPDF}>Export PDF</button>
  <button onClick={handlePrint}>Imprimer</button>
</div>


      </div>
    );
  }
);

export default EchantillonsTable;
