import { useEffect, useState } from 'react';
import axios from "axios";
import './parametre_norm.css';

function ParametresPage() {
  const [familles, setFamilles] = useState([]);
  const [types, setTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parametres, setParametres] = useState([]);

  const [selectedFamille, setSelectedFamille] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedClasse, setSelectedClasse] = useState("");

  // Fetch familles and classes on mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/familles_ciment")
      .then(res => setFamilles(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/api/classes_resistance")
      .then(res => setClasses(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch types when famille changes
  useEffect(() => {
    if (selectedFamille) {
      axios.get(`http://localhost:5000/api/types_ciment/${selectedFamille}`)
        .then(res => setTypes(res.data))
        .catch(err => console.error(err));
    } else {
      setTypes([]);
      setSelectedType("");
    }
  }, [selectedFamille]);

  // Fetch parametres when type or classe changes
  useEffect(() => {
    if (selectedType && selectedClasse) {
      axios.get(`http://localhost:5000/api/parametres/${selectedType}/${selectedClasse}`)
        .then(res => setParametres(res.data))
        .catch(err => console.error(err));
    } else {
      setParametres([]);
    }
  }, [selectedType, selectedClasse]);

  return (
    <div className="parametres-page">
      <h2>Paramètres de la norme</h2>

      <div>
        <label>Famille de ciment:</label>
        <select onChange={e => setSelectedFamille(e.target.value)} value={selectedFamille}>
          <option value="">Sélectionnez</option>
          {familles.map(f => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Type de ciment:</label>
        <select onChange={e => setSelectedType(e.target.value)} value={selectedType}>
          <option value="">Sélectionnez</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>{t.nom}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Classe de résistance:</label>
        <select onChange={e => setSelectedClasse(e.target.value)} value={selectedClasse}>
          <option value="">Sélectionnez</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Paramètre</th>
            <th>Unité</th>
            <th>Limite inf.</th>
            <th>Limite sup.</th>
            <th>Limite garantie</th>
          </tr>
        </thead>
        <tbody>
          {parametres.map((p, index) => (
            <tr key={index}>
              <td>{p.categorie}</td>
              <td>{p.nom}</td>
              <td>{p.unite}</td>
              <td>{p.limite_inf}</td>
              <td>{p.limite_sup}</td>
              <td>{p.limite_garantie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ParametresPage;