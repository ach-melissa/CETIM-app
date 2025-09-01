const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = "cetim_secret_key";

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'cetim_user',
  password: 'cetim123',
  database: 'ciment_conformite'
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to database');
});

// ======================================================
// 🔐 AUTHENTICATION
// ======================================================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM utilisateurs WHERE email = ? LIMIT 1`;
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.mot_de_passe);

    if (!match) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    console.log("✅ Login successful for:", user.email, "Role:", user.role);
    res.json({ token, role: user.role });
  });
});

// ======================================================
// 🧪 RESULTATS D'ESSAIS
// ======================================================
app.post('/api/resultats', (req, res) => {
  const data = req.body;

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

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Erreur d'insertion SQL:", err);
      return res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
    res.status(200).json({ message: "Résultat enregistré avec succès" });
  });
});

app.get('/api/resultats', (req, res) => {
  const sql = `SELECT * FROM resultats_essais ORDER BY id DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL lors de la récupération des résultats:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.status(200).json(results);
  });
});

// ======================================================
// 📏 PARAMETRES DE LA NORME (categories, parametres, limites)
// ======================================================

// Get parameters WITH their limits (nested)
app.get('/api/parametres-with-limites', (req, res) => {
  const { categorie } = req.query;

  let sql = `
    SELECT 
      p.id AS parametre_id,
      p.nom AS nom,
      p.unite AS unite,
      c.nom AS categorie,
      l.id AS limite_id,
      l.ciment_type,
      l.classe,
      l.limite_inf,
      l.limite_sup,
      l.limite_garantie,
      l.commentaire
    FROM parametres p
    JOIN categories c ON c.id = p.categorie_id
    LEFT JOIN limites l ON l.parametre_id = p.id
  `;
  const params = [];

  if (categorie && categorie !== 'tous') {
    sql += ` WHERE c.nom = ? `;
    params.push(categorie);
  }

  sql += ` ORDER BY c.nom, p.nom, l.ciment_type, l.classe`;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("❌ Erreur SQL:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    // Nest limits under each parameter
    const data = [];
    const map = {};

    rows.forEach(r => {
      if (!map[r.parametre_id]) {
        map[r.parametre_id] = {
          id: r.parametre_id,
          nom: r.nom,
          unite: r.unite,
          categorie: r.categorie,
          limites: []
        };
        data.push(map[r.parametre_id]);
      }

      if (r.limite_id) {
        map[r.parametre_id].limites.push({
          id: r.limite_id,
          ciment_type: r.ciment_type,
          classe: r.classe,
          limite_inf: r.limite_inf,
          limite_sup: r.limite_sup,
          limite_garantie: r.limite_garantie,
          commentaire: r.commentaire
        });
      }
    });

    res.json(data);
  });
});



// ✅ Get client + cement parameters
app.get("/api/clients/:sigle", (req, res) => {
  const sigle = req.params.sigle;

  const sql = `
    SELECT c.id, c.sigle, c.nom_raison_sociale, c.adresse,
           p.type_ciment, p.classe_resistance, p.court_terme,
           p.min_rc_2j, p.min_rc_7j, p.min_rc_28j,
           p.min_debut_prise, p.max_stabilite, p.max_chaleur_hydratation,
           p.max_perte_au_feu, p.max_residu_insoluble, p.max_so3,
           p.max_chlorure, p.max_c3a, p.exigence_pouzzolanicite,
           p.is_lh, p.is_sr
    FROM clients c
    LEFT JOIN parametres_ciment p ON c.parametres_id = p.id
    WHERE c.sigle = ?
  `;

  db.query(sql, [sigle], (err, result) => {
    if (err) {
      console.error("❌ Error fetching client info:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(result[0]); // return one row
  });
});





// ======================================================
// ✅ Start server
// ======================================================
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
