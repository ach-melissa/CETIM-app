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

// ✅ Login API (POST)
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

// ✅ Insert test result (POST)
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

// ✅ Get all results (GET)
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



// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
