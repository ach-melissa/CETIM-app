import React, { useEffect, useState } from "react";
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

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParamName, setNewParamName] = useState("");
  const [newParamUnit, setNewParamUnit] = useState("");
  const [validatedParams, setValidatedParams] = useState({});
  const [rows, setRows] = useState([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);

  // Mock categories
  const mockCategories = [
    { id: "mecanique", nom: "mecanique" },
    { id: "physique", nom: "physique" },
    { id: "chimique", nom: "chimique" },
  ];

  // Mock parameters
const mockParameters = { 
  mecanique: [
    { id: "resistance_2j", nom: "Résistance à 2 jours", unite: "MPa", type_controle: "mesure" },
    { id: "resistance_7j", nom: "Résistance à 7 jours", unite: "MPa", type_controle: "mesure" },
    { id: "resistance_28j", nom: "Résistance à 28 jours", unite: "MPa", type_controle: "mesure" },
    { id: "ajt", nom: "L'ajoute", unite: null, type_controle: "attribut" },
  ],
  physique: [
    { id: "temps_debut_prise", nom: "Temps de début de prise", unite: "min", type_controle: "attribut" },
    { id: "stabilite", nom: "Stabilité (expansion)", unite: "mm", type_controle: "attribut" },
    { id: "chaleur_hydratation", nom: "Chaleur d’hydratation", unite: "J/g", type_controle: "attribut" },
    { id: "ajt", nom: "L'ajoute", unite: null, type_controle: "attribut" },
  ],
  chimique: [
    { id: "pert_au_feu", nom: "Perte au feu", unite: "%", type_controle: "attribut" },
    { id: "residu_insoluble", nom: "Résidu insoluble", unite: "%", type_controle: "attribut" },
    { id: "SO3", nom: "Teneur en sulfate (SO₃)", unite: "%", type_controle: "attribut" },
    { id: "teneur_chlour", nom: "Teneur en chlorure", unite: "%", type_controle: "attribut" },
    { id: "C3A", nom: "C3A dans le clinker", unite: "%", type_controle: "attribut" },
    { id: "pouzzolanicite", nom: "Pouzzolanicité", unite: "", type_controle: "attribut" },
    { id: "composition", nom: "Composition", unite: null, type_controle: "attribut" },
    { id: "ajt", nom: "L'ajoute", unite: null, type_controle: "attribut" },
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
    if (USE_MOCK_DATA) {
      setParameterDetails(mockDetails[selectedParameter] || []);
      setDetailsLoading(false);
    }
  }, [selectedParameter]);

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
    };
    setParameters([...parameters, newParam]);
    setNewParamName("");
    setNewParamUnit("");
    setShowAddForm(false);
    setError("");
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
      [selectedParameter]: [...rows]
    }));

    // Reset the form
    setRows([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);
  };

  // Check if selected parameter is "L'ajoute"
  const isAjouteParameter = () => {
    return selectedParameter === "ajt";
  };

  // ------------------- Render -------------------

  return (
    <div className="parametreNormPage">
   
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


          {parameters.length === 0 ? (
            <p>Aucun paramètre trouvé pour cette catégorie.</p>
          ) : (
            <>
            
              <div className="parameter-buttons">
{parameters.map((param) => {
        const isAjout = isAjouteParameter(param.id);

        // Collect all "cas" values if it's Ajout
        const casList = validatedParams[param.id]
          ? validatedParams[param.id].map(r => r.cas).filter(Boolean) // show validated cas
          : rows.map(r => r.cas).filter(Boolean); // show live editing cas

        return (
          <button
            key={param.id}
            className={selectedParameter === param.id ? "active" : ""}
            onClick={() => {
              setSelectedParameter(param.id === selectedParameter ? null : param.id);
              // Reset rows when selecting a parameter
              setRows([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);
            }}
          >
            {param.nom} {param.unite && `(${param.unite})`}
            {isAjout && casList.length > 0 && ` (  ${casList.join(", ")} )`}
          </button>
        );
      })}
              </div>
              


              {/* Custom parameter table for "L'ajoute" */}
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
          // Display validated data
          validatedParams[selectedParameter].map((row, index) => (
            <tr key={index}>
              <td>{row.cas}</td>
              <td>{row.limitInf}</td>
              <td>{row.limitSup}</td>
              <td>{row.garantie}</td>
              <td>
                <button 
                  onClick={() => {
                    // Allow editing validated data
                    setRows(validatedParams[selectedParameter]);
                    setValidatedParams(prev => {
                      const updated = {...prev};
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


              {/* Standard parameter details display for other parameters */}
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
