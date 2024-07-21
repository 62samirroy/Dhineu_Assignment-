const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');

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

const jwtSecret = 'your-jwt-secret'; // Replace with a long random string

app.post('/login', (req, res) => {
    const { username, password, rememberMe } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: rememberMe ? '7d' : '1h' });
            
            // Store token in active_tokens table
            db.query('INSERT INTO active_tokens (token, user_id) VALUES (?, ?)', [token, user.id], (err) => {
                if (err) {
                    console.error('Error storing token:', err);
                }
            });
            
            res.send({ message: 'Login successful', token, userId: user.id });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided' });
    }

    jwt.verify(token.replace('Bearer ', ''), jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// Fetch all users (protected route)
app.get('/users', verifyToken, (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add a user (protected route)
app.post('/users', verifyToken, (req, res) => {
    const newUser = req.body;
    const query = 'INSERT INTO users SET ?';
    db.query(query, newUser, (err, result) => {
        if (err) throw err;
        res.json({ message: 'User added successfully', id: result.insertId });
    });
});

// Update a user (protected route)
app.put('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;
    const query = 'UPDATE users SET ? WHERE id = ?';
    db.query(query, [updatedUser, userId], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User updated successfully' });
    });
});

// Delete a user (protected route)
app.delete('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, userId, (err, result) => {
        if (err) throw err;
        res.json({ message: 'User deleted successfully' });
    });
});

// Endpoint to handle logout
app.post('/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token) {
    db.query('DELETE FROM active_tokens WHERE token = ?', [token], (err) => {
      if (err) {
        console.error('Error removing token:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
      });
    });
  } else {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  }
});

app.get('/active-tokens/count', verifyToken, (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM active_tokens', (err, results) => {
        if (err) {
            console.error('Error fetching token count:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        res.json({ count: results[0].count });
    });
});

// Fetch a user by ID (protected route)
app.get('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    });
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
