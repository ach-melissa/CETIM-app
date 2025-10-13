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
    parnorm: false,
    parametre_ciment: false,
    parametre_clients: false,
    traitement_donnees: false,
    historique: false,
    parametre_ciment_read: false,
    parametre_ciment_create: false,
    parametre_ciment_update: false,
    parametre_ciment_delete: false,
    parametre_entreprise_read: false,
    parametre_entreprise_create: false,
    parametre_entreprise_update: false,
    parametre_entreprise_delete: false,
    parnorm_read: false,
    parnorm_create: false,
    parnorm_update: false,
    parnorm_delete: false,
  });

  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".actions-menu")) setOpenMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      mot_de_passe: "",
      role: "user",
      parnorm: false,
      parametre_ciment: false,
      parametre_clients: false,
      traitement_donnees: false,
      historique: false,
      parametre_ciment_read: false,
      parametre_ciment_create: false,
      parametre_ciment_update: false,
      parametre_ciment_delete: false,
      parametre_entreprise_read: false,
      parametre_entreprise_create: false,
      parametre_entreprise_update: false,
      parametre_entreprise_delete: false,
      parnorm_read: false,
      parnorm_create: false,
      parnorm_update: false,
      parnorm_delete: false,
    });
  };

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
      resetForm();
      setEditingUser(null);
      setShowForm(false);
      fetchUtilisateurs();
    } catch (err) {
      console.error("Erreur ajout/modif utilisateur", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/utilisateurs/${id}`);
      fetchUtilisateurs();
    } catch (err) {
      console.error("Erreur suppression utilisateur", err);
    }
  };

  const filteredUsers = utilisateurs.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="utilisateurs-wrapper">
      <Header />
      <h2>Gestion des utilisateurs</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par nom d'utilisateur ou email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button
        className="add-user-btn"
        onClick={() => {
          setEditingUser(null);
          resetForm();
          setShowForm(true);
        }}
      >
        + Ajouter un utilisateur
      </button>

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
              <td>••••••••</td>
              <td>{u.role}</td>
              <td>
                <div className="actions-menu">
                  <button
                    className="dots-btn"
                    onClick={() =>
                      setOpenMenu(openMenu === u.id ? null : u.id)
                    }
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
                            mot_de_passe: "",
                            role: u.role,
                            parnorm: !!u.parnorm,
                            parametre_ciment: !!u.parametre_ciment,
                            parametre_clients: !!u.parametre_clients,
                            traitement_donnees: !!u.traitement_donnees,
                            historique: !!u.historique,
                            parametre_ciment_read: !!u.parametre_ciment_read,
                            parametre_ciment_create: !!u.parametre_ciment_create,
                            parametre_ciment_update: !!u.parametre_ciment_update,
                            parametre_ciment_delete: !!u.parametre_ciment_delete,
                            parametre_entreprise_read: !!u.parametre_entreprise_read,
                            parametre_entreprise_create: !!u.parametre_entreprise_create,
                            parametre_entreprise_update: !!u.parametre_entreprise_update,
                            parametre_entreprise_delete: !!u.parametre_entreprise_delete,
                            parnorm_read: !!u.parnorm_read,
                            parnorm_create: !!u.parnorm_create,
                            parnorm_update: !!u.parnorm_update,
                            parnorm_delete: !!u.parnorm_delete,
                          });
                          setShowForm(true);
                          setOpenMenu(null);
                        }}
                      >
                        Modifier
                      </button>

                      <button onClick={() => handleDelete(u.id)}>
                        Supprimer
                      </button>

                      <button
                        className="menu-btn cancel-btn"
                        onClick={() => setOpenMenu(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ✖
            </button>
            <h3>
              {editingUser ? "Modifier utilisateur" : "Ajouter utilisateur"}
            </h3>

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

              {formData.role === "user" && (
                <>
                  <div className="permissions-section">
                    <label>
                      <input
                        type="checkbox"
                        name="parnorm"
                        checked={formData.parnorm}
                        onChange={handleChange}
                      />{" "}
                      Paramètre Norm
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="parametre_ciment"
                        checked={formData.parametre_ciment}
                        onChange={handleChange}
                      />{" "}
                      Paramètre Ciment
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="parametre_clients"
                        checked={formData.parametre_clients}
                        onChange={handleChange}
                      />{" "}
                      Paramètre Clients
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="traitement_donnees"
                        checked={formData.traitement_donnees}
                        onChange={handleChange}
                      />{" "}
                      Traitement Données
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="historique"
                        checked={formData.historique}
                        onChange={handleChange}
                      />{" "}
                      Historique
                    </label>
                  </div>

                  <div className="permissions-section">
                    <h4>Autorisations – Paramètre Ciment</h4>
                    {["read", "create", "update", "delete"].map((action) => (
                      <label key={action}>
                        <input
                          type="checkbox"
                          name={`parametre_ciment_${action}`}
                          checked={formData[`parametre_ciment_${action}`]}
                          onChange={handleChange}
                        />{" "}
                        {action === "read"
                          ? "Lire / Voir"
                          : action === "create"
                          ? "Ajouter"
                          : action === "update"
                          ? "Modifier"
                          : "Supprimer"}
                      </label>
                    ))}
                  </div>

                  <div className="permissions-section">
                    <h4>Autorisations – Paramètre Entreprise</h4>
                    {["read", "create", "update", "delete"].map((action) => (
                      <label key={action}>
                        <input
                          type="checkbox"
                          name={`parametre_entreprise_${action}`}
                          checked={formData[`parametre_entreprise_${action}`]}
                          onChange={handleChange}
                        />{" "}
                        {action === "read"
                          ? "Lire / Voir"
                          : action === "create"
                          ? "Ajouter"
                          : action === "update"
                          ? "Modifier"
                          : "Supprimer"}
                      </label>
                    ))}
                  </div>

                  <div className="permissions-section">
                    <h4>Autorisations – Paramètre Norm</h4>
                    {["read", "create", "update", "delete"].map((action) => (
                      <label key={action}>
                        <input
                          type="checkbox"
                          name={`parnorm_${action}`}
                          checked={formData[`parnorm_${action}`]}
                          onChange={handleChange}
                        />{" "}
                        {action === "read"
                          ? "Lire / Voir"
                          : action === "create"
                          ? "Ajouter"
                          : action === "update"
                          ? "Modifier"
                          : "Supprimer"}
                      </label>
                    ))}
                  </div>
                </>
              )}

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
