// Assuming you have installed the necessary dependencies (express, jsonwebtoken, etc.)

const express = require('express');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')

const app = express();
const secretKey = 'secret';

app.use(bodyParser.json())

// Sample user data (in a real application, this would come from a database)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

// Middleware to check for authentication
function authenticateToken(req, res, next) {
    console.log("reqd",req)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
   console.log("token",token)
  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Token verification successful, store the user object in the request for future use
    req.user = user;
    next();
  });
}

// Login route to generate and return a JWT token
app.post('/login', (req, res) => {
    //console.log("Req",req)
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate and return a JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.cookie("token",token);
  res.json({ token });
});

// Protected route that requires authentication
app.get('/protected', authenticateToken, (req, res) => {
  // The request has been authenticated, and the user object is available in req.user
  res.json({ message: 'Protected route accessed', user: req.user });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
