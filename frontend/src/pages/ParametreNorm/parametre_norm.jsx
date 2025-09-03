import React, { useEffect, useState } from "react";
import Header from "../../header/Header";
import "./parametre_norm.css";

const API_BASE = "http://localhost:5000";

export default function ParametreNorm() {
  const [selectedCategory, setSelectedCategory] = useState("mecanique");
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch categories and parameters data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedParameter(null);

        // Fetch categories
        const categoriesResponse = await fetch(`${API_BASE}/api/categories`);
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Fetch parameters for the selected category
        const paramsResponse = await fetch(`${API_BASE}/api/parametres?categorie=${selectedCategory}`);
        if (!paramsResponse.ok) {
          throw new Error('Failed to fetch parameters');
        }
        const paramsData = await paramsResponse.json();
        setParameters(paramsData);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Function to format category names for display
  const formatCategoryName = (name) => {
    const names = {
      mecanique: "Mécanique",
      physique: "Physique",
      chimique: "Chimique",
      supplémentaire: "Supplémentaire",
    };
    return names[name] || name;
  };

  if (loading) {
    return (
      <div className="parametreNormPage">
        <Header />
        <div className="loading">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="parametreNormPage">
      <Header />
      <main className="content">
        <h1>Paramètres Norme Ciment</h1>

        {/* Category selection */}
        <div className="category-selection">
          <h2>Sélectionnez une catégorie:</h2>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category.id}
                className={selectedCategory === category.nom ? "active" : ""}
                onClick={() => setSelectedCategory(category.nom)}
              >
                {formatCategoryName(category.nom)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Parameters list */}
        <div className="parameters-list">
          <h2>Paramètres {formatCategoryName(selectedCategory)}</h2>
          
          {parameters.length === 0 ? (
            <p>Aucun paramètre trouvé pour cette catégorie.</p>
          ) : (
            <div className="parameter-buttons">
              {parameters.map((param) => (
                <button
                  key={param.id}
                  className={selectedParameter === param.id ? "active" : ""}
                  onClick={() => setSelectedParameter(param.id === selectedParameter ? null : param.id)}
                >
                  {param.nom} {param.unite && `(${param.unite})`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Parameter details */}
        {selectedParameter && (
          <div className="parameter-details">
            {parameters
              .filter(param => param.id === selectedParameter)
              .map(param => (
                <div key={param.id}>
                  <h3>
                    {param.nom} {param.unite && `(${param.unite})`}
                  </h3>


                  {/* Parameter values table */}
                  <div className="table-container">
                    <table className="parameter-table">
                      <thead>
                        <tr>
                          <th>Type de Ciment</th>
                          <th>Classe</th>
                          <th>Limite Inf</th>
                          <th>Limite Sup</th>
                          <th>Limite Garantie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {param.limites && param.limites.length > 0 ? (
                          param.limites.map((limite, idx) => (
                            <tr key={idx}>
                              <td className="cement-type">
                                {limite.ciment_type || "—"}
                              </td>
                              <td>{limite.classe || "—"}</td>
                              <td>{limite.limite_inf ?? "—"}</td>
                              <td>{limite.limite_sup ?? "—"}</td>
                              <td className="garantie-cell">
                                {limite.limite_garantie ?? "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="no-limits">
                              Pas de limites définies pour ce paramètre
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}