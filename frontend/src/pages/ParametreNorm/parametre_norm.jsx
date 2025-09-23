import React, { useEffect, useState } from "react";
import "./parametre_norm.css";
import Header from "../../components/Header/Header";

const API_BASE = "http://localhost:5000";
const USE_MOCK_DATA = true;

const casLimits = {
  S: {
    "CEM II/A-S": { limitInf: 6, limitSup: 20 },
    "CEM II/B-S": { limitInf: 21, limitSup: 35 }
  },
  D: {
    "CEM II/A-D": { limitInf: 6, limitSup: 20 }
  },
  P: {
    "CEM II/A-P": { limitInf: 6, limitSup: 20 },
    "CEM II/B-P": { limitInf: 21, limitSup: 35 }
  },
  Q: {
    "CEM II/A-Q": { limitInf: 6, limitSup: 20 },
    "CEM II/B-Q": { limitInf: 21, limitSup: 35 }
  },
  V: {
        "CEM II/A-V": { limitInf: 6, limitSup: 20 },
    "CEM II/B-V": { limitInf: 21, limitSup: 35 }
  },
  W: {
        "CEM II/A-W": { limitInf: 6, limitSup: 20 },
    "CEM II/B-W": { limitInf: 21, limitSup: 35 }
  },
  T: {
    "CEM II/A-T": { limitInf: 6, limitSup: 20 },
    "CEM II/B-T": { limitInf: 21, limitSup: 35 }
  },
  L: {
    "CEM II/A-L": { limitInf: 6, limitSup: 20 },
    "CEM II/B-L": { limitInf: 21, limitSup: 35 }
  },
  LL: {
    "CEM II/A-LL": { limitInf: 12, limitSup: 20 },
    "CEM II/B-LL": { limitInf: 21, limitSup: 35 }
  },

  SDPQVWTLLL:{
    "CEM II/A-M": { limitInf: 12, limitSup: 20 },
    "CEM II/B-M": { limitInf: 21, limitSup: 35 }
  },
  DPQVW:{
    "CEM IV/A": { limitInf: 11, limitSup: 35 },
    "CEM IV/B": { limitInf: 36, limitSup: 55 }
  },
  PQV:{
    "CEM V/A": { limitInf: 18, limitSup: 30 },
    "CEM V/B": { limitInf: 31, limitSup: 49 }
  }
};


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

  const [selectedCas, setSelectedCas] = useState(""); // selected ajout cas
const [rows, setRows] = useState([]); // table rows for the selected cas
const [validatedAjout, setValidatedAjout] = useState({}); // store validated data per cas





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
    { id: "ajt", nom: "L'ajout", unite: null, type_controle: "attribut" },
  ],
  physique: [
    { id: "temps_debut_prise", nom: "Temps de début de prise", unite: "min", type_controle: "attribut" },
    { id: "stabilite", nom: "Stabilité (expansion)", unite: "mm", type_controle: "attribut" },
    { id: "chaleur_hydratation", nom: "Chaleur d’hydratation", unite: "J/g", type_controle: "attribut" },
    { id: "ajt", nom: "L'ajout", unite: null, type_controle: "attribut" },
  ],
  chimique: [
    { id: "pert_au_feu", nom: "Perte au feu", unite: "%", type_controle: "attribut" },
    { id: "residu_indoluble", nom: "Résidu insoluble", unite: "%", type_controle: "attribut" },
    { id: "SO3", nom: "Teneur en sulfate (SO₃)", unite: "%", type_controle: "attribut" },
    { id: "teneur_chlour", nom: "Teneur en chlorure", unite: "%", type_controle: "attribut" },
    { id: "C3A", nom: "C3A dans le clinker", unite: "%", type_controle: "attribut" },
    { id: "pouzzolanicite", nom: "Pouzzolanicité", unite: "", type_controle: "attribut" },
    { id: "ajt", nom: "L'ajout", unite: null, type_controle: "attribut" }
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
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "Tous", "limit_inf": null, "limit_max": "270", "garantie": "300" } ,
      {"famille_code": "CEM III", "type_code": "CEM III/B", "classe": "Tous", "limit_inf": null, "limit_max": "270", "garantie": "300" } ,
      {"famille_code": "CEM III", "type_code": "CEM III/C", "classe": "Tous", "limit_inf": null, "limit_max": "270", "garantie": "300" } 
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
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "10" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 0", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
     { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 3", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
     { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM I", "type_code": "CEM I-SR 5", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-S", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-S", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-D", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-P", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-P", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-Q", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
  { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-Q", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-V", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-V", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
  { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-W", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-W", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-T", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-T", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-L", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
  { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-L", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-LL", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-LL", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/A-M", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
  { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
{ "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
 { "famille_code": "CEM II", "type_code": "CEM II/B-M", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
       { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
          { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
         { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
          { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
         { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM III", "type_code": "CEM III/C-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
       { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
     { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
      { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/A-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
     { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM IV", "type_code": "CEM IV/B-SR", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/A", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
     { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "32.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "42.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 N", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 R", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" },
    { "famille_code": "CEM V", "type_code": "CEM V/B", "classe": "52.5 L", "limit_inf": null, "limit_max": "0.1", "garantie": "0.1" }
  
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
  const params = mockParameters[selectedCategory] || [];
  setParameters(params);

  if (params.length > 0) {
    setSelectedParameter(params[0].id); 
  } else {
    setSelectedParameter(null);
  }
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



  // Handler when selecting a cas
const handleCasSelect = (cas) => {
  setSelectedCas(cas);

  // Load rows either from validatedAjout if exists, otherwise from casLimits
  if (cas) {
    if (validatedAjout[cas]) {
      setRows(validatedAjout[cas]); // restore previous saved data
    } else if (casLimits[cas]) {
      const newRows = Object.entries(casLimits[cas]).map(([cement, limits]) => ({
        cas,
        cement,
        limitInf: limits.limitInf,
        limitSup: limits.limitSup,
      }));
      setRows(newRows);
    } else {
      setRows([]);
    }
  } else {
    setRows([]);
  }
};

// Handler to validate/save the rows for the selected cas
const handleValidateAjout = () => {
  if (!selectedCas) return;
  setValidatedAjout((prev) => ({
    ...prev,
    [selectedCas]: [...rows],
  }));
};
// select cement code
// select cement code
const [selectedTypeCodes, setSelectedTypeCodes] = useState([]); // Array for multi-select

// Get unique type codes from parameter details
const getUniqueTypeCodes = () => {
  if (!parameterDetails.length) return [];
  return [...new Set(parameterDetails.map(item => item.type_code))].sort();
};

// Filter parameter details based on active filters
const getFilteredParameterDetails = () => {
  if (!parameterDetails.length) return [];
  
  let filtered = parameterDetails;
  
  if (selectedTypeCodes.length > 0) {
    filtered = filtered.filter(item => selectedTypeCodes.includes(item.type_code));
  }
  
  return filtered;
};

// Handle type code selection/deselection
const handleTypeCodeToggle = (typeCode) => {
  setSelectedTypeCodes(prev => {
    if (prev.includes(typeCode)) {
      return prev.filter(code => code !== typeCode);
    } else {
      return [...prev, typeCode];
    }
  });
};
const handleDeleteRow = (index) => {
  setRows(prev => prev.filter((_, i) => i !== index));
};

// Clear all filters
const clearFilters = () => {
  setSelectedTypeCodes([]);
};

const paramInfo = parameters.find(p => p.id === selectedParameter);

const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
// -----
// ----------- Render ----------------
return (
    <div className="parametreNormPage">
      <Header />
      
      <main className="content">
        <h1>Paramètres Norme</h1>

        {/* Main Content Layout */}
        <div className="content-layout">
          {/* Left Side - Main Content */}
          <div className="content-left">
            {/* Category Selection */}
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

            {/* Parameters */}
            <div className="parameters-list">
              <h3>Proprietes de l'exigence</h3>
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
                          {param.nom} {param.unite && `(${param.unite})`} 
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom parameter table for "L'ajoute" */}
                  {isAjouteParameter() && (
                    <div className="parameter-details-form">
                      {/* Cas selector */}
                      <div className="ajout-selector">
                        <label>Ajout: </label>
                        <select
                          value={selectedCas}
                          onChange={(e) => {
                            const cas = e.target.value;
                            setSelectedCas(cas);

                            // populate rows based on casLimits for the selected cas
                            if (cas && casLimits[cas]) {
                              const newRows = Object.entries(casLimits[cas]).map(([cement, limits]) => ({
                                cas,
                                cement,
                                limitInf: limits.limitInf,
                                limitSup: limits.limitSup,
                              }));
                              setRows(newRows);
                            } else {
                              setRows([]);
                            }
                          }}
                        >
                          <option value="">-- Sélectionner un cas --</option>
                          {Object.keys(casLimits).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Table shown only if a cas is selected */}
                      {selectedCas && rows.length > 0 && (
                        <table className="parameter-table">
                          <thead>
                            <tr>
                              <th>Cas</th>
                              <th>Ciment</th>
                              <th>Limit Inf</th>
                              <th>Limit Sup</th>
                              <th>Actions</th>
                              
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, index) => (
                              <tr key={index}>
                                <td>{row.cas}</td>
                                <td>{row.cement}</td>
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
                                  <button onClick={() => handleDeleteRow(index)}>Supprimer</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Main Table */}
                  {selectedParameter && parameterDetails.length > 0 && !isAjouteParameter() && (
                    <div className="table-container">
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
                              <td>{detail.limit_inf}</td>
                              <td>{detail.limit_max}</td>
                              <td>{detail.garantie}</td>
                                 <td>{paramInfo?.unite || "-"}</td>
                              <td>{paramInfo?.type_controle || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side - Filters Sidebar */}
          <div className="content-right">
            {selectedParameter && parameterDetails.length > 0 && !isAjouteParameter() && (
              <div className="filter-section">
                <div className="filter-header">
                  <h3>Filtrer par Ciment</h3>
                </div>
                
                <div className="filter-content">
                  {/* Type filter - Multi-select */}
                  <div className="filter-group">
  <h4>Types de ciment</h4>
  <div className="type-select-container">
    <div 
      className={`type-select-trigger ${isTypeDropdownOpen ? 'open' : ''}`}
      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
    >
      {selectedTypeCodes.length > 0 
        ? `${selectedTypeCodes.length} type(s) sélectionné(s)` 
        : "Sélectionner les types de ciment"}
    </div>
    
    {isTypeDropdownOpen && (
      <div className="type-select-dropdown">
        {getUniqueTypeCodes().map(type => (
          <div 
            key={type} 
            className={`type-select-option ${selectedTypeCodes.includes(type) ? 'selected' : ''}`}
            onClick={() => handleTypeCodeToggle(type)}
          >
            <input
              type="checkbox"
              checked={selectedTypeCodes.includes(type)}
              readOnly
            />
            {type}
          </div>
        ))}
      </div>
    )}
  </div>
</div>

                  {/* Active filters display */}
                  {selectedTypeCodes.length > 0 && (
                    <div className="active-filters">
                      <h5>Filtres actifs:</h5>
                      <div className="filter-tags">
                        {selectedTypeCodes.map(typeCode => (
                          <span key={typeCode} className="filter-tag">
                            Type: {typeCode}
                            <span className="close" onClick={() => handleTypeCodeToggle(typeCode)}>×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear all button */}
                  <button 
                    className="clear-all"
                    onClick={clearFilters}
                    disabled={selectedTypeCodes.length === 0}
                  >
                    Supprimer tous les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}