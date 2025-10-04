const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection - use promise version
const db = mysql.createPool({
  host: 'localhost',
  user: 'cetim_user',
  password: 'cetim123',
  database: 'ciment_conformite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = db.promise();

// Test database connection
promisePool.getConnection()
  .then(connection => {
    console.log('✅ Connected to database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });
 
// --- API pour les paramètres de norme --- //

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier parnorm.json
const PAR_NORM_PATH = path.join(__dirname, '../frontend/public/Data/parnorm.json');



// Route pour récupérer toutes les catégories depuis parnorm.json
app.get("/api/categories", async (req, res) => {
  try {
    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Récupérer les catégories depuis la structure du fichier
    const categories = parnorm.categories || [];
    
    res.json(categories);
  } catch (err) {
    console.error("❌ Erreur lecture categories:", err);
    res.status(500).json({ error: "Erreur lors du chargement des catégories" });
  }
});

// Route pour récupérer les paramètres d'une catégorie spécifique
app.get("/api/parameters/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Récupérer les paramètres de la catégorie
    const parameters = parnorm.parameters && parnorm.parameters[categoryId] 
      ? parnorm.parameters[categoryId] 
      : [];
    
    res.json(parameters);
  } catch (err) {
    console.error("❌ Erreur lecture parameters:", err);
    res.status(500).json({ error: "Erreur lors du chargement des paramètres" });
  }
});

// Route pour récupérer toutes les données parnorm
app.get("/api/parnorm", async (req, res) => {
  try {
    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    res.json(parnorm);
  } catch (err) {
    console.error("❌ Erreur lecture parnorm:", err);
    res.status(500).json({ error: "Erreur lors du chargement des données parnorm" });
  }
});

// Route pour ajouter une nouvelle catégorie
app.post("/api/categories", async (req, res) => {
  try {
    const { id, nom } = req.body;
    
    if (!id || !nom) {
      return res.status(400).json({ error: "ID et nom sont requis" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = parnorm.categories.find(cat => cat.id === id);
    if (existingCategory) {
      return res.status(400).json({ error: "Cette catégorie existe déjà" });
    }
    
    // Ajouter la nouvelle catégorie
    parnorm.categories.push({ id, nom });
    
    // Initialiser les paramètres pour cette catégorie
    if (!parnorm.parameters) parnorm.parameters = {};
    parnorm.parameters[id] = [];
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Catégorie ajoutée avec succès",
      category: { id, nom }
    });
  } catch (err) {
    console.error("❌ Erreur ajout catégorie:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la catégorie" });
  }
});

// Route pour ajouter un nouveau paramètre
app.post("/api/parameters/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { id, nom, unite, type_controle } = req.body;
    
    if (!id || !nom) {
      return res.status(400).json({ error: "ID et nom sont requis" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Vérifier si la catégorie existe
    const categoryExists = parnorm.categories.find(cat => cat.id === categoryId);
    if (!categoryExists) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    
    // Vérifier si le paramètre existe déjà
    const existingParam = parnorm.parameters[categoryId]?.find(param => param.id === id);
    if (existingParam) {
      return res.status(400).json({ error: "Ce paramètre existe déjà dans cette catégorie" });
    }
    
    // Ajouter le nouveau paramètre
    const newParameter = {
      id,
      nom,
      unite: unite || null,
      type_controle: type_controle || "mesure"
    };
    
    if (!parnorm.parameters[categoryId]) {
      parnorm.parameters[categoryId] = [];
    }
    
    parnorm.parameters[categoryId].push(newParameter);
    
    // Initialiser les données pour ce paramètre
    parnorm[id] = {};
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Paramètre ajouté avec succès",
      parameter: newParameter
    });
  } catch (err) {
    console.error("❌ Erreur ajout paramètre:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout du paramètre" });
  }
});

// Route pour mettre à jour les valeurs d'un paramètre
app.put("/api/parameters/:paramId/values", async (req, res) => {
  try {
    const { paramId } = req.params;
    const { values } = req.body;
    
    if (!values) {
      return res.status(400).json({ error: "Les valeurs sont requises" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Mettre à jour les valeurs du paramètre
    parnorm[paramId] = values;
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Valeurs mises à jour avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour valeurs:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour des valeurs" });
  }
});

// --- Routes supplémentaires pour la gestion complète --- //

// Supprimer une catégorie
app.delete("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Vérifier si la catégorie existe
    const categoryIndex = parnorm.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    
    // Supprimer la catégorie
    parnorm.categories.splice(categoryIndex, 1);
    
    // Supprimer les paramètres associés
    if (parnorm.parameters && parnorm.parameters[categoryId]) {
      delete parnorm.parameters[categoryId];
    }
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Catégorie supprimée avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur suppression catégorie:", err);
    res.status(500).json({ error: "Erreur lors de la suppression de la catégorie" });
  }
});

// Modifier une catégorie
app.put("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { nom } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: "Le nom est requis" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Trouver la catégorie
    const category = parnorm.categories.find(cat => cat.id === categoryId);
    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    
    // Modifier la catégorie
    category.nom = nom;
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Catégorie modifiée avec succès",
      category
    });
  } catch (err) {
    console.error("❌ Erreur modification catégorie:", err);
    res.status(500).json({ error: "Erreur lors de la modification de la catégorie" });
  }
});

// Supprimer un paramètre
app.delete("/api/parameters/:categoryId/:paramId", async (req, res) => {
  try {
    const { categoryId, paramId } = req.params;

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Vérifier si le paramètre existe
    if (!parnorm.parameters || !parnorm.parameters[categoryId]) {
      return res.status(404).json({ error: "Catégorie ou paramètre non trouvé" });
    }
    
    const paramIndex = parnorm.parameters[categoryId].findIndex(param => param.id === paramId);
    if (paramIndex === -1) {
      return res.status(404).json({ error: "Paramètre non trouvé" });
    }
    
    // Supprimer le paramètre
    parnorm.parameters[categoryId].splice(paramIndex, 1);
    
    // Supprimer les données associées au paramètre
    if (parnorm[paramId]) {
      delete parnorm[paramId];
    }
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Paramètre supprimé avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur suppression paramètre:", err);
    res.status(500).json({ error: "Erreur lors de la suppression du paramètre" });
  }
});

// Modifier un paramètre
app.put("/api/parameters/:categoryId/:paramId", async (req, res) => {
  try {
    const { categoryId, paramId } = req.params;
    const { nom, unite, type_controle } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: "Le nom est requis" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Trouver le paramètre
    if (!parnorm.parameters || !parnorm.parameters[categoryId]) {
      return res.status(404).json({ error: "Catégorie ou paramètre non trouvé" });
    }
    
    const parameter = parnorm.parameters[categoryId].find(param => param.id === paramId);
    if (!parameter) {
      return res.status(404).json({ error: "Paramètre non trouvé" });
    }
    
    // Modifier le paramètre
    parameter.nom = nom;
    parameter.unite = unite || null;
    parameter.type_controle = type_controle || "mesure";
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Paramètre modifié avec succès",
      parameter
    });
  } catch (err) {
    console.error("❌ Erreur modification paramètre:", err);
    res.status(500).json({ error: "Erreur lors de la modification du paramètre" });
  }
});

// Gestion des valeurs de paramètres (ajout, modification, suppression)
app.post("/api/parameters/:paramId/values", async (req, res) => {
  try {
    const { paramId } = req.params;
    const { famille_code, type_code, classe_data } = req.body;
    
    if (!famille_code || !type_code || !classe_data) {
      return res.status(400).json({ error: "Données incomplètes" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Initialiser la structure si elle n'existe pas
    if (!parnorm[paramId]) {
      parnorm[paramId] = {};
    }
    
    if (!parnorm[paramId][famille_code]) {
      parnorm[paramId][famille_code] = {};
    }
    
    if (!parnorm[paramId][famille_code][type_code]) {
      parnorm[paramId][famille_code][type_code] = [];
    }
    
    // Ajouter la nouvelle classe
    parnorm[paramId][famille_code][type_code].push(classe_data);
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Valeur ajoutée avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur ajout valeur:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la valeur" });
  }
});

// Modifier une valeur existante
app.put("/api/parameters/:paramId/values", async (req, res) => {
  try {
    const { paramId } = req.params;
    const { famille_code, type_code, old_classe, new_classe_data } = req.body;
    
    if (!famille_code || !type_code || !old_classe || !new_classe_data) {
      return res.status(400).json({ error: "Données incomplètes" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Vérifier que la structure existe
    if (!parnorm[paramId] || !parnorm[paramId][famille_code] || !parnorm[paramId][famille_code][type_code]) {
      return res.status(404).json({ error: "Valeur non trouvée" });
    }
    
    // Trouver et modifier la classe
    const classes = parnorm[paramId][famille_code][type_code];
    const classeIndex = classes.findIndex(c => c.classe === old_classe);
    
    if (classeIndex === -1) {
      return res.status(404).json({ error: "Classe non trouvée" });
    }
    
    classes[classeIndex] = new_classe_data;
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Valeur modifiée avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur modification valeur:", err);
    res.status(500).json({ error: "Erreur lors de la modification de la valeur" });
  }
});

// Supprimer une valeur
app.delete("/api/parameters/:paramId/values", async (req, res) => {
  try {
    const { paramId } = req.params;
    const { famille_code, type_code, classe } = req.body;
    
    if (!famille_code || !type_code || !classe) {
      return res.status(400).json({ error: "Données incomplètes" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, 'utf8');
    const parnorm = JSON.parse(data);
    
    // Vérifier que la structure existe
    if (!parnorm[paramId] || !parnorm[paramId][famille_code] || !parnorm[paramId][famille_code][type_code]) {
      return res.status(404).json({ error: "Valeur non trouvée" });
    }
    
    // Supprimer la classe
    const classes = parnorm[paramId][famille_code][type_code];
    const classeIndex = classes.findIndex(c => c.classe === classe);
    
    if (classeIndex === -1) {
      return res.status(404).json({ error: "Classe non trouvée" });
    }
    
    classes.splice(classeIndex, 1);
    
    // Nettoyer les structures vides
    if (classes.length === 0) {
      delete parnorm[paramId][famille_code][type_code];
    }
    if (Object.keys(parnorm[paramId][famille_code]).length === 0) {
      delete parnorm[paramId][famille_code];
    }
    if (Object.keys(parnorm[paramId]).length === 0) {
      delete parnorm[paramId];
    }
    
    // Sauvegarder le fichier
    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    
    res.json({ 
      success: true, 
      message: "Valeur supprimée avec succès"
    });
  } catch (err) {
    console.error("❌ Erreur suppression valeur:", err);
    res.status(500).json({ error: "Erreur lors de la suppression de la valeur" });
  }
});
// --- CRUD for Ajouts ---

// GET tous les ajouts
app.get("/api/ajouts", async (req, res) => {
  try {
    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    res.json(parnorm.ajout || {});
  } catch (err) {
    console.error("❌ Erreur lecture ajouts:", err);
    res.status(500).json({ error: "Erreur serveur ajouts" });
  }
});

// POST un nouvel ajout
app.post("/api/ajouts", async (req, res) => {
  try {
    const { id, description } = req.body;
    if (!id || !description) {
      return res.status(400).json({ error: "ID et description requis" });
    }

    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    if (!parnorm.ajout) parnorm.ajout = {};
    if (parnorm.ajout[id]) {
      return res.status(400).json({ error: "Ajout existe déjà" });
    }

    parnorm.ajout[id] = { description };

    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur ajout:", err);
    res.status(500).json({ error: "Erreur ajout" });
  }
});

// PUT modifier un ajout
app.put("/api/ajouts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    if (!parnorm.ajout || !parnorm.ajout[id]) {
      return res.status(404).json({ error: "Ajout introuvable" });
    }

    parnorm.ajout[id].description = description;

    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur maj ajout:", err);
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

// DELETE un ajout
app.delete("/api/ajouts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    if (!parnorm.ajout || !parnorm.ajout[id]) {
      return res.status(404).json({ error: "Ajout introuvable" });
    }

    delete parnorm.ajout[id];

    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur suppression ajout:", err);
    res.status(500).json({ error: "Erreur suppression" });
  }
});

// --- CRUD for Cement rows in an Ajout ---
app.post("/api/ajouts/:ajoutId/ciments", async (req, res) => {
  try {
    const { ajoutId } = req.params;
    const { cement, limitInf, limitSup } = req.body;

    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    if (!parnorm.ajout || !parnorm.ajout[ajoutId]) {
      return res.status(404).json({ error: "Ajout introuvable" });
    }

    parnorm.ajout[ajoutId][cement] = { limitInf, limitSup };

    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur ajout ciment:", err);
    res.status(500).json({ error: "Erreur ajout ciment" });
  }
});

app.put("/api/ajouts/:ajoutId/ciments/:cement", async (req, res) => {
  try {
    const { ajoutId, cement } = req.params;
    const { limitInf, limitSup } = req.body;

    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    if (!parnorm.ajout || !parnorm.ajout[ajoutId] || !parnorm.ajout[ajoutId][cement]) {
      return res.status(404).json({ error: "Ciment introuvable" });
    }

    parnorm.ajout[ajoutId][cement] = { limitInf, limitSup };

    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur maj ciment:", err);
    res.status(500).json({ error: "Erreur maj ciment" });
  }
});

app.delete("/api/ajouts/:ajoutId/ciments/:cement", async (req, res) => {
  try {
    const { ajoutId, cement } = req.params;

    const data = await fs.promises.readFile(PAR_NORM_PATH, "utf8");
    const parnorm = JSON.parse(data);

    if (!parnorm.ajout || !parnorm.ajout[ajoutId] || !parnorm.ajout[ajoutId][cement]) {
      return res.status(404).json({ error: "Ciment introuvable" });
    }

    delete parnorm.ajout[ajoutId][cement];

    await fs.promises.writeFile(PAR_NORM_PATH, JSON.stringify(parnorm, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur suppression ciment:", err);
    res.status(500).json({ error: "Erreur suppression ciment" });
  }
});


//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

// Récupérer tous les utilisateurs (sans mot de passe)
app.get("/api/utilisateurs", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT id, email, mot_de_passe, role FROM utilisateurs ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur SQL utilisateurs:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Créer un nouvel utilisateur
app.post("/api/utilisateurs", async (req, res) => {
  const { username, email, mot_de_passe, role } = req.body;
  if (!username || !email || !mot_de_passe || !role) {
    return res.status(400).json({ error: "Champs requis: username, email, mot_de_passe, role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const sql = "INSERT INTO utilisateurs (username, email, mot_de_passe, role) VALUES (?, ?, ?, ?)";
    const [result] = await promisePool.execute(sql, [username, email, hashedPassword, role]);
    res.status(201).json({ id: result.insertId, username, email, role });
  } catch (err) {
    console.error("❌ Erreur ajout utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Modifier un utilisateur (sauf mot de passe)
app.put("/api/utilisateurs/:id", async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  try {
    const sql = "UPDATE utilisateurs SET email = ?, role = ? WHERE id = ?";
    const [result] = await promisePool.execute(sql, [email, role, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ id, email, role });
  } catch (err) {
    console.error("❌ Erreur modif utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier mot de passe
app.put("/api/utilisateurs/:id/password", async (req, res) => {
  const { id } = req.params;
  const { mot_de_passe } = req.body;

  if (!mot_de_passe) return res.status(400).json({ error: "Mot de passe requis" });

  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const sql = "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?";
    await promisePool.execute(sql, [hashedPassword, id]);
    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error("❌ Erreur update mot de passe:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer un utilisateur
app.delete("/api/utilisateurs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM utilisateurs WHERE id = ?";
    const [result] = await promisePool.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    console.error("❌ Erreur suppression utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get all clients with types_ciment as array of objects
app.get("/api/clients", async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT c.id, c.sigle, c.nom_raison_sociale, c.adresse, c.famillecement, c.methodeessai,
             t.id AS typecement_id, t.code, t.description,
             f.id AS famille_id, f.code AS famille_code, f.nom AS famille_nom
      FROM clients c
      LEFT JOIN client_types_ciment ct ON c.id = ct.client_id
      LEFT JOIN types_ciment t ON ct.typecement_id = t.id
      LEFT JOIN familles_ciment f ON t.famille_id = f.id
      ORDER BY c.id
    `);

    const clients = rows.reduce((acc, row) => {
      let client = acc.find(c => c.id === row.id);
      if (!client) {
        client = {
          id: row.id,
          sigle: row.sigle,
          nom_raison_sociale: row.nom_raison_sociale,
          adresse: row.adresse,
          famillecement: row.famillecement,
          methodeessai: row.methodeessai,
          types_ciment: []
        };
        acc.push(client);
      }
      if (row.typecement_id) {
        client.types_ciment.push({
          id: row.typecement_id,
          code: row.code,
          description: row.description,
          famille: {
            id: row.famille_id,
            code: row.famille_code,
            nom: row.famille_nom
          }
        });
      }
      return acc;
    }, []);

    res.json(clients);
  } catch (err) {
    console.error("❌ Erreur SQL:", err);
    res.status(500).json({ error: err.message });
  }
});


// --- API Types Ciment --- //

// Get all cement types
app.get("/api/types_ciment", (req, res) => {
  const sql = "SELECT id, code, description FROM types_ciment ORDER BY code";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur SQL:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(result);
  });
});
// --- Add new client --- //
app.post("/api/clients", async (req, res) => {
  const { sigle, nom_raison_sociale, adresse, types_ciment } = req.body;

  if (!sigle || !nom_raison_sociale) {
    return res.status(400).json({ message: "Sigle et nom/raison sociale sont requis" });
  }

  try {
    // Start a transaction
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert the new client
      const sqlInsert = "INSERT INTO clients (sigle, nom_raison_sociale, adresse) VALUES (?, ?, ?)";
      const [result] = await connection.execute(sqlInsert, [sigle, nom_raison_sociale, adresse]);
      const clientId = result.insertId;

      // Insert cement type associations if any
      if (Array.isArray(types_ciment) && types_ciment.length > 0) {
        const sqlAssoc = "INSERT INTO client_types_ciment (client_id, typecement_id) VALUES ?";
        const values = types_ciment.map((typeId) => [clientId, typeId]);
        await connection.query(sqlAssoc, [values]);
      }

      // Commit transaction
      await connection.commit();
      
      // Get the complete client data with types
      const [clientRows] = await connection.execute(`
        SELECT c.id, c.sigle, c.nom_raison_sociale, c.adresse,
               t.id AS typecement_id, t.code, t.description
        FROM clients c
        LEFT JOIN client_types_ciment ct ON c.id = ct.client_id
        LEFT JOIN types_ciment t ON ct.typecement_id = t.id
        WHERE c.id = ?
      `, [clientId]);

      // Format the response
      const client = {
        id: clientId,
        sigle: sigle,
        nom_raison_sociale: nom_raison_sociale,
        adresse: adresse,
        types_ciment: []
      };

      clientRows.forEach(row => {
        if (row.typecement_id) {
          client.types_ciment.push({
            id: row.typecement_id,
            code: row.code,
            description: row.description
          });
        }
      });

      res.status(201).json(client);

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection
      connection.release();
    }

  } catch (err) {
    console.error("❌ Erreur ajout client:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du client" });
  }
});
// Add new cement type
app.post("/api/types_ciment", (req, res) => {
  const { code, description } = req.body;

  if (!code || !description) {
    return res.status(400).json({ message: "Code et description sont requis" });
  }

  const sql = "INSERT INTO types_ciment (code, description) VALUES (?, ?)";
  db.query(sql, [code, description], (err, result) => {
    if (err) {
      console.error("❌ Erreur insertion type ciment:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.json({ 
      id: result.insertId, 
      code, 
      description,
      message: "✅ Type de ciment ajouté avec succès" 
    });
  });
});

// Delete cement type
app.delete("/api/types_ciment/:id", (req, res) => {
  const typeId = req.params.id;

  // First check if this type is used by any client
  const sqlCheck = "SELECT COUNT(*) as count FROM client_types_ciment WHERE typecement_id = ?";
  db.query(sqlCheck, [typeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur vérification utilisation:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result[0].count > 0) {
      return res.status(400).json({ 
        message: "❌ Impossible de supprimer: ce type est utilisé par un ou plusieurs clients" 
      });
    }

    // If not used, proceed with deletion
    const sqlDelete = "DELETE FROM types_ciment WHERE id = ?";
    db.query(sqlDelete, [typeId], (err2, result2) => {
      if (err2) {
        console.error("❌ Erreur suppression type ciment:", err2);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (result2.affectedRows === 0) {
        return res.status(404).json({ message: "Type de ciment non trouvé" });
      }

      res.json({ message: "✅ Type de ciment supprimé avec succès" });
    });
  });
});


// --- Fin API Types Ciment --- //


// --- Modifier un client --- //
app.put("/api/clients/:id", async (req, res) => {
  const clientId = req.params.id;
  const { sigle, nom_raison_sociale, adresse, types_ciment } = req.body;

  try {
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Mettre à jour le client
      const sqlUpdate = `
        UPDATE clients 
        SET sigle = ?, nom_raison_sociale = ?, adresse = ? 
        WHERE id = ?`;
      await connection.execute(sqlUpdate, [sigle, nom_raison_sociale, adresse, clientId]);

      // 2. Supprimer les anciens types de ciment liés
      const sqlDeleteAssoc = "DELETE FROM client_types_ciment WHERE client_id = ?";
      await connection.execute(sqlDeleteAssoc, [clientId]);

      // 3. Réinsérer les nouveaux types
      if (Array.isArray(types_ciment) && types_ciment.length > 0) {
        const sqlAssoc = "INSERT INTO client_types_ciment (client_id, typecement_id) VALUES ?";
        const values = types_ciment.map((typeId) => [clientId, typeId]);
        await connection.query(sqlAssoc, [values]);
      }

      await connection.commit();
      connection.release();

      // Répondre avec succès
      res.json({ 
        message: "✅ Client modifié avec succès", 
        types_ciment: types_ciment || [] 
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("❌ Erreur modification client:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  } catch (err) {
    console.error("❌ Erreur connexion DB:", err);
    res.status(500).json({ message: "Erreur de connexion à la base de données" });
  }
});


// --- Delete a client ---
// --- Delete a client ---
app.delete("/api/clients/:id", async (req, res) => {
  const clientId = req.params.id;
  console.log(`🗑️ Tentative de suppression du client ID: ${clientId}`);

  try {
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. D'abord supprimer les échantillons associés à ce client
      const sqlDeleteEchantillons = `
        DELETE e 
        FROM echantillons e 
        JOIN client_types_ciment ct ON e.client_type_ciment_id = ct.id 
        WHERE ct.client_id = ?
      `;
      const [resultEchantillons] = await connection.execute(sqlDeleteEchantillons, [clientId]);
      console.log(`📊 Échantillons supprimés: ${resultEchantillons.affectedRows}`);

      // 2. Supprimer les associations types ciment
      const sqlDeleteAssoc = "DELETE FROM client_types_ciment WHERE client_id = ?";
      const [resultAssoc] = await connection.execute(sqlDeleteAssoc, [clientId]);
      console.log(`📊 Associations supprimées: ${resultAssoc.affectedRows}`);

      // 3. Supprimer le client
      const sqlDeleteClient = "DELETE FROM clients WHERE id = ?";
      const [resultClient] = await connection.execute(sqlDeleteClient, [clientId]);

      if (resultClient.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        console.log("❌ Client non trouvé");
        return res.status(404).json({ message: "Client non trouvé" });
      }

      await connection.commit();
      connection.release();
      
      console.log("✅ Client supprimé avec succès");
      return res.json({ 
        message: "✅ Client supprimé avec succès",
        deleted: {
          client: resultClient.affectedRows,
          echantillons: resultEchantillons.affectedRows,
          associations: resultAssoc.affectedRows
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("❌ Erreur suppression client (transaction):", error);
      return res.status(500).json({ 
        message: "Erreur serveur lors de la suppression du client",
        error: error.message 
      });
    }
  } catch (err) {
    console.error("❌ Erreur connexion DB:", err);
    return res.status(500).json({ 
      message: "Erreur de connexion à la base de données",
      error: err.message 
    });
  }
});


// --- Login --- //

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body; 
  // identifier can be email or username

  try {
    const sql = `SELECT * FROM utilisateurs WHERE email = ? OR username = ? LIMIT 1`;
    const [results] = await promisePool.execute(sql, [identifier, identifier]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.mot_de_passe);
    if (!match) {
      return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


app.post("/api/client_types_ciment", (req, res) => {
  const { clientId, typeCimentId } = req.body;

  if (!clientId || !typeCimentId) {
    return res.status(400).json({ message: "clientId and typeCimentId are required" });
  }

  const sql = "INSERT INTO client_types_ciment (client_id, typecement_id) VALUES (?, ?)";
  db.query(sql, [clientId, typeCimentId], (err, result) => {
    if (err) {
      console.error("❌ Erreur ajout type ciment:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.json({
      message: "✅ Type de ciment ajouté au client",
      clientId,
      typeCimentId,
    });
  });
});

// --- Results API --- //
app.post('/api/resultats', async (req, res) => {
  const data = req.body;

  try {
    const sql = `
      INSERT INTO resultats_essais (
        echantillon_id, date_prelevement, heure_prelevement,
        resistance_2j, resistance_7j, resistance_28j,
        debut_prise, stabilite_expansion, chaleur_hydratation,
        perte_feu, residu_insoluble, teneur_sulfate_so3,
        teneur_chlore_cl, c3a_clinker, ajouts, type_ajout
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.echantillon_id,
      data.date_prelevement,
      data.heure_prelevement,
      data.resistance_2j,
      data.resistance_7j,
      data.resistance_28j,
      data.debut_prise,
      data.stabilite_expansion,
      data.chaleur_hydratation,
      data.perte_feu,
      data.residu_insoluble,
      data.teneur_sulfate_so3,
      data.teneur_chlore_cl,
      data.c3a_clinker || null,
      data.ajouts || null,
      data.type_ajout || null
    ];

    const [result] = await promisePool.execute(sql, values);
    res.status(200).json({ message: "Résultat enregistré avec succès", id: result.insertId });
  } catch (err) {
    console.error("❌ Erreur d'insertion SQL:", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement" });
  }
});

app.get('/api/resultats', async (req, res) => {
  try {
    const sql = `SELECT * FROM resultats_essais ORDER BY id DESC`;
    const [results] = await promisePool.execute(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Erreur SQL lors de la récupération des résultats:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- API Produits d'un client --- //
app.get("/api/produits/:clientId", async (req, res) => {
  const clientId = req.params.clientId;

  try {
    const [rows] = await promisePool.query(
      `
      SELECT ct.id, t.code AS nom, t.description, t.sr,
             f.id AS famille_id, f.code AS famille_code, f.nom AS famille_nom
      FROM client_types_ciment ct
      JOIN types_ciment t ON ct.typecement_id = t.id
      JOIN familles_ciment f ON t.famille_id = f.id
      WHERE ct.client_id = ?
      ORDER BY t.code
      `,
      [clientId]
    );

    const produits = rows.map(row => ({
      id: row.id,
      nom: row.nom,
      description: row.description,
      sr: row.sr,
      famille: {
        id: row.famille_id,
        code: row.famille_code,
        nom: row.famille_nom
      }
    }));

    res.json(produits);
  } catch (err) {
    console.error("❌ Erreur SQL produits:", err);
    res.status(500).json({ error: "Erreur serveur lors du chargement des produits" });
  }
});

// Ajoutez cette route TEMPORAIREMENT pour debugger
app.get("/api/clients/:id/traitements", async (req, res) => {
  const clientId = req.params.id;
  console.log(`🔍 Vérification traitements pour client ID: ${clientId}`);

  try {
    // Vérifier DIRECTEMENT dans la table echantillons via client_types_ciment
    const sql = `
      SELECT COUNT(*) as count 
      FROM echantillons e
      JOIN client_types_ciment ct ON e.client_type_ciment_id = ct.id
      WHERE ct.client_id = ?
    `;

    const [results] = await promisePool.execute(sql, [clientId]);
    const hasTraitements = results[0].count > 0;
    
    console.log(`📊 Client ${clientId} a ${results[0].count} échantillons dans la table echantillons`);

    res.json({ 
      success: true,
      hasTraitements: hasTraitements,
      count: results[0].count
    });
  } catch (err) {
    console.error("❌ Erreur vérification traitements:", err);
    res.status(500).json({ 
      success: false,
      error: "Erreur serveur" 
    });
  }
});



app.get("/api/clients/:sigle", async (req, res) => {
  const sigle = req.params.sigle;

  try {
    const sql = `
      SELECT c.id, c.sigle, c.nom_raison_sociale, c.adresse,
             t.id AS type_ciment_id, t.code AS type_ciment_code, t.description AS type_ciment_description,
             f.id AS famille_id, f.code AS famille_code, f.nom AS famille_nom
      FROM clients c
      LEFT JOIN client_types_ciment ct ON c.id = ct.client_id
      LEFT JOIN types_ciment t ON ct.typecement_id = t.id
      LEFT JOIN familles_ciment f ON t.famille_id = f.id
      WHERE c.sigle = ?
    `;

    const [results] = await promisePool.execute(sql, [sigle]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Format the response to group types by client
    const client = {
      id: results[0].id,
      sigle: results[0].sigle,
      nom_raison_sociale: results[0].nom_raison_sociale,
      adresse: results[0].adresse,
      types_ciment: []
    };

    // Add all cement types for this client with famille information
    results.forEach(row => {
      if (row.type_ciment_id) {
        client.types_ciment.push({
          id: row.type_ciment_id,
          code: row.type_ciment_code,
          description: row.type_ciment_description,
          famille: {
            id: row.famille_id,
            code: row.famille_code,
            nom: row.famille_nom
          }
        });
      }
    });

    res.json(client);
  } catch (err) {
    console.error("❌ Error fetching client info:", err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/clients/:sigle/types-ciment", async (req, res) => {
  const sigle = req.params.sigle;

  try {
    const sql = `
      SELECT t.id, t.code, t.description, t.sr,
             f.id AS famille_id, f.code AS famille_code, f.nom AS famille_nom
      FROM clients c
      JOIN client_types_ciment ct ON c.id = ct.client_id
      JOIN types_ciment t ON ct.typecement_id = t.id
      JOIN familles_ciment f ON t.famille_id = f.id
      WHERE c.sigle = ?
      ORDER BY t.code
    `;

    const [results] = await promisePool.execute(sql, [sigle]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Client not found or no cement types assigned" });
    }

    const types_ciment = results.map(row => ({
      id: row.id,
      code: row.code,
      description: row.description,
      sr: row.sr,
      famille: {
        id: row.famille_id,
        code: row.famille_code,
        nom: row.famille_nom
      }
    }));

    res.json({
      client_sigle: sigle,
      types_ciment: types_ciment
    });
  } catch (err) {
    console.error("❌ Error fetching client cement types:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// --- API Produits par client --- //
app.get('/api/echantillons', async (req, res) => {
  try {
    const { client_id, client_type_ciment_id, phase, start, end } = req.query;
    if (!client_id) return res.status(400).json({ error: 'client_id required' });

    let sql = `
      SELECT e.*, t.code AS type_ciment_code, t.description AS type_ciment_desc
      FROM echantillons e
      JOIN client_types_ciment ct ON e.client_type_ciment_id = ct.id
      JOIN types_ciment t ON ct.typecement_id = t.id
      WHERE ct.client_id = ?
    `;
    const params = [client_id];

    if (client_type_ciment_id) {
      sql += ' AND e.client_type_ciment_id = ?';
      params.push(client_type_ciment_id);
    }
    if (phase) {
      sql += ' AND e.phase = ?';
      params.push(phase);
    }
    if (start) {
      sql += ' AND e.date_test >= ?';
      params.push(start);
    }
    if (end) {
      sql += ' AND e.date_test <= ?';
      params.push(end);
    }
    sql += ' ORDER BY e.date_test ASC, e.id ASC';

    const [rows] = await promisePool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur SQL:", err);
    res.status(500).json({ error: 'DB error' });
  }
});


/* --- Bulk insert (import) endpoint --- */
/* --- Bulk insert (import) endpoint - CORRECTED VERSION --- */
app.post('/api/echantillons/bulk', async (req, res) => {
  try {
    const { client_id, client_type_ciment_id = null, phase = null, rows } = req.body;
    if (!client_id || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'client_id and rows are required' });
    }

    // Validate client_type_ciment_id belongs to client_id
    if (client_type_ciment_id) {
      const checkSql = `SELECT COUNT(*) as count FROM client_types_ciment WHERE id = ? AND client_id = ?`;
      const [checkResult] = await promisePool.execute(checkSql, [client_type_ciment_id, client_id]);
      if (checkResult[0].count === 0) {
        return res.status(400).json({ error: 'Invalid client_type_ciment_id for this client' });
      }
    }

    const columns = [
      'client_type_ciment_id', 'phase', 'num_ech', 'date_test', 'heure_test',
      'rc2j', 'rc7j', 'rc28j', 'prise', 'stabilite', 'hydratation', 
      'pfeu', 'r_insoluble', 'so3', 'chlorure', 'c3a', 'ajout_percent', 
      'type_ajout', 'source'
    ];

    const values = [];
    const placeholders = [];

    for (const r of rows) {
      let date_test = r.date_test;
      if (!date_test) date_test = new Date().toISOString().split('T')[0];
      if (typeof date_test === 'string' && date_test.includes('/')) {
        const [d, m, y] = date_test.split('/');
        date_test = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      }

      const rowVals = [
        client_type_ciment_id,
        phase,
        r.num_ech || `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date_test,
        null, // heure_test
        r.rc2j ? parseFloat(r.rc2j) : null,
        r.rc7j ? parseFloat(r.rc7j) : null,
        r.rc28j ? parseFloat(r.rc28j) : null,
        r.prise ? parseFloat(r.prise) : null,
        r.stabilite ? parseFloat(r.stabilite) : null,
        r.hydratation ? parseFloat(r.hydratation) : null,
        r.pfeu ? parseFloat(r.pfeu) : null,
        r.r_insoluble ? parseFloat(r.r_insoluble) : null,
        r.so3 ? parseFloat(r.so3) : null,
        r.chlorure ? parseFloat(r.chlorure) : null,
        r.c3a ? parseFloat(r.c3a) : null,
        r.ajout_percent ? parseFloat(r.ajout_percent) : null,
        r.type_ajout || null,
        r.source || 'import'
      ];

      values.push(...rowVals);
      placeholders.push(`(${columns.map(() => '?').join(',')})`);
    }

    const sql = `INSERT INTO echantillons (${columns.join(',')}) VALUES ${placeholders.join(',')}`;

    const [result] = await promisePool.query(sql, values);
    res.json({ inserted: result.affectedRows });
  } catch (err) {
    console.error("❌ Erreur bulk insert:", err);
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

/* --- Update an echantillon --- */
app.put('/api/echantillons/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const fields = req.body;
    const allowed = ['num_ech','date_test','rc2j','rc7j','rc28j','prise','stabilite','hydratation','pfeu','r_insoluble','so3','chlorure','c3a','ajout_percent','type_ajout','phase','produit_id'];
    const updates = [];
    const params = [];
    for (const k of Object.keys(fields)) {
      if (allowed.includes(k)) {
        updates.push(`${k} = ?`);
        params.push(fields[k]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updatable fields' });
    params.push(id);
    const sql = `UPDATE echantillons SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await promisePool.query(sql, params);
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error("❌ Erreur update:", err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* --- Delete an echantillon --- */
app.delete('/api/echantillons/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM echantillons WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.affectedRows });
  } catch (err) {
    console.error("❌ Erreur delete:", err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ... existing code ...

// Import Excel rows into echantillons - UPDATED VERSION
app.post("/api/echantillons/import", async (req, res) => {
  try {
    const { clientId, produitId, rows } = req.body;

    console.log("📥 Début import - données reçues:", { 
      clientId, 
      produitId, 
      rowsCount: rows ? rows.length : 0 
    });

    // Check if all necessary parameters are provided
    if (!clientId || !produitId || !rows) {
      return res.status(400).json({ error: "Paramètres manquants: clientId, produitId ou rows" });
    }

    // Validate that produitId exists in client_types_ciment
    const checkSql = `SELECT COUNT(*) as count FROM client_types_ciment WHERE id = ?`;
    const [checkResult] = await promisePool.execute(checkSql, [produitId]);
    
    if (checkResult[0].count === 0) {
      return res.status(400).json({ error: `Produit ID ${produitId} non trouvé` });
    }

    console.log("✅ Produit validé, préparation des données...");

    // Préparer les données pour l'insertion - SANS heure_test
    const values = rows.map((row, index) => {
      console.log(`📝 Traitement ligne ${index}:`, row);
      
      return [
        parseInt(produitId),                    // client_type_ciment_id
        row.phase || 'situation_courante',      // phase
        row.num_ech || `ECH-${Date.now()}-${index}`, // num_ech avec valeur par défaut
        row.date_test || null,                  // date_test
        // ⚠️ HEURE_TEST SUPPRIMÉ - NE PAS L'INCLURE
        row.rc2j && !isNaN(parseFloat(row.rc2j)) ? parseFloat(row.rc2j) : null,
        row.rc7j && !isNaN(parseFloat(row.rc7j)) ? parseFloat(row.rc7j) : null,
        row.rc28j && !isNaN(parseFloat(row.rc28j)) ? parseFloat(row.rc28j) : null,
        row.prise && !isNaN(parseFloat(row.prise)) ? parseFloat(row.prise) : null,
        row.stabilite && !isNaN(parseFloat(row.stabilite)) ? parseFloat(row.stabilite) : null,
        row.hydratation && !isNaN(parseFloat(row.hydratation)) ? parseFloat(row.hydratation) : null,
        row.pfeu && !isNaN(parseFloat(row.pfeu)) ? parseFloat(row.pfeu) : null,
        row.r_insoluble && !isNaN(parseFloat(row.r_insoluble)) ? parseFloat(row.r_insoluble) : null,
        row.so3 && !isNaN(parseFloat(row.so3)) ? parseFloat(row.so3) : null,
        row.chlorure && !isNaN(parseFloat(row.chlorure)) ? parseFloat(row.chlorure) : null,
        row.c3a && !isNaN(parseFloat(row.c3a)) ? parseFloat(row.c3a) : null,
        row.ajout_percent && !isNaN(parseFloat(row.ajout_percent)) ? parseFloat(row.ajout_percent) : null,
        row.type_ajout || null,
        row.source || null
      ];
    });

    console.log("📋 Données formatées pour insertion:", values.slice(0, 2)); // Afficher seulement les 2 premières

    // SQL query CORRIGÉE - colonnes exactes de votre table
    const sql = `
      INSERT INTO echantillons 
      (
        client_type_ciment_id, phase, num_ech, date_test, 
        rc2j, rc7j, rc28j, prise, stabilite, hydratation, pfeu, r_insoluble, 
        so3, chlorure, c3a, ajout_percent, type_ajout, source
      ) 
      VALUES ?
    `;

    console.log("🚀 Exécution requête SQL...");
    
    // Execute the query
    const [result] = await promisePool.query(sql, [values]);
    
    console.log("✅ SUCCÈS:", result.affectedRows, "lignes insérées");
    
    res.json({ 
      success: true, 
      insertedRows: result.affectedRows,
      message: `${result.affectedRows} échantillon(s) importé(s) avec succès`
    });

  } catch (err) {
    console.error("❌ ERREUR IMPORT:", {
      message: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: "Erreur lors de l'import", 
      details: err.message,
      sqlMessage: err.sqlMessage 
    });
  }
});

// Save modifications - UPDATED VERSION
app.post("/api/echantillons/save", async (req, res) => {
  try {
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Données invalides" });
    }

    for (const row of rows) {
      const sql = `
        UPDATE echantillons 
        SET 
          num_ech = ?, date_test = ?, heure_test = ?,
          rc2j = ?, rc7j = ?, rc28j = ?,
          prise = ?, stabilite = ?, hydratation = ?,
          pfeu = ?, r_insoluble = ?, so3 = ?, chlorure = ?,
          c3a = ?, ajout_percent = ?, type_ajout = ?
        WHERE id = ?
      `;

      await promisePool.execute(sql, [
        row.num_ech || null,
        row.date_test || null,
        row.heure_test || null, // NOW INCLUDED
        parseFloat(row.rc2j) || null,
        parseFloat(row.rc7j) || null,
        parseFloat(row.rc28j) || null,
        parseFloat(row.prise) || null,
        parseFloat(row.stabilite) || null,
        parseFloat(row.hydratation) || null,
        parseFloat(row.pfeu) || null,
        parseFloat(row.r_insoluble) || null,
        parseFloat(row.so3) || null,
        parseFloat(row.chlorure) || null,
        parseFloat(row.c3a) || null,
        parseFloat(row.ajout_percent) || null, // NOW INCLUDED
        row.type_ajout || null,
        row.id
      ]);
    }

    res.json({ success: true, message: "Données sauvegardées avec succès" });
  } catch (err) {
    console.error("Erreur sauvegarde:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

// ... existing code ...

// Delete rows
// Delete rows - ENHANCED VERSION
app.post("/api/echantillons/delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Aucun ID fourni" });
    }

    // Validate IDs are numbers
    const validIds = ids.filter(id => !isNaN(parseInt(id)));
    if (validIds.length === 0) {
      return res.status(400).json({ error: "IDs invalides" });
    }

    const placeholders = validIds.map(() => '?').join(',');
    const sql = `DELETE FROM echantillons WHERE id IN (${placeholders})`;
    
    const [result] = await promisePool.query(sql, validIds);
    
    res.json({ 
      success: true, 
      deletedRows: result.affectedRows,
      message: `${result.affectedRows} échantillon(s) supprimé(s) avec succès`
    });
  } catch (err) {
    console.error("Erreur suppression:", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression" });
  }
});





app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});