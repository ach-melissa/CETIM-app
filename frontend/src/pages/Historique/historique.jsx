import React, { useState } from "react";
import "./historique.css";
import Header from "../../components/Header/Header";

export default function Historique() {
  // Example temporary data with "données traitées" and "résultats de traitement"
  const [history, setHistory] = useState([
    {
      id: 1,
      client: "Client A",
      cementType: "CEM II/A-L 42,5 N",
      importDate: "2025-09-10",
      period: { from: "2023-01-01", to: "2023-12-01" },
      donnees: {
        Rc2j: "excel file",
        
      },
      traitement:
        " pdf-word File",
      result: "Conforme",
    },
    {
      id: 2,
      client: "Client B",
      cementType: "CEM I 32,5 R",
      importDate: "2025-09-12",
      period: { from: "2024-03-01", to: "2024-09-30" },
       donnees: {
        Rc2j: "excel file",
        
      },
      traitement:
        " pdf-word File",
      result: "Conforme",
    },
    {
      id: 3,
      client: "Client C",
      cementType: "CEM III/A 42,5 N",
      importDate: "2025-09-15",
      period: { from: "2022-05-15", to: "2023-05-15" },
       donnees: {
        Rc2j: "excel file",
        
      },
      traitement:
        " pdf-word File",
      result: "Conforme",
    },
  ]);

  const [search, setSearch] = useState("");

  // Filter by client name, cement type, or date
  const filteredHistory = history.filter(
    (h) =>
      h.client.toLowerCase().includes(search.toLowerCase()) ||
      h.cementType.toLowerCase().includes(search.toLowerCase()) ||
      h.importDate.includes(search) ||
      h.period.from.includes(search) ||
      h.period.to.includes(search)
  );

  return (
    <div className="historique-container">
      <Header />

      <h1>Historique des Contrôles</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Rechercher par client, ciment ou date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {/* History table */}
      <table className="history-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Type de Ciment</th>
            <th>Date Importation</th>
            <th>Période d'Essais</th>
            <th>Données Traitées</th>
            <th>Résultats de Traitement</th>
            <th>Résultat Final</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record) => (
              <tr key={record.id}>
                <td>{record.client}</td>
                <td>{record.cementType}</td>
                <td>{record.importDate}</td>
                <td>
                  {record.period.from}  {record.period.to}
                </td>
                <td>
                 
                    {record.donnees.Rc2j} 
                   
                  
                </td>
                <td className="traitement">{record.traitement}</td>
                <td
                  className={
                    record.result === "Conforme" ? "conforme" : "non-conforme"
                  }
                >
                  {record.result}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Aucun enregistrement trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
