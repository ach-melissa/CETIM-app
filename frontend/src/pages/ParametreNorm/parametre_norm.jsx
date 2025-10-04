import React, { useEffect, useState } from "react";
import "./parametre_norm.css";
import Header from "../../components/Header/Header";

export default function ParametreNorm() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [parameterDetails, setParameterDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [parNormData, setParNormData] = useState({});
  
  // États pour l'ajout de nouvelles catégories/paramètres
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddParameter, setShowAddParameter] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showEditParameter, setShowEditParameter] = useState(false);
  const [showAddValue, setShowAddValue] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  
  const [newCategory, setNewCategory] = useState({ id: "", nom: "" });
  const [newParameter, setNewParameter] = useState({ 
    id: "", 
    nom: "", 
    unite: "", 
    type_controle: "mesure" 
  });
  const [newValue, setNewValue] = useState({
    famille_code: "",
    type_code: "",
    classe: "",
    limit_inf: "",
    limit_max: "",
    garantie: ""
  });
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingParameter, setEditingParameter] = useState(null);

  // États pour les menus déroulants
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [parameterMenuOpen, setParameterMenuOpen] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState(null);

  // États pour les listes déroulantes
  const [existingTypes, setExistingTypes] = useState([]);
  const [existingFamilles, setExistingFamilles] = useState([]);
  const [ajouts, setAjouts] = useState({});
  const [selectedAjout, setSelectedAjout] = useState(null);
  const [selectedCas, setSelectedCas] = useState("");
  const [ajoutRows, setAjoutRows] = useState([]);
  const [newAjout, setNewAjout] = useState({ id: "", description: "" });
  const [editingAjout, setEditingAjout] = useState(null);
  const [newCiment, setNewCiment] = useState({ cement: "", limitInf: "", limitSup: "" });
  const [editingCiment, setEditingCiment] = useState(null);
  const [ajoutsList, setAjoutsList] = useState([]);
  const [showAddAjout, setShowAddAjout] = useState(false);
  const [cementOptions] = useState(["CEM I", "CEM II", "CEM III", "CEM IV", "CEM V"]);
  const [newCementRow, setNewCementRow] = useState({ cement: "", limitInf: "", limitSup: "" });
  const [ajoutRowMenuOpen, setAjoutRowMenuOpen] = useState(null);
  const [ajoutListMenuOpen, setAjoutListMenuOpen] = useState(null);
  const [editingCementRow, setEditingCementRow] = useState(null);

  useEffect(() => {
    const fetchAjouts = async () => {
      const res = await fetch("http://localhost:5000/api/ajouts");
      const data = await res.json();
      setAjoutsList(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    };
    fetchAjouts();
  }, []);

  // Charger données depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Récupération catégories
        const catRes = await fetch("http://localhost:5000/api/categories");
        if (!catRes.ok) throw new Error("Erreur lors du chargement des catégories");
        const catData = await catRes.json();
        setCategories(catData);
        
        // Sélectionner la première catégorie par défaut
        if (catData.length > 0 && !selectedCategory) {
          setSelectedCategory(catData[0].id);
        }

        // Récupération données parnorm complètes
        const parnormResponse = await fetch("http://localhost:5000/api/parnorm");
        if (!parnormResponse.ok) throw new Error("Erreur chargement parnorm");
        const parnormData = await parnormResponse.json();
        setParNormData(parnormData);

        // Extraire les types et familles existants
        extractExistingTypesAndFamilles(parnormData);

      } catch (error) {
        console.error("Erreur API:", error);
        setError("Impossible de charger les données du serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extraire les types et familles existants des données
  const extractExistingTypesAndFamilles = (parnormData) => {
    const types = new Set();
    const familles = new Set();

    Object.values(parnormData).forEach(paramData => {
      Object.entries(paramData).forEach(([famille_code, typesData]) => {
        familles.add(famille_code);
        Object.keys(typesData).forEach(type_code => {
          types.add(type_code);
        });
      });
    });

    setExistingTypes(Array.from(types));
    setExistingFamilles(Array.from(familles));
  };

  // Charger les paramètres quand la catégorie change
  useEffect(() => {
    const fetchParameters = async () => {
      if (!selectedCategory) return;
      
      try {
        const paramRes = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}`);
        if (!paramRes.ok) throw new Error("Erreur lors du chargement des paramètres");
        const paramData = await paramRes.json();
        setParameters(paramData);
        
        // Sélectionner le premier paramètre par défaut
        if (paramData.length > 0) {
          setSelectedParameter(paramData[0].id);
        } else {
          setSelectedParameter(null);
          setParameterDetails([]);
        }
      } catch (error) {
        console.error("Erreur chargement paramètres:", error);
        setError("Erreur lors du chargement des paramètres");
      }
    };
    
    fetchParameters();
  }, [selectedCategory]);

  // Mettre à jour les détails du paramètre sélectionné
  useEffect(() => {
    if (selectedParameter && parNormData[selectedParameter]) {
      const details = [];
      const paramData = parNormData[selectedParameter];
      
      // Parcourir la structure des données du paramètre
      Object.entries(paramData).forEach(([famille_code, types]) => {
        Object.entries(types).forEach(([type_code, classes]) => {
          if (Array.isArray(classes)) {
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
          }
        });
      });
      setParameterDetails(details);
    } else {
      setParameterDetails([]);
    }
  }, [selectedParameter, parNormData]);

  // Gestion de l'ajout de catégorie
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les catégories
        const catRes = await fetch("http://localhost:5000/api/categories");
        const catData = await catRes.json();
        setCategories(catData);
        
        // Réinitialiser le formulaire
        setNewCategory({ id: "", nom: "" });
        setShowAddCategory(false);
        
        // Sélectionner la nouvelle catégorie
        setSelectedCategory(newCategory.id);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur ajout catégorie:", error);
      setError("Erreur lors de l'ajout de la catégorie");
    }
  };

  // Gestion de l'ajout de paramètre
  const handleAddParameter = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newParameter),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les paramètres
        const paramRes = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}`);
        const paramData = await paramRes.json();
        setParameters(paramData);
        
        // Réinitialiser le formulaire
        setNewParameter({ id: "", nom: "", unite: "", type_controle: "mesure" });
        setShowAddParameter(false);
        
        // Sélectionner le nouveau paramètre
        setSelectedParameter(newParameter.id);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur ajout paramètre:", error);
      setError("Erreur lors de l'ajout du paramètre");
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les catégories
        const catRes = await fetch("http://localhost:5000/api/categories");
        const catData = await catRes.json();
        setCategories(catData);
        
        // Sélectionner une autre catégorie si celle supprimée était sélectionnée
        if (selectedCategory === categoryId && catData.length > 0) {
          setSelectedCategory(catData[0].id);
        } else if (catData.length === 0) {
          setSelectedCategory("");
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur suppression catégorie:", error);
      setError("Erreur lors de la suppression de la catégorie");
    }
  };

  // Modifier une catégorie
  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nom: editingCategory.nom }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les catégories
        const catRes = await fetch("http://localhost:5000/api/categories");
        const catData = await catRes.json();
        setCategories(catData);
        
        setShowEditCategory(false);
        setEditingCategory(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur modification catégorie:", error);
      setError("Erreur lors de la modification de la catégorie");
    }
  };

  // Supprimer un paramètre
  const handleDeleteParameter = async (paramId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce paramètre ?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}/${paramId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les paramètres
        const paramRes = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}`);
        const paramData = await paramRes.json();
        setParameters(paramData);
        
        // Sélectionner un autre paramètre si celui supprimé était sélectionné
        if (selectedParameter === paramId && paramData.length > 0) {
          setSelectedParameter(paramData[0].id);
        } else if (paramData.length === 0) {
          setSelectedParameter(null);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur suppression paramètre:", error);
      setError("Erreur lors de la suppression du paramètre");
    }
  };

  // Modifier un paramètre
  const handleEditParameter = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}/${editingParameter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingParameter),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les paramètres
        const paramRes = await fetch(`http://localhost:5000/api/parameters/${selectedCategory}`);
        const paramData = await paramRes.json();
        setParameters(paramData);
        
        setShowEditParameter(false);
        setEditingParameter(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur modification paramètre:", error);
      setError("Erreur lors de la modification du paramètre");
    }
  };

  // Ajouter une nouvelle valeur
  const handleAddValue = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/parameters/${selectedParameter}/values`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          famille_code: newValue.famille_code,
          type_code: newValue.type_code,
          classe_data: {
            classe: newValue.classe,
            limit_inf: newValue.limit_inf || null,
            limit_max: newValue.limit_max || null,
            garantie: newValue.garantie || null
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les données
        const parnormResponse = await fetch("http://localhost:5000/api/parnorm");
        const parnormData = await parnormResponse.json();
        setParNormData(parnormData);
        
        setNewValue({
          famille_code: "",
          type_code: "",
          classe: "",
          limit_inf: "",
          limit_max: "",
          garantie: ""
        });
        setShowAddValue(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur ajout valeur:", error);
      setError("Erreur lors de l'ajout de la valeur");
    }
  };

  // Modifier une valeur existante
  const handleEditValue = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/parameters/${selectedParameter}/values`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          famille_code: editingValue.famille_code,
          type_code: editingValue.type_code,
          old_classe: editingValue.old_classe,
          new_classe_data: {
            classe: editingValue.classe,
            limit_inf: editingValue.limit_inf || null,
            limit_max: editingValue.limit_max || null,
            garantie: editingValue.garantie || null
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les données
        const parnormResponse = await fetch("http://localhost:5000/api/parnorm");
        const parnormData = await parnormResponse.json();
        setParNormData(parnormData);
        
        setEditingValue(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur modification valeur:", error);
      setError("Erreur lors de la modification de la valeur");
    }
  };

  // Supprimer une valeur
  const handleDeleteValue = async (detail) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette valeur ?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/parameters/${selectedParameter}/values`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          famille_code: detail.famille_code,
          type_code: detail.type_code,
          classe: detail.classe
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les données
        const parnormResponse = await fetch("http://localhost:5000/api/parnorm");
        const parnormData = await parnormResponse.json();
        setParNormData(parnormData);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur suppression valeur:", error);
      setError("Erreur lors de la suppression de la valeur");
    }
  };

  // Fonction de recherche améliorée
  const getFilteredParameterDetails = () => {
    if (!parameterDetails.length) return [];
    if (!searchTerm.trim()) return parameterDetails;
    
    const term = searchTerm.toLowerCase().trim();
    
    return parameterDetails.filter(item => {
      const famille = (item.famille_code || "").toLowerCase();
      const type = (item.type_code || "").toLowerCase();
      const classe = (item.classe || "").toLowerCase();
      
      // Recherche insensible à la casse et aux caractères spéciaux
      return famille.includes(term) || 
             type.includes(term) || 
             classe.includes(term) ||
             // Recherche approximative pour les nombres romains/normaux
             normalizeSearchText(famille).includes(normalizeSearchText(term)) ||
             normalizeSearchText(type).includes(normalizeSearchText(term)) ||
             normalizeSearchText(classe).includes(normalizeSearchText(term));
    });
  };

  // Normaliser le texte pour la recherche (gérer majuscules/minuscules, nombres romains)
  const normalizeSearchText = (text) => {
    return text
      .toLowerCase()
      .replace(/[ivxlcdm]/g, match => {
        // Simplification basique pour les nombres romains
        const romanMap = { i: '1', v: '5', x: '10', l: '50', c: '100', d: '500', m: '1000' };
        return romanMap[match] || match;
      })
      .replace(/[^a-z0-9]/g, ''); // Supprimer les caractères spéciaux
  };

  // Détecter automatiquement la famille basée sur le type sélectionné
  const detectFamilleFromType = (typeCode) => {
    // Logique simplifiée pour détecter la famille basée sur le type
    // Vous pouvez adapter cette logique selon vos besoins spécifiques
    if (typeCode.includes('CEM I')) return 'CEM I';
    if (typeCode.includes('CEM II')) return 'CEM II';
    if (typeCode.includes('CEM III')) return 'CEM III';
    if (typeCode.includes('CEM IV')) return 'CEM IV';
    if (typeCode.includes('CEM V')) return 'CEM V';
    return '';
  };

  // Gérer le changement de type dans le formulaire
  const handleTypeChange = (typeCode) => {
    setNewValue({
      ...newValue,
      type_code: typeCode,
      famille_code: detectFamilleFromType(typeCode)
    });
  };

  // Formater le nom de la catégorie
  const formatCategoryName = (name) => {
    const names = { 
      mecanique: "Mécanique", 
      physique: "Physique", 
      chimique: "Chimique" 
    };
    return names[name] || name;
  };

  // Informations du paramètre sélectionné
  const paramInfo = parameters.find(p => p.id === selectedParameter);

  // Gestion des ajouts
  const isAjouteParameter = () => selectedParameter === "Ajout";

  const handleCasSelect = (cas) => {
    setSelectedCas(cas);

    if (cas && parNormData.ajout && parNormData.ajout[cas]) {
      const casData = parNormData.ajout[cas];
      const newRows = [];

      Object.entries(casData).forEach(([key, value]) => {
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

  // Fonctions pour gérer les ajouts
  const handleAddAjout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/ajouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAjout),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les ajouts
        const res = await fetch("http://localhost:5000/api/ajouts");
        const data = await res.json();
        setAjoutsList(Object.entries(data).map(([id, val]) => ({ id, ...val })));
        
        setNewAjout({ id: "", description: "" });
        setShowAddAjout(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur ajout ajout:", error);
      setError("Erreur lors de l'ajout de l'ajout");
    }
  };

  const handleEditAjout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/ajouts/${editingAjout.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingAjout),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les ajouts
        const res = await fetch("http://localhost:5000/api/ajouts");
        const data = await res.json();
        setAjoutsList(Object.entries(data).map(([id, val]) => ({ id, ...val })));
        
        setEditingAjout(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur modification ajout:", error);
      setError("Erreur lors de la modification de l'ajout");
    }
  };

  const handleDeleteAjout = async (ajoutId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet ajout ?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ajouts/${ajoutId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (result.success) {
        // Recharger les ajouts
        const res = await fetch("http://localhost:5000/api/ajouts");
        const data = await res.json();
        setAjoutsList(Object.entries(data).map(([id, val]) => ({ id, ...val })));
        
        if (selectedCas === ajoutId) {
          setSelectedCas("");
          setAjoutRows([]);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur suppression ajout:", error);
      setError("Erreur lors de la suppression de l'ajout");
    }
  };

  const handleAddCementRow = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ajouts/${selectedCas}/ciments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCementRow),
      });

      const result = await response.json();
      
      if (result.success) {
        handleCasSelect(selectedCas); // reload
        setNewCementRow({ cement: "", limitInf: "", limitSup: "" });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur ajout ciment:", error);
      setError("Erreur lors de l'ajout du ciment");
    }
  };

  const handleEditCementRow = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/ajouts/${selectedCas}/ciments/${editingCementRow.oldCement}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cement: editingCementRow.cement,
          limitInf: editingCementRow.limitInf,
          limitSup: editingCementRow.limitSup
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        handleCasSelect(selectedCas); // reload
        setEditingCementRow(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur modification ciment:", error);
      setError("Erreur lors de la modification du ciment");
    }
  };

  const handleDeleteCementRow = async (cement) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce ciment ?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ajouts/${selectedCas}/ciments/${cement}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (result.success) {
        handleCasSelect(selectedCas); // reload
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Erreur suppression ciment:", error);
      setError("Erreur lors de la suppression du ciment");
    }
  };

  if (loading) return <div className="loading">Chargement des données...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="parametreNormPage">
      <Header />
      <main className="content">
        <h1>Paramètres Norme</h1>
        
        {/* Formulaire d'ajout de catégorie */}
        {showAddCategory && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Ajouter une nouvelle catégorie</h3>
              <form onSubmit={handleAddCategory}>
                <div className="form-group">
                  <label>ID de la catégorie:</label>
                  <input
                    type="text"
                    value={newCategory.id}
                    onChange={(e) => setNewCategory({...newCategory, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom de la catégorie:</label>
                  <input
                    type="text"
                    value={newCategory.nom}
                    onChange={(e) => setNewCategory({...newCategory, nom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Ajouter</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowAddCategory(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire de modification de catégorie */}
        {showEditCategory && editingCategory && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Modifier la catégorie</h3>
              <form onSubmit={handleEditCategory}>
                <div className="form-group">
                  <label>ID de la catégorie:</label>
                  <input
                    type="text"
                    value={editingCategory.id}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Nom de la catégorie:</label>
                  <input
                    type="text"
                    value={editingCategory.nom}
                    onChange={(e) => setEditingCategory({...editingCategory, nom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Modifier</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowEditCategory(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout de paramètre */}
        {showAddParameter && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Ajouter un nouveau paramètre</h3>
              <form onSubmit={handleAddParameter}>
                <div className="form-group">
                  <label>ID du paramètre:</label>
                  <input
                    type="text"
                    value={newParameter.id}
                    onChange={(e) => setNewParameter({...newParameter, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom du paramètre:</label>
                  <input
                    type="text"
                    value={newParameter.nom}
                    onChange={(e) => setNewParameter({...newParameter, nom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unité:</label>
                  <input
                    type="text"
                    value={newParameter.unite}
                    onChange={(e) => setNewParameter({...newParameter, unite: e.target.value})}
                    placeholder="ex: MPa, %, min"
                  />
                </div>
                <div className="form-group">
                  <label>Type de contrôle:</label>
                  <select
                    value={newParameter.type_controle}
                    onChange={(e) => setNewParameter({...newParameter, type_controle: e.target.value})}
                  >
                    <option value="mesure">Mesure</option>
                    <option value="attribut">Attribut</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Ajouter</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowAddParameter(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire de modification de paramètre */}
        {showEditParameter && editingParameter && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Modifier le paramètre</h3>
              <form onSubmit={handleEditParameter}>
                <div className="form-group">
                  <label>ID du paramètre:</label>
                  <input
                    type="text"
                    value={editingParameter.id}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Nom du paramètre:</label>
                  <input
                    type="text"
                    value={editingParameter.nom}
                    onChange={(e) => setEditingParameter({...editingParameter, nom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unité:</label>
                  <input
                    type="text"
                    value={editingParameter.unite}
                    onChange={(e) => setEditingParameter({...editingParameter, unite: e.target.value})}
                    placeholder="ex: MPa, %, min"
                  />
                </div>
                <div className="form-group">
                  <label>Type de contrôle:</label>
                  <select
                    value={editingParameter.type_controle}
                    onChange={(e) => setEditingParameter({...editingParameter, type_controle: e.target.value})}
                  >
                    <option value="mesure">Mesure</option>
                    <option value="attribut">Attribut</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Modifier</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowEditParameter(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout de valeur */}
        {showAddValue && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Ajouter une nouvelle valeur</h3>
              <form onSubmit={handleAddValue}>
                <div className="form-group">
                  <label>Famille:</label>
                  <input
                    type="text"
                    value={newValue.famille_code}
                    onChange={(e) => setNewValue({...newValue, famille_code: e.target.value})}
                    required
                    placeholder="ex: CEM I"
                    disabled // Désactivé car détecté automatiquement
                  />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <select
                    value={newValue.type_code}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {existingTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Classe:</label>
                  <input
                    type="text"
                    value={newValue.classe}
                    onChange={(e) => setNewValue({...newValue, classe: e.target.value})}
                    required
                    placeholder="ex: 32.5 R"
                  />
                </div>
                <div className="form-group">
                  <label>Limit Inf:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newValue.limit_inf}
                    onChange={(e) => setNewValue({...newValue, limit_inf: e.target.value})}
                    placeholder="ex: 10"
                  />
                </div>
                <div className="form-group">
                  <label>Limit Max:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newValue.limit_max}
                    onChange={(e) => setNewValue({...newValue, limit_max: e.target.value})}
                    placeholder="ex: 20"
                  />
                </div>
                <div className="form-group">
                  <label>Garantie:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newValue.garantie}
                    onChange={(e) => setNewValue({...newValue, garantie: e.target.value})}
                    placeholder="ex: 8"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Ajouter</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowAddValue(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire de modification de valeur */}
        {editingValue && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Modifier la valeur</h3>
              <form onSubmit={handleEditValue}>
                <div className="form-group">
                  <label>Famille:</label>
                  <input
                    type="text"
                    value={editingValue.famille_code}
                    onChange={(e) => setEditingValue({...editingValue, famille_code: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type:</label>
                  <input
                    type="text"
                    value={editingValue.type_code}
                    onChange={(e) => setEditingValue({...editingValue, type_code: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Classe:</label>
                  <input
                    type="text"
                    value={editingValue.classe}
                    onChange={(e) => setEditingValue({...editingValue, classe: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Limit Inf:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingValue.limit_inf}
                    onChange={(e) => setEditingValue({...editingValue, limit_inf: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Limit Max:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingValue.limit_max}
                    onChange={(e) => setEditingValue({...editingValue, limit_max: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Garantie:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingValue.garantie}
                    onChange={(e) => setEditingValue({...editingValue, garantie: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Modifier</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setEditingValue(null)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout d'ajout */}
        {showAddAjout && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Nouvel Ajout</h3>
              <form onSubmit={handleAddAjout}>
                <div className="form-group">
                  <label>ID:</label>
                  <input
                    type="text"
                    value={newAjout.id}
                    onChange={(e) => setNewAjout({...newAjout, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <input
                    type="text"
                    value={newAjout.description}
                    onChange={(e) => setNewAjout({...newAjout, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Ajouter</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowAddAjout(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire de modification d'ajout */}
        {editingAjout && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Modifier l'Ajout</h3>
              <form onSubmit={handleEditAjout}>
                <div className="form-group">
                  <label>ID:</label>
                  <input
                    type="text"
                    value={editingAjout.id}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <input
                    type="text"
                    value={editingAjout.description}
                    onChange={(e) => setEditingAjout({...editingAjout, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Modifier</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setEditingAjout(null)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Formulaire de modification de ciment */}
        {editingCementRow && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Modifier le Ciment</h3>
              <form onSubmit={handleEditCementRow}>
                <div className="form-group">
                  <label>Ciment:</label>
                  <select
                    value={editingCementRow.cement}
                    onChange={(e) => setEditingCementRow({...editingCementRow, cement: e.target.value})}
                    required
                  >
                    <option value="">-- Choisir Ciment --</option>
                    {cementOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Limit Inf:</label>
                  <input
                    type="number"
                    value={editingCementRow.limitInf}
                    onChange={(e) => setEditingCementRow({...editingCementRow, limitInf: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Limit Sup:</label>
                  <input
                    type="number"
                    value={editingCementRow.limitSup}
                    onChange={(e) => setEditingCementRow({...editingCementRow, limitSup: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Modifier</button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setEditingCementRow(null)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="content-layout">
          <div className="content-left">
            <div className="category-selection">
              <div className="section-header">
                <div className="section-title-with-menu">
                  <h2>Types Exigences</h2>
                  <div className="dropdown-menu-container">
                    <button 
                      className="three-dots-btn"
                      onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                    >
                      ⋮
                    </button>
                    {categoryMenuOpen && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setShowAddCategory(true);
                            setCategoryMenuOpen(false);
                          }}
                        >
                          Ajouter
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            const category = categories.find(cat => cat.id === selectedCategory);
                            if (category) {
                              setEditingCategory({...category});
                              setShowEditCategory(true);
                            }
                            setCategoryMenuOpen(false);
                          }}
                          disabled={!selectedCategory}
                        >
                          Modifier
                        </button>
                        <button 
                          className="dropdown-item delete"
                          onClick={() => {
                            handleDeleteCategory(selectedCategory);
                            setCategoryMenuOpen(false);
                          }}
                          disabled={!selectedCategory}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="category-radios">
                {categories.map((category) => (
                  <div key={category.id} className="radio-option">
                    <input
                      type="radio"
                      id={category.id}
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                    />
                    <label htmlFor={category.id}>
                      {formatCategoryName(category.nom)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="parameters-list">
              <div className="section-header">
                <div className="section-title-with-menu">
                  <h3>Propriétés de l'exigence</h3>
                  <div className="dropdown-menu-container">
                    <button 
                      className="three-dots-btn"
                      onClick={() => setParameterMenuOpen(!parameterMenuOpen)}
                      disabled={!selectedCategory}
                    >
                      ⋮
                    </button>
                    {parameterMenuOpen && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setShowAddParameter(true);
                            setParameterMenuOpen(false);
                          }}
                        >
                          Ajouter
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            const parameter = parameters.find(param => param.id === selectedParameter);
                            if (parameter) {
                              setEditingParameter({...parameter});
                              setShowEditParameter(true);
                            }
                            setParameterMenuOpen(false);
                          }}
                          disabled={!selectedParameter}
                        >
                          Modifier
                        </button>
                        <button 
                          className="dropdown-item delete"
                          onClick={() => {
                            handleDeleteParameter(selectedParameter);
                            setParameterMenuOpen(false);
                          }}
                          disabled={!selectedParameter}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {parameters.length === 0 ? (
                <div className="no-data">
                  <p>Aucun paramètre trouvé pour cette catégorie</p>
                  <button 
                    className="btn-link"
                    onClick={() => setShowAddParameter(true)}
                  >
                    Ajouter le premier paramètre
                  </button>
                </div>
              ) : (
                <>
                  <div className="parameter-buttons">
                    {parameters.map((param) => (
                      <button
                        key={param.id}
                        className={selectedParameter === param.id ? "active" : ""}
                        onClick={() => setSelectedParameter(param.id)}
                      >
                        {param.nom} {param.unite && `(${param.unite})`}
                      </button>
                    ))}
                  </div>

                  {/* Custom parameter table for "L'ajout" */}
                  {isAjouteParameter() && (
                    <div className="ajout-section">
                      <h3>Gestion des Ajouts</h3>
                      <button onClick={() => setShowAddAjout(true)} className="btn-success">
                        + Nouvel Ajout
                      </button>

                      {/* Liste des ajouts existants avec menu trois points */}
                      <div className="ajouts-list">
                        <h4>Ajouts existants</h4>
                        {ajoutsList.map((aj) => (
                          <div key={aj.id} className="ajout-item">
                            <span>{aj.description}</span>
                            <div className="dropdown-menu-container">
                              <button 
                                className="three-dots-btn"
                                onClick={() => setAjoutListMenuOpen(ajoutListMenuOpen === aj.id ? null : aj.id)}
                              >
                                ⋮
                              </button>
                              {ajoutListMenuOpen === aj.id && (
                                <div className="dropdown-menu">
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => {
                                      setEditingAjout({...aj});
                                      setAjoutListMenuOpen(null);
                                    }}
                                  >
                                    Modifier
                                  </button>
                                  <button 
                                    className="dropdown-item delete"
                                    onClick={() => {
                                      handleDeleteAjout(aj.id);
                                      setAjoutListMenuOpen(null);
                                    }}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Select pour choisir un ajout */}
                      <div className="ajout-selector">
                        <label>Sélectionner un ajout: </label>
                        <select
                          value={selectedCas}
                          onChange={(e) => handleCasSelect(e.target.value)}
                        >
                          <option value="">-- Sélectionner un ajout --</option>
                          {ajoutsList.map((aj) => (
                            <option key={aj.id} value={aj.id}>{aj.description}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tableau des ciments - SEULEMENT quand un ajout est sélectionné */}
                      {selectedCas && (
                        <div className="cement-table">
                          <h4>Tableau des Ciments - {ajoutsList.find(aj => aj.id === selectedCas)?.description}</h4>
                          
                          {/* Tableau existant */}
                          <table>
                            <thead>
                              <tr>
                                <th>Ciment</th>
                                <th>Limit Inf</th>
                                <th>Limit Sup</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ajoutRows.map((row, i) => (
                                <tr key={i}>
                                  <td>{row.cement}</td>
                                  <td>{row.limitInf}</td>
                                  <td>{row.limitSup}</td>
                                  <td>
                                    <div className="dropdown-menu-container">
                                      <button 
                                        className="three-dots-btn"
                                        onClick={() => setAjoutRowMenuOpen(ajoutRowMenuOpen === i ? null : i)}
                                      >
                                        ⋮
                                      </button>
                                      {ajoutRowMenuOpen === i && (
                                        <div className="dropdown-menu">
                                          <button 
                                            className="dropdown-item"
                                            onClick={() => {
                                              setEditingCementRow({
                                                ...row,
                                                oldCement: row.cement
                                              });
                                              setAjoutRowMenuOpen(null);
                                            }}
                                          >
                                            Modifier
                                          </button>
                                          <button 
                                            className="dropdown-item delete"
                                            onClick={() => {
                                              handleDeleteCementRow(row.cement);
                                              setAjoutRowMenuOpen(null);
                                            }}
                                          >
                                            Supprimer
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Formulaire pour ajouter un nouveau ciment */}
                          <div className="add-cement-form">
                            <h4>Ajouter un nouveau ciment</h4>
                            <div className="form-row">
                              <select 
                                value={newCementRow.cement}
                                onChange={(e) => setNewCementRow({ ...newCementRow, cement: e.target.value })}
                              >
                                <option value="">-- Choisir Ciment --</option>
                                {cementOptions.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <input 
                                type="number" 
                                placeholder="Limit Inf"
                                value={newCementRow.limitInf}
                                onChange={(e) => setNewCementRow({ ...newCementRow, limitInf: e.target.value })}
                              />
                              <input 
                                type="number" 
                                placeholder="Limit Sup"
                                value={newCementRow.limitSup}
                                onChange={(e) => setNewCementRow({ ...newCementRow, limitSup: e.target.value })}
                              />
                              <button onClick={handleAddCementRow} className="btn-primary">
                                Ajouter
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tableau normal pour les autres paramètres */}
                  {!isAjouteParameter() && selectedParameter && parameterDetails.length > 0 && (
                    <div className="table-container">
                      <div className="search-container">
                        <input
                          type="text"
                          placeholder="🔍 Rechercher par famille, type ou classe..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>
                      
                      <div className="table-actions">
                        <button 
                          className="btn-success"
                          onClick={() => setShowAddValue(true)}
                          disabled={!selectedParameter}
                        >
                          + Nouvelle Valeur
                        </button>
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
                            <th>Actions</th>
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
                              <td className="actions">
                                <div className="dropdown-menu-container">
                                  <button 
                                    className="three-dots-btn"
                                    onClick={() => setRowMenuOpen(rowMenuOpen === index ? null : index)}
                                  >
                                    ⋮
                                  </button>
                                  {rowMenuOpen === index && (
                                    <div className="dropdown-menu">
                                      <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                          setEditingValue({
                                            ...detail,
                                            old_classe: detail.classe
                                          });
                                          setRowMenuOpen(null);
                                        }}
                                      >
                                        Modifier
                                      </button>
                                      <button 
                                        className="dropdown-item delete"
                                        onClick={() => {
                                          handleDeleteValue(detail);
                                          setRowMenuOpen(null);
                                        }}
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!isAjouteParameter() && selectedParameter && parameterDetails.length === 0 && (
                    <div className="no-data">
                      <p>Aucune donnée de norme disponible pour ce paramètre</p>
                      <button 
                        className="btn-link"
                        onClick={() => setShowAddValue(true)}
                      >
                        Ajouter la première valeur
                      </button>
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