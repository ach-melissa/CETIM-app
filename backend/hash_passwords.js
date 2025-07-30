// hash_passwords.js
const bcrypt = require('bcrypt');

const users = [
  { email: 'admin@cetim.dz', password: 'mayssa123' },
  { email: 'user@cetim.dz', password: 'melissa123' }
];

users.forEach(({ email, password }) => {
  bcrypt.hash(password, 10).then(hash => {
    console.log(`Email: ${email}`);
    console.log(`Hashed password: ${hash}`);
    console.log('----------------------------');
  });
});

