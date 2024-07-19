const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key', // Replace with a long random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production with HTTPS
}));

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
            const user = results[0];
            req.session.userId = user.id; // Store userId in session
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

// Add a user
app.post('/users', (req, res) => {
  const newUser = req.body;
  const query = 'INSERT INTO users SET ?';
  db.query(query, newUser, (err, result) => {
    if (err) throw err;
    res.json({ message: 'User added successfully', id: result.insertId });
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

// Delete a user
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, userId, (err, result) => {
    if (err) throw err;
    res.json({ message: 'User deleted successfully' });
  });
});

// Endpoint to fetch active user information
app.get('/active-user', (req, res) => {
    console.log('Session:', req.session);
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            res.json({ username: user.username, email: user.email });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});


// Endpoint to handle logout
app.post('/logout', (req, res) => {
    // Handle logout logic (clear session, tokens, etc.)
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
