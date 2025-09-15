// hash_passwords.js
// imports the bcrypt library (used for hashing passwords)
const bcrypt = require('bcrypt');

//2 user objects eache with (email , password)
const users = [
  { email: 'infomely@gmail.com', password: 'mrhamza' },
  { email: 'info@gmail.com', password: 'mrszakia' }
];

/* Get their email and password (hamza , zakia), Hash the password with bcrypt , Print the email and the hashed password */
users.forEach(({ email, password }) => {
  bcrypt.hash(password, 10).then(hash => {
    console.log(`Email: ${email}`);
    console.log(`Hashed password: ${hash}`);
    console.log('----------------------------');
  });
});

