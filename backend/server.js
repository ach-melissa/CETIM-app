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


// --- API Clients --- //
// Get all clients with types_ciment as array of objects
app.get("/api/clients", async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT c.id, c.sigle, c.nom_raison_sociale, c.adresse, c.famillecement, c.methodeessai,
             t.id AS typecement_id, t.code, t.description
      FROM clients c
      LEFT JOIN client_types_ciment ct ON c.id = ct.client_id
      LEFT JOIN types_ciment t ON ct.typecement_id = t.id
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
          description: row.description
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
app.put("/api/clients/:id", (req, res) => {
  const clientId = req.params.id;
  const { sigle, nom_raison_sociale, adresse, types_ciment } = req.body;

  const sqlUpdate = `
    UPDATE clients 
    SET sigle = ?, nom_raison_sociale = ?, adresse = ? 
    WHERE id = ?`;
  db.query(sqlUpdate, [sigle, nom_raison_sociale, adresse, clientId], (err, result) => {
    if (err) {
      console.error("❌ Erreur update client:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    // Supprimer les anciens types de ciment liés
    const sqlDeleteAssoc = "DELETE FROM client_types_ciment WHERE client_id = ?";
    db.query(sqlDeleteAssoc, [clientId], (err2) => {
      if (err2) {
        console.error("❌ Erreur suppression associations:", err2);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      // Réinsérer les nouveaux types (ids)
      if (Array.isArray(types_ciment) && types_ciment.length > 0) {
        const sqlAssoc = "INSERT INTO client_types_ciment (client_id, typecement_id) VALUES ?";
        const values = types_ciment.map((typeId) => [clientId, typeId]);

        db.query(sqlAssoc, [values], (err3) => {
          if (err3) {
            console.error("❌ Erreur ajout associations:", err3);
            return res.status(500).json({ message: "Erreur serveur" });
          }

          // Return success (optionally return updated client object)
          const sqlGet = `SELECT id, code, description FROM types_ciment WHERE id IN (?)`;
          db.query(sqlGet, [types_ciment], (err4, rows) => {
            if (err4) {
              console.error("❌ Erreur récupération types:", err4);
              return res.status(500).json({ message: "Erreur serveur" });
            }
            res.json({ message: "✅ Client modifié avec succès", types_ciment: rows });
          });
        });
      } else {
        // No types — respond success
        res.json({ message: "✅ Client modifié avec succès (sans types de ciment)", types_ciment: [] });
      }
    });
  });
});
// --- Delete a client ---
app.delete("/api/clients/:id", async (req, res) => {
  const clientId = req.params.id;

  try {
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove associations first
      const sqlDeleteAssoc = "DELETE FROM client_types_ciment WHERE client_id = ?";
      await connection.execute(sqlDeleteAssoc, [clientId]);

      // Delete the client
      const sqlDeleteClient = "DELETE FROM clients WHERE id = ?";
      const [result] = await connection.execute(sqlDeleteClient, [clientId]);

      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: "Client non trouvé" });
      }

      await connection.commit();
      connection.release();
      return res.json({ message: "✅ Client supprimé avec succès" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("❌ Erreur suppression client (transaction):", error);
      return res.status(500).json({ message: "Erreur serveur lors de la suppression du client" });
    }
  } catch (err) {
    console.error("❌ Erreur suppression client:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});


// --- Login --- //
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


// --- Client info API --- //
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


// --- Start server --- //
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
