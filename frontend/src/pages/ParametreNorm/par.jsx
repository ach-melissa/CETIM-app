import React, { useEffect, useState } from "react";
import "./parametre_norm.css";
import Header from "../../components/Header/Header";

const API_BASE = "http://localhost:5000";
const USE_MOCK_DATA = true;

export default function ParametreNorm() {
  const [selectedCategory, setSelectedCategory] = useState("mecanique");
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [parameterDetails, setParameterDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paramLoading, setParamLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParamName, setNewParamName] = useState("");
  const [newParamUnit, setNewParamUnit] = useState("");
  const [validatedParams, setValidatedParams] = useState({});
  const [rows, setRows] = useState([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);

  // Load categories
  useEffect(() => {
    if (USE_MOCK_DATA) {
      fetch("/Data/parnorm.json")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories);
          setLoading(false);
        })
        .catch(() => setError("Erreur lors du chargement des catégories"));
    }
  }, []);

  // Load parameters based on selected category
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setParamLoading(true);
      fetch("/Data/conformite.json")
        .then((res) => res.json())
        .then((data) => {
          setParameters(data.controles_conformite[selectedCategory] || []);
          setParamLoading(false);
        })
        .catch(() => {
          setError("Erreur lors du chargement des paramètres");
          setParamLoading(false);
        });
    }
  }, [selectedCategory]);

  // Load parameter details when a parameter is selected
  useEffect(() => {
    if (selectedParameter && USE_MOCK_DATA) {
      setDetailsLoading(true);
      fetch("/Data/parnorm.json")
        .then((res) => res.json())
        .then((data) => {
          setParameterDetails(data.details[selectedParameter] || []);
          setDetailsLoading(false);
        })
        .catch(() => {
          setError("Erreur lors du chargement des détails");
          setDetailsLoading(false);
        });
    }
  }, [selectedParameter]);

  // ---------------- Helpers ----------------
  const formatCategoryName = (name) => {
    const names = { mecanique: "Mécanique", physique: "Physique", chimique: "Chimique" };
    return names[name] || name;
  };

  const handleAddRow = () => {
    setRows([...rows, { cas: "", limitInf: "", limitSup: "", garantie: "" }]);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleValidateAll = () => {
    if (!selectedParameter) return;
    setValidatedParams((prev) => ({
      ...prev,
      [selectedParameter]: [...rows],
    }));
    setRows([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);
  };

  const isAjouteParameter = () => {
    return selectedParameter === "ajt";
  };

  // ---------------- Render ----------------
  return (
    <div className="parametreNormPage">
      <Header />

      <main className="content">
        <h1>Paramètres Norme Ciment</h1>

        {/* Category radios */}
        <div className="category-selection">
          <h2>Sélectionnez une catégorie:</h2>
          <div className="category-radios">
            {categories.map((category) => {
              const categoryId = category.id || category.nom;
              return (
                <div key={categoryId} className="radio-option">
                  <input
                    type="radio"
                    id={categoryId}
                    name="category"
                    value={category.nom}
                    checked={selectedCategory === category.nom}
                    onChange={() => setSelectedCategory(category.nom)}
                  />
                  <label htmlFor={categoryId}>{formatCategoryName(category.nom)}</label>
                </div>
              );
            })}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Parameters */}
        <div className="parameters-list">
          {paramLoading ? (
            <p>Chargement des paramètres...</p>
          ) : parameters.length === 0 ? (
            <p>Aucun paramètre trouvé pour cette catégorie.</p>
          ) : (
            <>
              <div className="parameter-buttons">
                {parameters.map((param) => {
                  const isAjout = param.id === "ajt";
                  const casList = validatedParams[param.id]
                    ? validatedParams[param.id].map((r) => r.cas).filter(Boolean)
                    : [];

                  return (
                    <button
                      key={param.id}
                      className={selectedParameter === param.id ? "active" : ""}
                      onClick={() => {
                        setSelectedParameter(param.id === selectedParameter ? null : param.id);
                        setRows([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);
                      }}
                    >
                      {param.nom} {param.unite && `(${param.unite})`}
                      {isAjout && casList.length > 0 && ` (${casList.join(", ")})`}
                    </button>
                  );
                })}
              </div>

              {/* Custom parameter table for "L'ajoute" */}
              {isAjouteParameter() && (
                <div className="parameter-details-form">
                  <h3>
                    ajout(
                    {validatedParams[selectedParameter]
                      ? validatedParams[selectedParameter][0]?.cas || "......."
                      : rows[0]?.cas || "......."}
                    )
                  </h3>
                  <table className="parameter-table">
                    <thead>
                      <tr>
                        <th>Cas</th>
                        <th>Limit Inf</th>
                        <th>Limit Sup</th>
                        <th>Garantie</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validatedParams[selectedParameter] ? (
                        validatedParams[selectedParameter].map((row, index) => (
                          <tr key={index}>
                            <td>{row.cas}</td>
                            <td>{row.limitInf}</td>
                            <td>{row.limitSup}</td>
                            <td>{row.garantie}</td>
                            <td>
                              <button
                                onClick={() => {
                                  setRows(validatedParams[selectedParameter]);
                                  setValidatedParams((prev) => {
                                    const updated = { ...prev };
                                    delete updated[selectedParameter];
                                    return updated;
                                  });
                                }}
                              >
                                Modifier
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          {rows.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  value={row.cas}
                                  onChange={(e) => handleRowChange(index, "cas", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={row.limitInf}
                                  onChange={(e) => handleRowChange(index, "limitInf", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={row.limitSup}
                                  onChange={(e) => handleRowChange(index, "limitSup", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={row.garantie}
                                  onChange={(e) => handleRowChange(index, "garantie", e.target.value)}
                                />
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    const updated = [...rows];
                                    updated.splice(index, 1);
                                    setRows(updated);
                                  }}
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan="4">
                              <button type="button" onClick={handleAddRow}>
                                ➕ Ajouter une ligne
                              </button>
                            </td>
                            <td>
                              <button type="button" onClick={handleValidateAll}>
                                ✔️ Valider
                              </button>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Standard parameter details display */}
              {selectedParameter && parameterDetails.length > 0 && !isAjouteParameter() && (
                <div className="parameter-details">
                  <h3>
                    {parameters.find((p) => p.id === selectedParameter)?.nom}
                    {parameters.find((p) => p.id === selectedParameter)?.unite &&
                      ` (${parameters.find((p) => p.id === selectedParameter)?.unite})`}
                  </h3>
                  <div className="table-container">
                    <table className="parameter-table">
                      <thead>
                        <tr>
                          <th>Famille</th>
                          <th>Type</th>
                          <th>Classe</th>
                          <th>Limit Inf</th>
                          <th>Limit Sup</th>
                          <th>Limit Garantie</th>
                          <th>Unité</th>
                          <th>Évaluation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameterDetails.map((detail, index) => {
                          const paramInfo = parameters.find((p) => p.id === selectedParameter);
                          return (
                            <tr key={index}>
                              <td>{detail.famille_code}</td>
                              <td>{detail.type_code}</td>
                              <td>{detail.classe}</td>
                              <td>{detail.resistance_min || "-"}</td>
                              <td>{detail.resistance_max || "-"}</td>
                              <td>{detail.garantie || "-"}</td>
                              <td>{paramInfo?.unite || "-"}</td>
                              <td>{paramInfo?.type_controle || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}