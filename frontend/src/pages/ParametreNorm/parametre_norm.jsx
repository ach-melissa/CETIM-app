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



  // ---------------- Mock Data ----------------
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
    { id: "residu_indoluble", nom: "Résidu insoluble", unite: "%", type_controle: "attribut" },
    { id: "SO3", nom: "Teneur en sulfate (SO₃)", unite: "%", type_controle: "attribut" },
    { id: "teneur_chlour", nom: "Teneur en chlorure", unite: "%", type_controle: "attribut" },
    { id: "C3A", nom: "C3A dans le clinker", unite: "%", type_controle: "attribut" },
    { id: "pouzzolanicite", nom: "Pouzzolanicité", unite: "", type_controle: "attribut" },
    { id: "ajt", nom: "L'ajoute", unite: null, type_controle: "attribut" }
  ]
  };

  // Mock details
  const mockDetails = {
    // Mécanique
  resistance_2j: [
   
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

   
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

  
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

        { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

        { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

        { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },
    
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },


    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },


    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },


    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },


    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" },

    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N", "limit_inf": "10", "limit_max": null, "garantie": "8" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N", "limit_inf": "20", "limit_max": null, "garantie": "18" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R", "limit_inf": "30", "limit_max": null, "garantie": "28" }
  ],
  resistance_7j: [
   
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf":null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

   
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N",  "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R","limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N","limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },


    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N","limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N","limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

        { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

        { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N","limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    {"famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": "12", "limit_max": null, "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },


    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": "12", "limit_max": null, "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R","limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },


    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": "12", "limit_max": null, "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N","limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },


    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": "12", "limit_max": null, "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },


    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": "12", "limit_max": null, "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L","limit_inf": "16", "limit_max": null, "garantie": "14" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N","limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": null, "limit_max": null, "garantie": null },


    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N","limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

  
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },

    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N","limit_inf": 16, "limit_max": null, "garantie": 14 },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N",  "limit_inf": null, "limit_max": null, "garantie": null },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R",  "limit_inf": null, "limit_max": null, "garantie": null }
  ],
  resistance_28j: [

    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    

    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

 
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },


    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },

    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 L", "limit_inf": "32.5", "limit_max": "52.5", "garantie": "30.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 L", "limit_inf": "42.5", "limit_max": "62.5", "garantie": "40.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 L", "limit_inf": "52.5", "limit_max": null, "garantie": "50.0" }
  ],

    // Physique
temps_debut_prise: [
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" },

    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 L", "limit_inf": "75", "limit_max": null, "garantie": "60" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 L", "limit_inf": "60", "limit_max": null, "garantie": "50" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R", "limit_inf": "45", "limit_max": null, "garantie": "40" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 L", "limit_inf": "45", "limit_max": null, "garantie": "40" }
  ], 

  stabilite: [
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },

    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "10", "garantie": "10" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "10", "garantie": "10" }
  ],

  chaleur_hydratation: [
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "Tous", "limit_inf": null, "limit_max": "270", "garantie": "300" }
  ],

    // Chimique
pert_au_feu: [
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_in极": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "极asse": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 极", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "极EM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
 
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "极", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "极lasse": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "极ype_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null }
],

residu_indoluble: [
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_in极": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "极asse": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 极", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "极EM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
 
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": null,"limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "极", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "极lasse": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "极ype_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },

    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": null },
    { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "5", "garantie": null }
],

SO3: [
   
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

   
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },


    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "极ype_code": "CEM II/B-Q", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

      { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type-code": "CEM II/A-L", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    {"famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    {"famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III","type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
    { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

    {"famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III","type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III","type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III","type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III","type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "5" },
    { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "5" },

  { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

  { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

  { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },

  { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "3.5" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4" },
  { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4" },

  { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },

  { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "3.5", "garantie": "4" },
  { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "4", "garantie": "4.5" },
  { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "4", "garantie": "4.5" }
],

  teneur_chlour: [
    { "famille_code": "ALL", "type_code": "ALL", "classe": "Tous", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" }
  ],

    pouzzolanicite: [
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5N", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5R", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5N", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5R", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5N", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5R", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5N", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5R", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5N", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5R", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5N", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5R", "limit_inf": null, "limit_max": "satisfait a l'essai", "garantie": "possitive apres 15 jours"  },

    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5L", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5N", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5R", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5L", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5N", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5R", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5L", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5N", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5R", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5L", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5N", "limit_inf": null, "limit_max":"resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5R", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5L", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5N", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5R", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5L", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5N", "limit_inf": null, "limit_max": "resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5R", "limit_inf": null, "limit_max":"resultat essai doit etre positive a 8 jrs", "garantie": "possitive apres 15 jours" }
  
  ],

  C3A: [
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": "0", "limit_max": "0", "garantie": "1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": "0", "limit_max": "0", "garantie": "1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": "0", "limit_max": "0", "garantie": "1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": "0", "limit_max": "0", "garantie": "1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": "0", "limit_max": "0", "garantie": "1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": "0", "limit_max": "0", "garantie": "1" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": "3", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": "3", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": "3", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_in极": null, "limit_max": "3", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": "3", "garantie": "4" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": null, "limit_max": "3", "garantie": "4" },

    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": null, "limit_max": "5", "garantie": "6" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": "5", "garantie": "6" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": "5", "garantie": "6" },
    { "famille_code": "极EM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": "5", "garantie": "6" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": "5", "garantie": "6" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": "5", "garantie": "6" },


    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5L", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5N", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5R", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5L", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5N", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5R", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5L", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5N", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5R", "limit_inf": null, "limit_max": "9", "garantie": "10"},

    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5L", "limit_inf": null, "limit_max": "9", "garantie": "10"},
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5N", "limit_inf": null, "limit_max":"9", "garantie": "10"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5R", "limit_inf": null, "limit_max": "9", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5L", "limit_inf": null, "limit_max": "9", "garantie": "10"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5N", "limit_inf": null, "limit_max": "9", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5R", "limit_inf": null, "limit_max": "9", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5L", "limit_inf": null, "limit_max": "9", "garantie": "10" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5N", "limit_inf": null, "limit_max": "9", "garantie": "10"  },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5R", "limit_inf": null, "limit_max":"9", "garantie": "10" }
  
  ]
  };

  // ---------------- Hooks ----------------
  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    setParameters(mockParameters[selectedCategory] || []);
    setSelectedParameter(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedParameter && selectedParameter !== "ajt") {
      setParameterDetails(mockDetails[selectedParameter] || []);
    } else {
      setParameterDetails([]);
    }
  }, [selectedParameter]);

  // ---------------- Helpers ----------------
  const formatCategoryName = (name) => {
    const names = { mecanique: "Mécanique", physique: "Physique", chimique: "Chimique" };
    return names[name] || name;
  };

  const handleAddRow = () => setRows([...rows, { cas: "", limitInf: "", limitSup: "", garantie: "" }]);

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

  const isAjouteParameter = () => selectedParameter === "ajt";

  // ---------------- Render ----------------
  return (
    <div className="parametreNormPage">

      <Header />

      <main className="content">
        <h1>Paramètres Norme Ciment</h1>

        {/* Category Selection */}
        <div className="category-selection">
          <h2>Sélectionnez une catégorie :</h2>
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

        {/* Parameters */}
        <div className="parameters-list">
          {parameters.length === 0 ? (
            <p>Aucun paramètre trouvé pour cette catégorie.</p>
          ) : (
            <>
              <div className="parameter-buttons">
                {parameters.map((param) => {
                  const isAjout = param.id === "ajt";
                  const casList = validatedParams[param.id]
                    ? validatedParams[param.id].map((r) => r.cas).filter(Boolean)
                    : rows.map((r) => r.cas).filter(Boolean);

                  return (
                    <button
                      key={param.id}
                      className={selectedParameter === param.id ? "active" : ""}
                      onClick={() => {
                        setSelectedParameter(param.id === selectedParameter ? null : param.id);
                        setRows([{ cas: "", limitInf: "", limitSup: "", garantie: "" }]);
                      }}
                    >
                      {param.nom} {param.unite && `(${param.unite})`} {isAjout && casList.length > 0 && ` (${casList.join(", ")})`}
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

              {/* Standard parameter details */}
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
                          <th>Garantie</th>
                          <th>Unité</th>
                          <th>Évaluation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameterDetails.map((d, i) => {
                          const paramInfo = parameters.find((p) => p.id === selectedParameter);
                          return (
                            <tr key={i}>
                              <td>{d.famille_code}</td>
                              <td>{d.type_code}</td>
                              <td>{d.classe}</td>
                              <td>{d.limit_inf ?? "-"}</td>
                              <td>{d.limit_max ?? "-"}</td>
                              <td>{d.garantie ?? "-"}</td>
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