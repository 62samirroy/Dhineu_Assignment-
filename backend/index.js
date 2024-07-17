const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a connection to the database
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Sa629582#',
    database: 'loginapp'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        if (results.length > 0) {
            res.send({ message: 'Login successful' });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    });
});
// Fetch all users
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Update a user
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  const query = 'UPDATE users SET ? WHERE id = ?';
  db.query(query, [updatedUser, userId], (err, result) => {
    if (err) throw err;
    res.json({ message: 'User updated successfully' });
  });
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

