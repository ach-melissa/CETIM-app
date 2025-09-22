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
      SELECT ct.id, t.code AS nom, t.description
      FROM client_types_ciment ct
      JOIN types_ciment t ON ct.typecement_id = t.id
      WHERE ct.client_id = ?
      ORDER BY t.code
      `,
      [clientId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur SQL produits:", err);
    res.status(500).json({ error: "Erreur serveur lors du chargement des produits" });
  }
});


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
app.post('/api/echantillons/bulk', async (req, res) => {
  try {
    const { client_id, client_type_ciment_id = null, phase = null, rows } = req.body;
    if (!client_id || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'client_id and rows are required' });
    }

    const columns = [
      'client_id', 'produit_id', 'phase', 'num_ech', 'date_test', 'rc2j', 'rc7j', 'rc28j',
      'prise', 'stabilite', 'hydratation', 'pfeu', 'r_insoluble', 'so3', 'chlorure',
      'c3a', 'ajout_percent', 'type_ajout', 'source'
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
        client_id,
        produit_id,
        phase,
        r.num_ech || `IMP-${Date.now()}`,
        date_test,
        r.rc2j || null,
        r.rc7j || null,
        r.rc28j || null,
        r.prise || null,
        r.stabilite || null,
        r.hydratation || null,
        r.pfeu || null,
        r.r_insoluble || null,
        r.so3 || null,
        r.chlorure || null,
        r.c3a || null,
        r.ajout_percent || null,
        r.type_ajout || null,
        'import'
      ];

      values.push(...rowVals);
      placeholders.push(`(${columns.map(() => '?').join(',')})`);
    }

    const sql = `INSERT IGNORE INTO echantillons (${columns.join(',')}) VALUES ${placeholders.join(',')}`;

    const [result] = await promisePool.query(sql, values);
    res.json({ inserted: result.affectedRows });
  } catch (err) {
    console.error("❌ Erreur bulk insert:", err);
    res.status(500).json({ error: 'DB error' });
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
// Import Excel rows into echantillons
app.post("/api/echantillons/import", (req, res) => {
  try {
    const { clientId, produitId, rows } = req.body;

    // Check if all necessary parameters are provided
    if (!clientId || !produitId || !rows) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    // Insert data into the echantillons table
    const values = rows.map((row) => [
      produitId, // This should refer to the client_type_ciment_id
      row.phase || null,
      row.num_ech || null,
      row.date_test || null,
      row.rc2j || null,
      row.rc7j || null,
      row.rc28j || null,
      row.prise || null,
      row.stabilite || null,
      row.hydratation || null,
      row.pfeu || null,
      row.r_insoluble || null,
      row.so3 || null,
      row.chlorure || null,
      row.c3a || null,
      row.ajout_percent || null,
      row.type_ajout || null,
      row.source || null,
    ]);

    // SQL query to insert data into the echantillons table
    const sql = `
      INSERT INTO echantillons 
      (client_type_ciment_id, phase, num_ech, date_test, rc2j, rc7j, rc28j, prise, stabilite, hydratation, pfeu, r_insoluble, so3, chlorure, c3a, ajout_percent, type_ajout, source)
      VALUES ?
    `;

    // Execute the query
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Erreur import:", err);
        return res.status(500).json({ error: "Erreur serveur", details: err.message });
      }
      res.json({ success: true, insertedRows: result.affectedRows });
    });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});





// Save modifications
app.post("/api/echantillons/save", async (req, res) => {
  try {
    const { rows } = req.body;
    if (!rows) return res.status(400).json({ error: "Pas de données" });

    for (const row of rows) {
      const sql = `
        UPDATE echantillons SET 
          rc2j=?, rc7j=?, rc28j=?, prise=?, stabilite=?, hydratation=?, 
          pfeu=?, r_insoluble=?, so3=?, chlorure=?, c3a=?, ajout_percent=?, 
          type_ajout=?
        WHERE id=?
      `;
      await promisePool.execute(sql, [
        row.rc2j, row.rc7j, row.rc28j, row.prise, row.stabilite, row.hydratation,
        row.pfeu, row.r_insoluble, row.so3, row.chlorure, row.c3a, row.ajout_percent,
        row.type_ajout, row.id
      ]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur sauvegarde:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Delete rows
app.post("/api/echantillons/delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) return res.status(400).json({ error: "Pas d'IDs" });

    const sql = `DELETE FROM echantillons WHERE id IN (?)`;
    await promisePool.query(sql, [ids]);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur suppression:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});