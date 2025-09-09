import React, { useEffect, useState } from "react";
import Header from "../../header/Header";
import "./parametre_norm.css";

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
  const [editing, setEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState([]);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParamName, setNewParamName] = useState("");
  const [newParamUnit, setNewParamUnit] = useState("");
  const [newParamLimitInf, setNewParamLimitInf] = useState("");
  const [newParamLimitSup, setNewParamLimitSup] = useState("");
  const [newParamGarantie, setNewParamGarantie] = useState("");

  // Mock categories
  const mockCategories = [
    { id: "mecanique", nom: "mecanique" },
    { id: "physique", nom: "physique" },
    { id: "chimique", nom: "chimique" },
  ];

  // Mock parameters
  const mockParameters = {
    mecanique: [
      { id: "resistance_2j", nom: "Résistance à 2 jours", unite: "MPa" },
      { id: "resistance_7j", nom: "Résistance à 7 jours", unite: "MPa" },
      { id: "resistance_28j", nom: "Résistance à 28 jours", unite: "MPa" },
    ],
    physique: [
      { id: "temps_debut_prise", nom: "Temps de début de prise", unite: "min" },
      { id: "stabilite", nom: "Stabilité", unite: "mm" },
      { id: "chaleur_hydratation", nom: "Chaleur d'hydratation", unite: "J/g" },
    ],
    chimique: [
      { id: "SO3", nom: "SO3", unite: "%" },
      { id: "SO3_supp", nom: "SO3 (Ciments SR)", unite: "%" },
      { id: "C3A", nom: "C3A", unite: "%" },
      { id: "pert_au_feu", nom: "Perte au feu", unite: "%" },
      { id: "residu_insoluble", nom: "Résidu insoluble", unite: "%" },
      { id: "teneur_chlour", nom: "Teneur en chlour", unite: "%" },
      { id: "pouzzolanicite", nom: "Pouzzolanicité", unite: "" },
      { id: "pouzzolanicite_supp", nom: "Pouzzolanicité (SR)", unite: "" },
    ],
  };

  // Mock details
  const mockDetails = {
    // Mécanique
    resistance_2j: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "52.5 N", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "42.5 R", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-S", classe: "32.5 R", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: null, resistance_max: null, garantie: null },
    ],
    resistance_7j: [
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "32.5 L", resistance_min: "12.0", resistance_max: null, garantie: "10.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
    ],
    resistance_28j: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "52.5 N", resistance_min: "52.5", resistance_max: "72.5", garantie: "50.0" },
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "42.5 R", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-S", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-V", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "32.5 L", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "42.5 L", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM III", type_code: "CEM III/C", classe: "32.5 L", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/B", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "42.5 N", resistance_min: "42.5", resistance_max: "62.5", garantie: "40.0" },
      { famille_code: "CEM V", type_code: "CEM V/B", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" },
    ],

    // Physique
    temps_debut_prise: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "32.5 N", resistance_min: "75", resistance_max: null, garantie: "60" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "60", resistance_max: null, garantie: "50" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 R", resistance_min: "75", resistance_max: null, garantie: "60" },
    ],
    stabilite: [
      { famille_code: "ALL", type_code: "ALL", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: "10" },
    ],
    chaleur_hydratation: [
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: "300" },
    ],

    // Chimique
    SO3: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "32.5 N", resistance_min: null, resistance_max: "3.5", garantie: "4.0" },
    ],
    SO3_supp: [
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "32.5 N", resistance_min: null, resistance_max: "3.0", garantie: "3.0" },
    ],
    C3A: [
      { famille_code: "CEM I", type_code: "CEM I-SR0", classe: "Tous", resistance_min: null, resistance_max: "0.0", garantie: "2.0" },
    ],
    pert_au_feu: [
      { famille_code: "CEM II", type_code: "CEM II/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: "4.5" },
    ],
    residu_insoluble: [
      { famille_code: "CEM II", type_code: "CEM II/B", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: "4.5" },
    ],
    teneur_chlour: [
      { famille_code: "ALL", type_code: "ALL", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: "0.1" },
    ],
    pouzzolanicite: [
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: "25", resistance_max: null, garantie: "20" },
    ],
    pouzzolanicite_supp: [
      { famille_code: "CEM IV", type_code: "CEM IV/B", classe: "SR", resistance_min: "25", resistance_max: null, garantie: "20" },
    ],
  };

  // Load saved data from localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('savedParameterData');
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error("Error loading saved data:", error);
      return {};
    }
  };

  // Save data to localStorage
  const saveData = (data) => {
    try {
      localStorage.setItem('savedParameterData', JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // State for saved data
  const [savedData, setSavedData] = useState(loadSavedData());

  // ------------------- Hooks -------------------

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setCategories(mockCategories);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setParameters(mockParameters[selectedCategory] || []);
      setParamLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (USE_MOCK_DATA && selectedParameter) {
      // Check if we have saved data for this parameter
      if (savedData[selectedParameter]) {
        setParameterDetails(savedData[selectedParameter]);
        setEditing(false);
      } else {
        setParameterDetails(mockDetails[selectedParameter] || []);
        setEditing(true);
      }
      setDetailsLoading(false);
    }
  }, [selectedParameter]);

  // Update editedDetails when parameterDetails changes
  useEffect(() => {
    setEditedDetails([...parameterDetails]);
  }, [parameterDetails]);

  // ------------------- Helpers -------------------

  const formatCategoryName = (name) => {
    const names = { mecanique: "Mécanique", physique: "Physique", chimique: "Chimique" };
    return names[name] || name;
  };

  const handleAddParameter = (e) => {
    e.preventDefault();
    if (!newParamName.trim()) {
      setError("Le nom du paramètre est requis");
      return;
    }
    const newParam = {
      id: `new-${Date.now()}`,
      nom: newParamName,
      unite: newParamUnit,
      limit_inf: newParamLimitInf || null,
      limit_sup: newParamLimitSup || null,
      limit_garanti: newParamGarantie || null,
    };
    setParameters([...parameters, newParam]);
    setNewParamName("");
    setNewParamUnit("");
    setNewParamLimitInf("");
    setNewParamLimitSup("");
    setNewParamGarantie("");
    setShowAddForm(false);
    setError("");
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveClick = () => {
    // Save the edited data
    const updatedSavedData = {
      ...savedData,
      [selectedParameter]: editedDetails
    };
    setSavedData(updatedSavedData);
    saveData(updatedSavedData);
    setEditing(false);
    setParameterDetails(editedDetails);
  };

  const handleCancelClick = () => {
    setEditedDetails([...parameterDetails]);
    setEditing(false);
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...editedDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };
    setEditedDetails(updatedDetails);
  };

  const handleAddRow = () => {
    setEditedDetails([
      ...editedDetails,
      { famille_code: "", type_code: "", classe: "", resistance_min: "", resistance_max: "", garantie: "" }
    ]);
  };

  const handleDeleteRow = (index) => {
    const updatedDetails = [...editedDetails];
    updatedDetails.splice(index, 1);
    setEditedDetails(updatedDetails);
  };

  // ------------------- Render -------------------

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

        {USE_MOCK_DATA && <div className="demo-notice">Mode démonstration: données simulées</div>}

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
                    onChange={() => {
                      setSelectedCategory(category.nom);
                      setSelectedParameter(null);
                    }}
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
          <div className="parameters-header">
            <h2>Paramètres {formatCategoryName(selectedCategory)}</h2>
            <button className="add-param-btn" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Annuler" : "Ajouter un paramètre"}
            </button>
          </div>

          {showAddForm && (
            <div className="add-param-form">
              <h3>Ajouter un nouveau paramètre</h3>
              <form onSubmit={handleAddParameter}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Nom du paramètre"
                    value={newParamName}
                    onChange={(e) => setNewParamName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unité"
                    value={newParamUnit}
                    onChange={(e) => setNewParamUnit(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Limite Inférieure"
                    value={newParamLimitInf}
                    onChange={(e) => setNewParamLimitInf(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Limite Supérieure"
                    value={newParamLimitSup}
                    onChange={(e) => setNewParamLimitSup(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Limite Garantie"
                    value={newParamGarantie}
                    onChange={(e) => setNewParamGarantie(e.target.value)}
                  />
                  <button type="submit">Ajouter</button>
                </div>
              </form>
            </div>
          )}

          {parameters.length === 0 ? (
            <p>Aucun paramètre trouvé pour cette catégorie.</p>
          ) : (
            <>
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
            
              {selectedParameter && (
                <div className="parameter-details">
                  <div className="parameter-header">
                    <h3>
                      {parameters.find((p) => p.id === selectedParameter)?.nom}
                      {parameters.find((p) => p.id === selectedParameter)?.unite &&
                        ` (${parameters.find((p) => p.id === selectedParameter)?.unite})`}
                    </h3>
                    
                    {!editing ? (
                      <button className="edit-btn" onClick={handleEditClick}>
                        Modifier
                      </button>
                    ) : (
                      <div className="action-buttons">
                        <button className="save-btn" onClick={handleSaveClick}>
                          Validé
                        </button>
                        <button className="cancel-btn" onClick={handleCancelClick}>
                          Annuler
                        </button>
                        <button className="add-row-btn" onClick={handleAddRow}>
                          Ajouter une ligne
                        </button>
                      </div>
                    )}
                  </div>

                  {editedDetails.length === 0 ? (
                    <div className="no-data">
                      <p>Aucune donnée disponible pour ce paramètre.</p>
                      {editing && (
                        <button className="add-row-btn" onClick={handleAddRow}>
                          Ajouter une ligne
                        </button>
                      )}
                    </div>
                  ) : (
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
                            {editing && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {editedDetails.map((detail, index) => (
                            <tr key={index}>
                              <td>
                                {editing ? (
                                  <input
                                    type="text"
                                    value={detail.famille_code || ""}
                                    onChange={(e) => handleDetailChange(index, "famille_code", e.target.value)}
                                  />
                                ) : (
                                  detail.famille_code || "-"
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <input
                                    type="text"
                                    value={detail.type_code || ""}
                                    onChange={(e) => handleDetailChange(index, "type_code", e.target.value)}
                                  />
                                ) : (
                                  detail.type_code || "-"
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <input
                                    type="text"
                                    value={detail.classe || ""}
                                    onChange={(e) => handleDetailChange(index, "classe", e.target.value)}
                                  />
                                ) : (
                                  detail.classe || "-"
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={detail.resistance_min || ""}
                                    onChange={(e) => handleDetailChange(index, "resistance_min", e.target.value)}
                                  />
                                ) : (
                                  detail.resistance_min || "-"
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={detail.resistance_max || ""}
                                    onChange={(e) => handleDetailChange(index, "resistance_max", e.target.value)}
                                  />
                                ) : (
                                  detail.resistance_max || "-"
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={detail.garantie || ""}
                                    onChange={(e) => handleDetailChange(index, "garantie", e.target.value)}
                                  />
                                ) : (
                                  detail.garantie || "-"
                                )}
                              </td>
                              {editing && (
                                <td>
                                  <button 
                                    className="delete-row-btn"
                                    onClick={() => handleDeleteRow(index)}
                                  >
                                    Supprimer
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
