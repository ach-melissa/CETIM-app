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




// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await promisePool.execute('SELECT id, nom FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// Parameters API - FIXED VERSION
// Get details for a specific parameter
app.get('/api/parametres/:id', async (req, res) => {
  const { id } = req.params;
  const { categorie } = req.query;
  
  try {
    console.log('Fetching details for parameter:', id, 'in category:', categorie);
    
    // Get the specific parameter
    const [parameterResults] = await promisePool.execute(
      `SELECT pn.*, c.nom as categorie 
       FROM parametres_norme pn 
       JOIN categories c ON pn.categorie_id = c.id 
       WHERE pn.id = ? AND c.nom = ?`,
      [id, categorie]
    );
    
    if (parameterResults.length === 0) {
      return res.status(404).json({ error: 'Parameter not found' });
    }
    
    const parameter = parameterResults[0];
    
    // Get limits for this parameter
    const [limites] = await promisePool.execute(`
      SELECT 
        tc.code as ciment_type,
        CONCAT(cr.classe, ' ', cr.type_court_terme) as classe,
        vp.valeur_min as limite_inf,
        vp.valeur_max as limite_sup,
        vp.valeur_exacte as limite_garantie
      FROM valeurs_parametres vp
      LEFT JOIN types_ciment tc ON vp.type_ciment_id = tc.id
      LEFT JOIN classes_resistance cr ON vp.classe_id = cr.id
      WHERE vp.parametre_id = ?
      AND tc.code IS NOT NULL
      AND cr.classe IS NOT NULL
      ORDER BY tc.code, cr.classe
    `, [id]);
    
    console.log('Found', limites.length, 'limits for parameter', id);
    
    res.json({
      ...parameter,
      limites: limites || []
    });
    
  } catch (error) {
    console.error('Error fetching parameter details:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});




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

// Client info API
app.get("/api/clients/:sigle", async (req, res) => {
  const sigle = req.params.sigle;

  try {
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

    const [result] = await promisePool.execute(sql, [sigle]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    
    res.json(result[0]);
  } catch (err) {
    console.error("❌ Error fetching client info:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
