import React, { useEffect, useState } from "react";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";
import "./parametreCiment.css";
import Header from "../../components/Header/Header";

const API = "http://localhost:5000/api";

export default function ParametreCiment() {
  const [familles, setFamilles] = useState([]);
  const [search, setSearch] = useState("");
  const [editingFamille, setEditingFamille] = useState(null);
  const [addingType, setAddingType] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [showFamilleForm, setShowFamilleForm] = useState(false);
  const [form, setForm] = useState({ code: "", nom: "" });

  // 🔐 Permissions
  const userPermissions = JSON.parse(localStorage.getItem("permissions") || "{}");
  const role = localStorage.getItem("role");
  const can = (perm) =>
    role === "admin" || userPermissions[perm] === 1 || userPermissions[perm] === true;

  // 🔄 Load familles + types
  const loadData = async () => {
    try {
      const res = await fetch(`${API}/familles_ciment`);
      const data = await res.json();
      setFamilles(data);
    } catch (err) {
      console.error("Erreur chargement familles ciment:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Add/Edit famille
  const handleSaveFamille = async (e) => {
    e.preventDefault();

    if (!form.code.trim() || !form.nom.trim()) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    try {
      if (editingFamille) {
        await fetch(`${API}/familles_ciment/${editingFamille}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API}/familles_ciment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      setForm({ code: "", nom: "" });
      setEditingFamille(null);
      setShowFamilleForm(false);
      loadData();
    } catch (err) {
      console.error("Erreur enregistrement famille:", err);
    }
  };

  // 🗑️ Delete famille
  const handleDeleteFamille = async (id) => {
    if (window.confirm("Supprimer cette famille ?")) {
      await fetch(`${API}/familles_ciment/${id}`, { method: "DELETE" });
      loadData();
    }
  };

  // ➕ Add type
  const handleAddType = async (familleId, code, description) => {
    if (!code.trim() || !description.trim()) return;
    await fetch(`${API}/types_ciment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ famille_id: familleId, code, description }),
    });
    setAddingType(null);
    loadData();
  };

  // ✏️ Update type
  const handleUpdateType = async (id, code, description) => {
    await fetch(`${API}/types_ciment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, description }),
    });
    loadData();
  };

  // 🗑️ Delete type
  const handleDeleteType = async (id) => {
    if (window.confirm("Supprimer ce type ?")) {
      await fetch(`${API}/types_ciment/${id}`, { method: "DELETE" });
      loadData();
    }
  };

  // ⛔ Access denied
  if (!can("parametre_ciment_read")) {
    return (
      <div className="parametre-ciment-container">
        <Header />
        <h2>⛔ Accès refusé</h2>
        <p>Vous n'avez pas la permission de consulter cette page.</p>
      </div>
    );
  }

  return (
    <div className="parametre-ciment-container">
      <Header />
      <h2>Paramètres Ciment</h2>

      {/* 🔍 Search + Add */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="🔍 Rechercher famille ou type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {can("parametre_ciment_create") && (
          <button
            className="add-btn"
            onClick={() => {
              setEditingFamille(null);
              setForm({ code: "", nom: "" });
              setShowFamilleForm(true);
            }}
          >
            <Plus size={16} /> Nouvelle famille
          </button>
        )}
      </div>

      {/* 🧾 Formulaire famille */}
      {showFamilleForm &&
        (can("parametre_ciment_create") || can("parametre_ciment_update")) && (
          <form onSubmit={handleSaveFamille} className="form-inline">
            <input
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <button type="submit">
              {editingFamille ? "Modifier" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFamilleForm(false);
                setEditingFamille(null);
                setForm({ code: "", nom: "" });
              }}
            >
              Annuler
            </button>
          </form>
        )}

      {/* 🧩 Liste familles */}
      <div className="famille-list">
        {familles
          .filter((f) =>
            (f.nom + f.code).toLowerCase().includes(search.toLowerCase())
          )
          .map((f) => (
            <div key={f.id} className="famille-card">
              <div className="famille-header">
                <strong>
                  {f.code} - {f.nom}
                </strong>

                <div className="actions">
                  <MoreVertical
                    className="menu"
                    onClick={() =>
                      setShowMenu(showMenu === f.id ? null : f.id)
                    }
                  />
                  {showMenu === f.id && (
                    <div className="dropdown-menu">
                      {can("parametre_ciment_update") && (
                        <button
                          onClick={() => {
                            setEditingFamille(f.id);
                            setForm({ code: f.code, nom: f.nom });
                            setShowFamilleForm(true);
                            setShowMenu(null);
                          }}
                        >
                          <Edit size={14} /> Modifier
                        </button>
                      )}

                      {can("parametre_ciment_create") && (
                        <button
                          onClick={() => {
                            setAddingType(f.id);
                            setShowMenu(null);
                          }}
                        >
                          <Plus size={14} /> Ajouter type
                        </button>
                      )}

                      {can("parametre_ciment_delete") && (
                        <button
                          onClick={() => {
                            handleDeleteFamille(f.id);
                            setShowMenu(null);
                          }}
                        >
                          <Trash2 size={14} /> Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {f.types.length > 0 && (
                <ul className="type-list">
                  {f.types.map((t) => (
                    <EditableType
                      key={t.id}
                      type={t}
                      onSave={handleUpdateType}
                      onDelete={handleDeleteType}
                    />
                  ))}
                </ul>
              )}

              {addingType === f.id && can("parametre_ciment_create") && (
                <TypeForm
                  onSubmit={(code, desc) => handleAddType(f.id, code, desc)}
                  onCancel={() => setAddingType(null)}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// 🔧 Editable Type
function EditableType({ type, onSave, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    code: type.code,
    description: type.description || "",
  });

  const userPermissions = JSON.parse(localStorage.getItem("permissions") || "{}");
  const role = localStorage.getItem("role");
  const can = (perm) =>
    role === "admin" || userPermissions[perm] === 1 || userPermissions[perm] === true;

  return (
    <li className="type-item">
      {editMode ? (
        <form
          className="type-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(type.id, form.code, form.description);
            setEditMode(false);
          }}
        >
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit">💾</button>
          <button type="button" onClick={() => setEditMode(false)}>
            ✖
          </button>
        </form>
      ) : (
        <>
          <span>
            <b>{type.code}</b> – {type.description}
          </span>
          <div>
            {can("parametre_ciment_update") && (
              <button className="icon-btn" onClick={() => setEditMode(true)}>
                <Edit size={14} />
              </button>
            )}
            {can("parametre_ciment_delete") && (
              <button
                className="icon-btn"
                onClick={() => onDelete(type.id)}
                style={{ color: "red" }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

// 🧩 Add new Type form
function TypeForm({ onSubmit, onCancel }) {
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(code, desc);
      }}
      className="type-form"
    >
      <input
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button type="submit">Enregistrer</button>
      <button type="button" onClick={onCancel}>
        Annuler
      </button>
    </form>
  );
}
