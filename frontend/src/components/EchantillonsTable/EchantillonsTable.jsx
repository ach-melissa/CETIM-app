import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./EchantillonsTable.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const EchantillonsTable = forwardRef(
  (
    {
      clientId,
      clientTypeCimentId,
      produitInfo,
      phase,
      tableData = [],
      ajoutsData,
      startDate,
      endDate,
      clients = [],
    },
    ref
  ) => {
    const [rows, setRows] = useState([]);

    // ✅ update table when parent passes new data
    useEffect(() => {
      if (tableData && tableData.length > 0) {
        setRows(tableData);
      } else {
        setRows([]);
      }
    }, [tableData]);

    // ✅ show C3A or Ajout column based on cement family
    const showC3A = produitInfo && produitInfo.famille?.code === "CEM I";
    const showTauxAjout = produitInfo && produitInfo.famille?.code !== "CEM I";

    // ✅ Get client name
    const getClientName = () => {
      if (!clientId) return "Aucun client sélectionné";
      const client = clients.find(c => c.id == clientId);
      return client ? client.nom_raison_sociale : "Client non trouvé";
    };

    // ✅ Export Excel
    const exportToExcel = () => {
      if (rows.length === 0) {
        alert("Aucune donnée à exporter !");
        return;
      }
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Echantillons");
      XLSX.writeFile(wb, "echantillons.xlsx");
    };

    // ✅ Export PDF
    const exportToPDF = () => {
      if (rows.length === 0) {
        alert("Aucune donnée à exporter !");
        return;
      }

      const headers = [
        "Ech",
        "Date",
        "RC2J",
        "RC7J",
        "RC28J",
        "Prise",
        "Stabilité",
        "Hydratation",
        "P. Feu",
        "R. Insoluble",
        "SO3",
        "Chlorure",
      ];
      if (showC3A) headers.push("C3A");
      if (showTauxAjout) headers.push("Taux Ajout");

      const data = rows.map((row) => {
        const base = [
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
          row.chlorure,
        ];
        if (showC3A) base.push(row.c3a);
        if (showTauxAjout) base.push(row.ajout_percent);
        return base;
      });

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Échantillons filtrés", 14, 15);
      doc.setFontSize(10);
      
      const clientName = getClientName();
      doc.text(`Client: ${clientName}`, 14, 25);
      if (produitInfo?.description) doc.text(`Produit: ${produitInfo.description}`, 14, 32);
      if (produitInfo?.famille?.nom)
        doc.text(`Famille: ${produitInfo.famille.nom}`, 14, 39);
      if (startDate && endDate)
        doc.text(`Période: du ${startDate} au ${endDate}`, 14, 46);

      doc.autoTable({
        head: [headers],
        body: data,
        startY: 52,
        styles: { fontSize: 8 },
        theme: "grid",
      });

      doc.save("echantillons_filtrés.pdf");
    };

    // ✅ Export Word
   // ✅ Export Word
const exportToWord = async () => {
  if (rows.length === 0) {
    alert("Aucune donnée à exporter !");
    return;
  }

  try {
    // 1️⃣ Prepare table headers
    const headers = [
      "Ech", "Date", "RC2J", "RC7J", "RC28J", "Prise", "Stabilité",
      "Hydratation", "P. Feu", "R. Insoluble", "SO3", "Chlorure"
    ];
    if (showC3A) headers.push("C3A");
    if (showTauxAjout) headers.push("Taux Ajout");

    // 2️⃣ Prepare HTML table
    let htmlContent = `<html><head><meta charset='utf-8'><style>
      body { font-family: Arial; } 
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 4px; text-align: center; }
      th { background-color: #2980b9; color: white; }
    </style></head><body>`;

    htmlContent += `<h2>Échantillons filtrés</h2>
      <p><strong>Client:</strong> ${getClientName()}</p>
      <p><strong>Produit:</strong> ${produitInfo?.description || "Non défini"}</p>
      ${produitInfo?.famille?.nom ? `<p><strong>Famille:</strong> ${produitInfo.famille.nom}</p>` : ""}
      <p><strong>Période:</strong> du ${startDate} au ${endDate}</p>
      <table><thead><tr>`;

    headers.forEach(h => htmlContent += `<th>${h}</th>`);
    htmlContent += `</tr></thead><tbody>`;

    rows.forEach(r => {
      htmlContent += `<tr>
        <td>${r.num_ech || ""}</td>
        <td>${r.date_test || ""}</td>
        <td>${r.rc2j || ""}</td>
        <td>${r.rc7j || ""}</td>
        <td>${r.rc28j || ""}</td>
        <td>${r.prise || ""}</td>
        <td>${r.stabilite || ""}</td>
        <td>${r.hydratation || ""}</td>
        <td>${r.pfeu || ""}</td>
        <td>${r.r_insoluble || ""}</td>
        <td>${r.so3 || ""}</td>
        <td>${r.chlorure || ""}</td>
        ${showC3A ? `<td>${r.c3a || ""}</td>` : ""}
        ${showTauxAjout ? `<td>${r.ajout_percent || ""}</td>` : ""}
      </tr>`;
    });

    htmlContent += `</tbody></table></body></html>`;

    // 3️⃣ Convert HTML to Blob
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = async () => {
      const base64File = reader.result.split(",")[1]; // remove prefix

      // 4️⃣ Build file name
      const clientNameSafe = getClientName().replace(/\s+/g, "_");
      const fileName = `echantillons_${clientNameSafe}_${startDate}_${endDate}.doc`;

      // 5️⃣ Send to backend with correct field
      const response = await fetch("http://localhost:5000/api/save-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_types_ciment_id: clientTypeCimentId, // ✅ use correct ID
          phase,
          pdf_type: "Echantillons",
          fileName,
          base64File,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur sauvegarde fichier");

      alert("✅ Export Word enregistré dans l'historique !");
    };
  } catch (error) {
    console.error("Erreur export Word:", error);
    alert("❌ Erreur lors de l'export Word: " + error.message);
  }
};


    useImperativeHandle(ref, () => ({
      async generatePDFBytes() {
        const doc = new jsPDF();
        doc.text("Echantillons", 10, 10);
        doc.autoTable({ html: "#echantillons-table" });
        return doc.output("arraybuffer");
      },
    }));

    return (
      <div className="echantillons-wrapper">
        <h2>Échantillons filtrés</h2>

        {/* ✅ Info Section */}
        <div className="echantillons-info">
          <p>
            <strong>Client :</strong>{" "}
            {clients.find(c => c.id == clientId)?.nom_raison_sociale || "Aucun client"}
          </p>
          <p>
            <strong>Ciment type :</strong>{" "}
            {produitInfo?.nom || "Non défini"}
          </p>
          {produitInfo?.famille && (
            <p>
              <strong>Famille :</strong> {produitInfo.famille.nom}
            </p>
          )}
          <p>
            <strong>Période :</strong>{" "}
            {startDate ? `du ${startDate}` : "..."}{" "}
            {endDate ? `au ${endDate}` : ""}
          </p>
        </div>

        {/* ✅ Export buttons */}
        <div className="actions">
          <button onClick={exportToExcel}>Exporter Excel</button>
          <button onClick={exportToWord}>Exporter Word</button>
        </div>

        {/* ✅ Data Table */}
        <div className="table-container">
          <table className="table" id="echantillons-table">
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
                {showTauxAjout && <th>Taux Ajout</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={r.id || r.num_ech}>
                    <td>{r.num_ech}</td>
                    <td>{r.date_test}</td>
                    <td>{r.rc2j}</td>
                    <td>{r.rc7j}</td>
                    <td>{r.rc28j}</td>
                    <td>{r.prise}</td>
                    <td>{r.stabilite}</td>
                    <td>{r.hydratation}</td>
                    <td>{r.pfeu}</td>
                    <td>{r.r_insoluble}</td>
                    <td>{r.so3}</td>
                    <td>{r.chlorure}</td>
                    {showC3A && <td>{r.c3a}</td>}
                    {showTauxAjout && <td>{r.ajout_percent}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={12 + (showC3A ? 1 : 0) + (showTauxAjout ? 1 : 0)}
                  >
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default EchantillonsTable;