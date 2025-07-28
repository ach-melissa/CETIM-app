const mysql = require('mysql2');
const fs = require('fs');

// Connect to MySQL (adjust credentials)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // ← vérifie que c’est le bon mot de passe !
  multipleStatements: true
});


// Read SQL schema
const schema = fs.readFileSync('./schema.sql', 'utf8');


// Run schema
connection.query(schema, (err, results) => {
  if (err) {
    console.error("❌ Failed to run SQL:", err);
  } else {
    console.log("✅ Database and table created successfully.");
  }
  connection.end();
});
