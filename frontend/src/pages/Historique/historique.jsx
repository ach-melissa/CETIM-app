import React, { useEffect, useState } from "react";
import "./Historique.css";
import Header from "../../components/Header/Header";

const Historique = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchType, setSearchType] = useState("client");
  const [searchClient, setSearchClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🧩 Fetch data from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/pdf-exports")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setFilteredGroups(data);
      })
      .catch((err) => console.error("❌ Error fetching grouped exports:", err));
  }, []);

  // 📅 Format date (no hours, no timezone shift)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-CA"); // YYYY-MM-DD
  };

  // 🔍 Filter by client (instant typing)
  useEffect(() => {
    if (searchType === "client") {
      const filtered = groups.filter((g) =>
        g.client_nom?.toLowerCase().includes(searchClient.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchClient, searchType, groups]);

  // 🔍 Filter by date (manual on button click)
  const handleSearch = () => {
    if (searchType !== "date") return;

    const filtered = groups.filter((g) => {
      const start = new Date(g.start_date);
      const end = new Date(g.end_date);
      const sFilter = startDate ? new Date(startDate) : null;
      const eFilter = endDate ? new Date(endDate) : null;

      if (sFilter && end < sFilter) return false;
      if (eFilter && start > eFilter) return false;
      return true;
    });

    setFilteredGroups(filtered);
  };

  // ⬇️ Download file
  const handleDownload = (id) => {
    window.open(`http://localhost:5000/api/pdf-exports/view/${id}`, "_blank");
  };

  return (
    <div className="historique-container">
        <Header />
      <h2 className="historique-title">📜 Historique des Exports</h2>

      {/* 🔍 Search section */}
      <div className="search-section">
        <label>
          Type de recherche :
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setSearchClient("");
              setStartDate("");
              setEndDate("");
              setFilteredGroups(groups);
            }}
          >
            <option value="client">Par Client</option>
            <option value="date">Par Date</option>
          </select>
        </label>

        {searchType === "client" ? (
          <input
            type="text"
            placeholder="Entrez le nom du client..."
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
          />
        ) : (
          <div className="date-filters">
            <label>
              Début :
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              Fin :
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button className="search-btn" onClick={handleSearch}>
              Rechercher
            </button>
          </div>
        )}
      </div>

      {/* 📋 Table */}
      <table className="historique-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Type de Ciment</th>
            <th>Période</th>
            <th>Fichiers Exportés</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">
                Aucun export trouvé
              </td>
            </tr>
          ) : (
            filteredGroups.map((group, i) => (
              <tr key={i}>
                <td>{group.client_nom}</td>
                <td>{group.ciment_code}</td>
                <td>
                  <span className="date">{formatDate(group.start_date)}</span> →{" "}
                  <span className="date">{formatDate(group.end_date)}</span>
                </td>
                <td className="file-buttons">
                  {group.exports.map((exp) => (
                    <div key={exp.id} className="file-item">
                      <span className="file-name">{exp.description}</span>
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(exp.id)}
                      >
                        ⬇️ Télécharger
                      </button>
                    </div>
                  ))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Historique;
