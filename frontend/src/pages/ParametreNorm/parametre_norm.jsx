import React, { useEffect, useState } from "react";
import Header from "../../header/Header";
import "./parametre_norm.css";

const API_BASE = "http://localhost:5000";
const USE_MOCK_DATA = true; // Set to false when your API is working

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

  // Mock data for testing
  const mockCategories = [
    { id: 'mecanique', nom: 'mecanique' },
    { id: 'physique', nom: 'physique' },
    { id: 'chimique', nom: 'chimique' }
  ];

  const mockParameters = {
    mecanique: [
      { id: 'resistance_2j', nom: 'Résistance à 2 jours', unite: 'MPa' },
      { id: 'resistance_7j', nom: 'Résistance à 7 jours', unite: 'MPa' },
      { id: 'resistance_28j', nom: 'Résistance à 28 jours', unite: 'MPa' }
    ],
    physique: [
      { id: 'temps_debut_prise', nom: 'Temps de début de prise', unite: 'min' },
      { id: 'stabilite', nom: 'Stabilité', unite: 'mm' },
      { id: 'chaleur_hydratation', nom: 'Chaleur d\'hydratation', unite: 'J/g' }
    ],
    chimique: [
      { id: 'SO3', nom: 'SO3', unite: '%' },
      { id: 'SO3_supp', nom: 'SO3 (Ciments SR)', unite: '%' },
      { id: 'C3A', nom: 'C3A', unite: '%' },
      { id: 'pert_au_feu', nom: 'Pert au feu', unite: '%' },
      { id: 'residu_insoluble', nom: 'Résidu insoluble', unite: '%' },
      { id: 'teneur_chlour', nom: 'Teneur en chlour', unite: '%' },
      { id: 'pouzzolanicite', nom: 'Pouzzolanicité', unite: '' },
      { id: 'pouzzolanicite_supp', nom: 'Pouzzolanicité (SR)', unite: '' }
    ]
  };

  // Complete mock details for all parameters
  const mockDetails = {
    // Mechanical properties
    resistance_2j: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "42.5 R", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM I", type_code: "CEM I", classe: "52.5 N", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "42.5 R", resistance_min: "20.0", resistance_max: null, garantie: "18.0" },
      { famille_code: "CEM II", type_code: "CEM II/B-S", classe: "32.5 R", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "42.5 N", resistance_min: "10.0", resistance_max: null, garantie: "8.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: null, resistance_max: null, garantie: null }
    ],
    resistance_7j: [
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM III", type_code: "CEM III/B", classe: "32.5 L", resistance_min: "12.0", resistance_max: null, garantie: "10.0" },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "32.5 N", resistance_min: "16.0", resistance_max: null, garantie: "14.0" }
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
      { famille_code: "CEM V", type_code: "CEM V/B", classe: "32.5 R", resistance_min: "32.5", resistance_max: "52.5", garantie: "30.0" }
    ],
    
    // Physical properties
    temps_debut_prise: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: "45", resistance_max: null, garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: "45", resistance_max: null, garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: "45", resistance_max: null, garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: "45", resistance_max: null, garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: "45", resistance_max: null, garantie: null }
    ],
    stabilite: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: null, resistance_max: "10", garantie: null }
    ],
    chaleur_hydratation: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: null, resistance_max: "270", garantie: null }
    ],
    
    // Chemical properties
    SO3: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "3.5", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "3.5", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "3.5", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "3.5", garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: null, resistance_max: "3.5", garantie: null }
    ],
    SO3_supp: [
      { famille_code: "CEM I", type_code: "CEM I-SR", classe: "Tous", resistance_min: null, resistance_max: "3.0", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-SR", classe: "Tous", resistance_min: null, resistance_max: "3.0", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III-SR", classe: "Tous", resistance_min: null, resistance_max: "3.0", garantie: null }
    ],
    C3A: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "8.0", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "8.0", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "8.0", garantie: null }
    ],
    pert_au_feu: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null }
    ],
    residu_insoluble: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null }
    ],
    teneur_chlour: [
      { famille_code: "CEM I", type_code: "CEM I", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: null },
      { famille_code: "CEM II", type_code: "CEM II/A-S", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: null },
      { famille_code: "CEM III", type_code: "CEM III/A", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: null },
      { famille_code: "CEM V", type_code: "CEM V/A", classe: "Tous", resistance_min: null, resistance_max: "0.1", garantie: null }
    ],
    pouzzolanicite: [
      { famille_code: "CEM IV", type_code: "CEM IV/A", classe: "Tous", resistance_min: null, resistance_max: "10.0", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/B", classe: "Tous", resistance_min: null, resistance_max: "10.0", garantie: null }
    ],
    pouzzolanicite_supp: [
      { famille_code: "CEM IV", type_code: "CEM IV/A-SR", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null },
      { famille_code: "CEM IV", type_code: "CEM IV/B-SR", classe: "Tous", resistance_min: null, resistance_max: "5.0", garantie: null }
    ]
  };

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      if (USE_MOCK_DATA) {
        setCategories(mockCategories);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        console.log("Categories data:", data);
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Erreur lors du chargement des catégories. Utilisation des données de démonstration.");
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch parameters based on selected category
  useEffect(() => {
    const fetchParameters = async () => {
      if (!selectedCategory) return;
      
      if (USE_MOCK_DATA) {
        setParameters(mockParameters[selectedCategory] || []);
        setParamLoading(false);
        return;
      }

      try {
        setParamLoading(true);
        setError("");
        setSelectedParameter(null);
        setParameterDetails([]);

        let endpoint = '';
        switch(selectedCategory) {
          case 'mecanique':
            endpoint = '/api/proprietes/mecaniques';
            break;
          case 'physique':
            endpoint = '/api/proprietes/physiques';
            break;
          case 'chimique':
            endpoint = '/api/proprietes/chimiques';
            break;
          default:
            return;
        }

        console.log("Fetching parameters from:", endpoint);
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error('Failed to fetch parameters');
        const data = await response.json();
        console.log("Parameters data:", data);
        setParameters(data);
        
      } catch (err) {
        console.error("Error fetching parameters:", err);
        setError("Erreur lors du chargement des paramètres. Utilisation des données de démonstration.");
        setParameters(mockParameters[selectedCategory] || []);
      } finally {
        setParamLoading(false);
      }
    };

    fetchParameters();
  }, [selectedCategory]);

  // Fetch parameter details when a parameter is selected
  useEffect(() => {
    const fetchParameterDetails = async () => {
      if (!selectedParameter) return;

      if (USE_MOCK_DATA) {
        setParameterDetails(mockDetails[selectedParameter] || []);
        setDetailsLoading(false);
        return;
      }

      try {
        setDetailsLoading(true);
        let endpoint = '';
        
        switch(selectedCategory) {
          case 'mecanique':
            endpoint = `/api/proprietes/mecaniques/details/${selectedParameter}`;
            break;
          case 'physique':
            endpoint = `/api/proprietes/physiques/details/${selectedParameter}`;
            break;
          case 'chimique':
            endpoint = `/api/proprietes/chimiques/details/${selectedParameter}`;
            break;
          default:
            return;
        }

        console.log("Fetching details from:", endpoint);
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error('Failed to fetch parameter details');
        const data = await response.json();
        console.log("Parameter details:", data);
        setParameterDetails(data);
        
      } catch (err) {
        console.error("Error fetching parameter details:", err);
        setError("Erreur lors du chargement des détails. Utilisation des données de démonstration.");
        setParameterDetails(mockDetails[selectedParameter] || []);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchParameterDetails();
  }, [selectedParameter, selectedCategory]);

  // Format category names for display
  const formatCategoryName = (name) => {
    const names = {
      mecanique: "Mécanique",
      physique: "Physique",
      chimique: "Chimique"
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

        {USE_MOCK_DATA && (
          <div className="demo-notice">
            Mode démonstration: données simulées
          </div>
        )}

        {/* Category selection with radio inputs */}
        <div className="category-selection">
          <h2>Sélectionnez une catégorie:</h2>
          <div className="category-radios">
            {categories.map((category) => {
              // Extract the category name
              const categoryName = category.nom || category.name || category.category_name || category.id || "";
              const formattedName = formatCategoryName(categoryName);
              const categoryId = category.id || categoryName;
              
              return (
                <div key={categoryId} className="radio-option">
                  <input
                    type="radio"
                    id={categoryId}
                    name="category"
                    value={categoryName}
                    checked={selectedCategory === categoryName}
                    onChange={() => setSelectedCategory(categoryName)}
                    disabled={!categoryName}
                  />
                  <label htmlFor={categoryId}>{formattedName}</label>
                </div>
              );
            })}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Parameters list */}
        <div className="parameters-list">
          <h2>Paramètres {formatCategoryName(selectedCategory)}</h2>
          
          {paramLoading ? (
            <div className="loading">Chargement des paramètres...</div>
          ) : parameters.length === 0 ? (
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
            <h3>
              {parameters.find(p => p.id === selectedParameter)?.nom}
              {parameters.find(p => p.id === selectedParameter)?.unite && 
                ` (${parameters.find(p => p.id === selectedParameter)?.unite})`
              }
            </h3>

            {detailsLoading ? (
              <div className="loading">Chargement des détails...</div>
            ) : parameterDetails.length === 0 ? (
              <div className="no-data">Aucune donnée disponible pour ce paramètre.</div>
            ) : (
              <div className="table-container">
                <table className="parameter-table">
                  <thead>
                    <tr>
                      <th>Famille</th>
                      <th>Type</th>
                      <th>Classe</th>
                      <th>Résistance Min</th>
                      <th>Résistance Max</th>
                      <th>Valeur Garantie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameterDetails.map((detail, idx) => (
                      <tr key={idx}>
                        <td>{detail.famille_code || "—"}</td>
                        <td>{detail.type_code || "—"}</td>
                        <td>{detail.classe || "—"}</td>
                        <td>{detail.resistance_min ?? detail.limit_inf ?? "—"}</td>
                        <td>{detail.resistance_max ?? detail.limit_sup ?? "—"}</td>
                        <td className="garantie-cell">
                          {detail.garantie ?? detail.limit_garanti ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}