const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'cetim_user',
  password: 'cetim123',
  database: 'ciment_conformite'
});


app.post('/api/echantillons', (req, res) => {
  const data = req.body;
  console.log("🔍 Données reçues :", data);

  const sql = `
    INSERT INTO echantillons (
      date_prelevement, heure, num_echantillon,
      rc_2j, rc_7j, rc_28j, debut_prise, stabilite,
      chaleur_hydratation, perte_au_feu, residu_insoluble,
      so3, cl, c3a_clinker, ajouts, type_ajout
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.date_prelevement, data.heure, data.num_echantillon,
    data.rc_2j, data.rc_7j, data.rc_28j, data.debut_prise, data.stabilite,
    data.chaleur_hydratation, data.perte_au_feu, data.residu_insoluble,
    data.so3, data.cl, data.c3a_clinker, data.ajouts, data.type_ajout
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Erreur insertion :", err);
      return res.status(500).json({ error: "Erreur insertion" });
    }
    res.status(201).json({ message: "✅ Données enregistrées avec succès" });
  });
});

app.post('/api/echantillons', (req, res) => {
  const { numero_lot, date_analyse, type_ciment, nom_laboratoire } = req.body;

  const sql = `
    INSERT INTO echantillons (numero_lot, date_analyse, type_ciment, nom_laboratoire)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [numero_lot, date_analyse, type_ciment, nom_laboratoire], (err, result) => {
    if (err) {
      console.error("Erreur insertion échantillon :", err);
      return res.status(500).json({ error: "Erreur insertion" });
    }
    res.status(201).json({ message: "Échantillon enregistré", id: result.insertId });
  });
});

res.status(201).json({ 
  message: "Échantillon enregistré", 
  id: result.insertId 
});


app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
