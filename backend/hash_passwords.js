// hash_passwords.js
const bcrypt = require('bcrypt');

// Users list with username, email, plain password, and role
const users = [
  { username: 'hamza', email: 'hamza@gmail.com', password: 'mrhamza', role: 'admin' },
  { username: 'zakia', email: 'zakia@gmail.com', password: 'mrszakia', role: 'user' }
];

// Hash passwords and generate SQL INSERT lines
(async () => {
  console.log("INSERT INTO utilisateurs (username, email, mot_de_passe, role) VALUES");
  
  for (const { username, email, password, role } of users) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`('${username}', '${email}', '${hash}', '${role}'),`);
  }
})();


