// imports the bcrypt library (used for hashing passwords)
const bcrypt = require('bcrypt');

//2 user objects eache with (email , password)
const users = [
  { email: 'admin@cetim.dz', password: 'mayssa123' },
  { email: 'user@cetim.dz', password: 'melissa123' }
];

/* Get their email and password (mayssa123 , melissa123 ), Hash the password with bcrypt , Print the email and the hashed password */
users.forEach(({ email, password }) => {
  bcrypt.hash(password, 10).then(hash => {
    console.log(`Email: ${email}`);
    console.log(`Hashed password: ${hash}`);
    console.log('----------------------------');
  });
});

