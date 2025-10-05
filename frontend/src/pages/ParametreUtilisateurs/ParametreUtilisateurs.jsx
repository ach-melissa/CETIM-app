import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ParametreUtilisateurs.css";
import Header from "../../components/Header/Header";

export default function ParametreUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mot_de_passe: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  // Charger les utilisateurs
  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/utilisateurs");
      setUtilisateurs(res.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ajouter ou Modifier utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(
          `http://localhost:5000/api/utilisateurs/${editingUser.id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/utilisateurs", formData);
      }
      setFormData({ username: "", email: "", mot_de_passe: "", role: "user" });
      setEditingUser(null);
      setShowForm(false);
      fetchUtilisateurs();
    } catch (err) {
      console.error("Erreur ajout/modif utilisateur", err);
    }
  };

  // Supprimer utilisateur
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/utilisateurs/${id}`);
      fetchUtilisateurs();
    } catch (err) {
      console.error("Erreur suppression utilisateur", err);
    }
  };

  // Filtrage (username ou email)
  const filteredUsers = utilisateurs.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="utilisateurs-wrapper">
      <Header />
      <h2>Gestion des utilisateurs</h2>

      {/* 🔎 Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par nom d'utilisateur ou email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ➕ Bouton Ajouter */}
      <button
        className="add-user-btn"
        onClick={() => {
          setEditingUser(null);
          setFormData({ username: "", email: "", mot_de_passe: "", role: "user" });
          setShowForm(true);
        }}
      >
        + Ajouter un utilisateur
      </button>

      {/* 📋 Liste des utilisateurs */}
      <table className="utilisateurs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Mot de passe</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.mot_de_passe}</td>
              <td>{u.role}</td>
              <td>
                <div className="actions-menu">
                  <button
                    className="dots-btn"
                    onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                  >
                    ⋮
                  </button>
                  {openMenu === u.id && (
                    <div className="dropdown-menu">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setFormData({
                            username: u.username,
                            email: u.email,
                            mot_de_passe: u.mot_de_passe || "",
                            role: u.role,
                          });
                          setShowForm(true);
                          setOpenMenu(null);
                        }}
                      >
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(u.id)}>Supprimer</button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📝 Formulaire en popup */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ✖
            </button>
            <h3>{editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}</h3>
            <form onSubmit={handleSubmit} className="utilisateurs-form">
              <input
                type="text"
                name="username"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="mot_de_passe"
                placeholder="Mot de passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                required
              />
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
              <button type="submit">
                {editingUser ? "Enregistrer" : "Ajouter"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
