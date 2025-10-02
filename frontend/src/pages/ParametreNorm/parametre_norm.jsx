import React, { useEffect, useState } from "react";
import "./parametre_norm.css";
import Header from "../../components/Header/Header";

export default function ParametreNorm() {
  const [selectedCategory, setSelectedCategory] = useState("mecanique");
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [parameterDetails, setParameterDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [parNormData, setParNormData] = useState({});
  const [conformiteData, setConformiteData] = useState({});

  // Ajout parameter states
  const [selectedCas, setSelectedCas] = useState("");
  const [ajoutRows, setAjoutRows] = useState([]);

  // Mock Data
  const mockCategories = [
    { id: "mecanique", nom: "mecanique" },
    { id: "physique", nom: "physique" },
    { id: "chimique", nom: "chimique" }
  ];

  const mockParameters = { 
    mecanique: [
      { id: "resistance_2j", nom: "Résistance à 2 jours", unite: "MPa", type_controle: "mesure" },
      { id: "resistance_7j", nom: "Résistance à 7 jours", unite: "MPa", type_controle: "mesure" },
      { id: "resistance_28j", nom: "Résistance à 28 jours", unite: "MPa", type_controle: "mesure" },
    ],
    physique: [
      { id: "temps_debut_prise", nom: "Temps de début de prise", unite: "min", type_controle: "attribut" },
      { id: "stabilite", nom: "Stabilité (expansion)", unite: "mm", type_controle: "attribut" },
      { id: "chaleur_hydratation", nom: "Chaleur d'hydratation", unite: "J/g", type_controle: "attribut" },
    ],
    chimique: [
      { id: "pert_au_feu", nom: "Perte au feu", unite: "%", type_controle: "attribut" },
      { id: "residu_insoluble", nom: "Résidu insoluble", unite: "%", type_controle: "attribut" },
      { id: "SO3", nom: "Teneur en sulfate (SO₃)", unite: "%", type_controle: "attribut" },
      { id: "teneur_chlour", nom: "Teneur en chlorure", unite: "%", type_controle: "attribut" },
      { id: "C3A", nom: "C3A dans le clinker", unite: "%", type_controle: "attribut" },
      { id: "pouzzolanicite", nom: "Pouzzolanicité", unite: "", type_controle: "attribut" },
      { id: "Ajout", nom: "L'ajout", unite: null, type_controle: "attribut" }
    ]
  };

  // Load JSON data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch parnorm.json
        const parnormResponse = await fetch("/Data/parnorm.json");
        if (!parnormResponse.ok) throw new Error("Failed to load parnorm data");
        const parnormData = await parnormResponse.json();
        setParNormData(parnormData);

        // Fetch conformite.json
        const conformiteResponse = await fetch("/Data/conformite.json");
        if (!conformiteResponse.ok) throw new Error("Failed to load conformite data");
        const conformiteData = await conformiteResponse.json();
        setConformiteData(conformiteData);
        
      } catch (error) {
        console.error("Error loading JSON:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    const params = mockParameters[selectedCategory] || [];
    setParameters(params);
    if (params.length > 0) setSelectedParameter(params[0].id);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedParameter && selectedParameter !== "Ajout" && parNormData[selectedParameter]) {
      const details = [];
      const paramData = parNormData[selectedParameter];
      
      Object.entries(paramData).forEach(([famille_code, types]) => {
        Object.entries(types).forEach(([type_code, classes]) => {
          classes.forEach(classData => {
            details.push({
              famille_code,
              type_code,
              classe: classData.classe,
              limit_inf: classData.limit_inf,
              limit_max: classData.limit_max,
              garantie: classData.garantie
            });
          });
        });
      });
      
      setParameterDetails(details);
    } else {
      setParameterDetails([]);
    }
  }, [selectedParameter, parNormData]);

  // Helper function to check if current parameter is Ajout
  const isAjouteParameter = () => selectedParameter === "Ajout";

  // Handler for Ajout cas selection
  const handleCasSelect = (cas) => {
    setSelectedCas(cas);

    if (cas && parNormData.ajout && parNormData.ajout[cas]) {
      const casData = parNormData.ajout[cas];
      const newRows = [];
      
      // Loop through all properties in casData (excluding description)
      Object.entries(casData).forEach(([key, value]) => {
        // Skip the description property
        if (key !== "description" && typeof value === "object" && value.limitInf !== undefined) {
          newRows.push({
            cas,
            cement: key,
            limitInf: value.limitInf,
            limitSup: value.limitSup
          });
        }
      });
      
      setAjoutRows(newRows);
    } else {
      setAjoutRows([]);
    }
  };

  // Enhanced search function with famille and type mapping
// Enhanced search function with flexible matching for all CEM types
const getFilteredParameterDetails = () => {
  if (!parameterDetails.length) return [];
  if (!searchTerm.trim()) return parameterDetails;
  
  const term = searchTerm.toLowerCase().trim();
  
  // Create a mapping for common CEM variations
  const cemMappings = {
    'cem1': 'CEM I',
    'cemi': 'CEM I',
    'cem2': 'CEM II',
    'cemii': 'CEM II',
    'cem3': 'CEM III',
    'cemiii': 'CEM III',
    'cem4': 'CEM IV',
    'cemiv': 'CEM IV',
    'cem5': 'CEM V',
    'cemv': 'CEM V',
  };

  return parameterDetails.filter(item => {
    // Remove spaces and special characters for flexible matching
    const normalizeText = (text) => {
      return text.toLowerCase().replace(/[\s\-_]/g, '');
    };

    const normalizedTerm = normalizeText(term);
    
    // Check if the term matches any CEM variation
    const mappedCem = cemMappings[normalizedTerm];
    if (mappedCem) {
      // If it matches a CEM variation, check if item matches this CEM type
      const normalizedFamille = normalizeText(item.famille_code || '');
      const normalizedType = normalizeText(item.type_code || '');
      
      return normalizedFamille.includes(normalizeText(mappedCem)) || 
             normalizedType.includes(normalizeText(mappedCem));
    }

    // Basic search in existing fields with flexible matching
    const basicMatch = 
      normalizeText(item.famille_code || '').includes(normalizedTerm) ||
      normalizeText(item.type_code || '').includes(normalizedTerm) ||
      normalizeText(item.classe || '').includes(normalizedTerm);

    if (basicMatch) return true;

    // Enhanced search using conformite data with flexible matching
    if (conformiteData.familles_ciment && conformiteData.types_ciment) {
      // Search in famille names with flexible matching
      const familleMatch = conformiteData.familles_ciment.some(famille => {
        const normalizedFamilleCode = normalizeText(famille.code);
        const normalizedFamilleNom = normalizeText(famille.nom);
        
        return (famille.code === item.famille_code && 
          (normalizedFamilleNom.includes(normalizedTerm) || 
           normalizedFamilleCode.includes(normalizedTerm)));
      });

      if (familleMatch) return true;

      // Search in type descriptions with flexible matching
      const typeMatch = conformiteData.types_ciment.some(type => {
        const normalizedTypeCode = normalizeText(type.code);
        const normalizedTypeDesc = normalizeText(type.description);
        
        return (type.code === item.type_code && 
          (normalizedTypeDesc.includes(normalizedTerm) || 
           normalizedTypeCode.includes(normalizedTerm) ||
           (type.nom && normalizeText(type.nom).includes(normalizedTerm))));
      });

      return typeMatch;
    }

    return false;
  });
};

  // Get search suggestions based on conformite data
  const getSearchSuggestions = () => {
    if (!searchTerm.trim() || !conformiteData.familles_ciment || !conformiteData.types_ciment) return [];
    
    const term = searchTerm.toLowerCase().trim();
    const suggestions = new Set();

    // Add famille suggestions
    conformiteData.familles_ciment.forEach(famille => {
      if (famille.nom.toLowerCase().includes(term) || famille.code.toLowerCase().includes(term)) {
        suggestions.add(`${famille.code} - ${famille.nom}`);
      }
    });

    // Add type suggestions
    conformiteData.types_ciment.forEach(type => {
      if (type.description.toLowerCase().includes(term) || type.code.toLowerCase().includes(term)) {
        suggestions.add(`${type.code} - ${type.description}`);
      }
    });

    // Add existing parameter details suggestions
    parameterDetails.forEach(item => {
      if (item.famille_code?.toLowerCase().includes(term)) {
        suggestions.add(item.famille_code);
      }
      if (item.type_code?.toLowerCase().includes(term)) {
        suggestions.add(item.type_code);
      }
      if (item.classe?.toLowerCase().includes(term)) {
        suggestions.add(item.classe);
      }
    });

    return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
  };

  const formatCategoryName = (name) => {
    const names = { mecanique: "Mécanique", physique: "Physique", chimique: "Chimique" };
    return names[name] || name;
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get famille name from code
  const getFamilleName = (familleCode) => {
    if (!conformiteData.familles_ciment) return familleCode;
    const famille = conformiteData.familles_ciment.find(f => f.code === familleCode);
    return famille ? famille.nom : familleCode;
  };

  // Get type description from code
  const getTypeDescription = (typeCode) => {
    if (!conformiteData.types_ciment) return typeCode;
    const type = conformiteData.types_ciment.find(t => t.code === typeCode);
    return type ? type.description : typeCode;
  };

  const paramInfo = parameters.find(p => p.id === selectedParameter);

  if (loading) return <div className="loading">Chargement des données...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="parametreNormPage">
      <Header />
      <main className="content">
        <h1>Paramètres Norme</h1>
        <div className="content-layout">
          <div className="content-left">
            <div className="category-selection">
              <h2>Types Exigences</h2>
              <div className="category-radios">
                {categories.map((category) => (
                  <div key={category.id} className="radio-option">
                    <input
                      type="radio"
                      id={category.id}
                      name="category"
                      value={category.nom}
                      checked={selectedCategory === category.nom}
                      onChange={() => setSelectedCategory(category.nom)}
                    />
                    <label htmlFor={category.id}>{formatCategoryName(category.nom)}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="parameters-list">
              <h3>Proprietes de l'exigence</h3>
              {parameters.length === 0 ? (
                <p>Aucun paramètre trouvé</p>
              ) : (
                <>
                  <div className="parameter-buttons">
                    {parameters.map((param) => (
                      <button
                        key={param.id}
                        className={selectedParameter === param.id ? "active" : ""}
                        onClick={() => {
                          setSelectedParameter(param.id);
                          if (param.id !== "Ajout") {
                            setSelectedCas("");
                            setAjoutRows([]);
                          }
                        }}
                      >
                        {param.nom} {param.unite && `(${param.unite})`}
                      </button>
                    ))}
                  </div>

                  {/* Custom parameter table for "L'ajout" */}
                  {isAjouteParameter() && (
                    <div className="parameter-details-form">
                      {/* Cas selector */}
                      <div className="ajout-selector">
                        <label>Ajout: </label>
                        <select
                          value={selectedCas}
                          onChange={(e) => handleCasSelect(e.target.value)}
                        >
                          <option value="">-- Sélectionner un ajout --</option>
                          {parNormData.ajout && Object.entries(parNormData.ajout).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Table shown only if a cas is selected */}
                      {selectedCas && ajoutRows.length > 0 && (
                        <table className="parameter-table">
                          <thead>
                            <tr>
                              <th>Ciment</th>
                              <th>Limit Inf</th>
                              <th>Limit Sup</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ajoutRows.map((row, index) => (
                              <tr key={index}>
                                <td>{row.cement}</td>
                                <td>{row.limitInf}</td>
                                <td>{row.limitSup}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Main Table for other parameters */}
{/* Main Table for other parameters */}
{selectedParameter && parameterDetails.length > 0 && !isAjouteParameter() && (
  <div className="table-container">
    {/* Enhanced Search Bar */}
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="🔍 Rechercher par famille, type, description, classe..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="clear-search-btn"
            onClick={clearSearch}
            title="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <div className="search-results-info">
          {getFilteredParameterDetails().length} résultat(s) trouvé(s)
        </div>
      )}
    </div>

    <table className="parameter-table">
      <thead>
        <tr>
          <th>Famille</th>
          <th>Type</th>
          <th>Classe</th>
          <th>Limit Inf</th>
          <th>Limit Max</th>
          <th>Garantie</th>
          <th>Unité</th>
          <th>Évaluation</th>
        </tr>
      </thead>
      <tbody>
        {getFilteredParameterDetails().map((detail, index) => (
          <tr key={index}>
            <td>{detail.famille_code}</td>
            <td>{detail.type_code}</td>
            <td>{detail.classe}</td>
            <td>{detail.limit_inf ?? "-"}</td>
            <td>{detail.limit_max ?? "-"}</td>
            <td>{detail.garantie ?? "-"}</td>
            <td>{paramInfo?.unite || "-"}</td>
            <td>{paramInfo?.type_controle || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

                  {selectedParameter && parameterDetails.length === 0 && !isAjouteParameter() && (
                    <div className="no-data-message">
                      <p>Aucune donnée trouvée pour "{selectedParameter}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}