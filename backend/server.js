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




// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = `SELECT * FROM utilisateurs WHERE email = ? LIMIT 1`;
    const [results] = await promisePool.execute(sql, [email]);
    
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

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Database error" });
  }
});































// Get parameters for a specific category
app.get('/api/proprietes/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    // Query your database for parameters in this category
    const [rows] = await req.connection.execute(
      'SELECT * FROM parameters WHERE category_id = ?', 
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parameter details for custom categories
app.get('/api/proprietes/details/:categoryId/:paramId', async (req, res) => {
  try {
    const { categoryId, paramId } = req.params;
    // Query your database for parameter details
    const [rows] = await req.connection.execute(
      'SELECT * FROM parameter_details WHERE category_id = ? AND parameter_id = ?', 
      [categoryId, paramId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all mechanical properties with cement type information
// Get all mechanical properties
app.get('/api/proprietes/mecaniques', async (req, res) => {
  try {
    const [rows] = await req.connection.execute(`
      SELECT 
        id,
        nom,
        unite
      FROM proprietes_mecaniques
      ORDER BY nom
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mechanical properties details for a specific parameter
app.get('/api/proprietes/mecaniques/details/:paramId', async (req, res) => {
  try {
    const { paramId } = req.params;
    
    // Determine which column to select based on parameter ID
    let resistanceColumn = 'resistance_28j_min';
    if (paramId === 'resistance_2j') resistanceColumn = 'resistance_2j_min';
    if (paramId === 'resistance_7j') resistanceColumn = 'resistance_7j_min';
    
    const [rows] = await req.connection.execute(`
      SELECT 
        fc.code AS famille_code,
        tc.code AS type_code,
        cr.classe,
        pm.${resistanceColumn} AS resistance_min,
        pm.resistance_28j_sup AS resistance_max,
        pm.garantie_28j AS garantie
      FROM proprietes_mecaniques pm
      JOIN classes_resistance cr ON pm.classe_resistance_id = cr.id
      JOIN types_ciment_classes tcc ON cr.id = tcc.classe_resistance_id
      JOIN types_ciment tc ON tcc.type_ciment_id = tc.id
      JOIN familles_ciment fc ON tc.famille_id = fc.id
      WHERE pm.${resistanceColumn} IS NOT NULL
      ORDER BY fc.code, tc.code, cr.classe
    `);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Similar endpoints for physical and chemical properties...




















































// Results API (using promise version)
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






// Start server
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
